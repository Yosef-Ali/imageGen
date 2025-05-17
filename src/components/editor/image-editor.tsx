"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { 
  Crop, 
  RotateCw, 
  Sliders, 
  ImageIcon, 
  Save, 
  Undo, 
  History, 
  X 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useImageGenStore } from "@/lib/store";
import { 
  applyEditsToCanvas, 
  canvasToDataURL, 
  dataURLToBase64, 
  createImageEdit 
} from "@/lib/image-editor";
import { ImageGeneration, GeneratedImage, ImageEdit } from "@/types";
import { CropTool } from "./tools/crop-tool";
import { RotateTool } from "./tools/rotate-tool";
import { FilterTool } from "./tools/filter-tool";
import { AdjustmentTool } from "./tools/adjustment-tool";
import { EditHistoryPanel } from "./edit-history-panel";

interface ImageEditorProps {
  generation: ImageGeneration;
  imageIndex: number;
  onClose: () => void;
  onSave: () => void;
}

export function ImageEditor({
  generation,
  imageIndex,
  onClose,
  onSave,
}: ImageEditorProps) {
  const { addImageEdit, setEditedImage, resetImageEdits } = useImageGenStore();
  const [activeTab, setActiveTab] = useState("crop");
  const [showHistory, setShowHistory] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const { toast } = useToast();

  const selectedImage = generation.images[imageIndex];
  const imageUrl = selectedImage.isEdited && selectedImage.editedUrl 
    ? selectedImage.editedUrl 
    : selectedImage.b64_json 
      ? `data:image/webp;base64,${selectedImage.b64_json}` 
      : selectedImage.url;

  // Initialize canvas when image loads
  useEffect(() => {
    if (!imageRef.current || !isImageLoaded || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas dimensions to match image
    canvas.width = imageRef.current.naturalWidth;
    canvas.height = imageRef.current.naturalHeight;

    // Draw image to canvas
    ctx.drawImage(imageRef.current, 0, 0, canvas.width, canvas.height);

    // Apply existing edits if any
    if (selectedImage.editHistory && selectedImage.editHistory.length > 0) {
      applyEditsToCanvas(canvas, ctx, imageRef.current, selectedImage.editHistory);
    }
  }, [isImageLoaded, selectedImage.editHistory]);

  function handleImageLoad() {
    setIsImageLoaded(true);
  }

  function handleSaveEdit() {
    if (!canvasRef.current) return;

    const dataUrl = canvasToDataURL(canvasRef.current);
    const base64 = dataURLToBase64(dataUrl);
    
    setEditedImage(generation.id, imageIndex, dataUrl, base64);
    
    toast({
      title: "Image Saved",
      description: "Your edited image has been saved.",
    });
    
    onSave();
  }

  function handleResetEdits() {
    resetImageEdits(generation.id, imageIndex);
    
    // Reset canvas to original image
    if (canvasRef.current && imageRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      
      // Reset canvas dimensions
      canvas.width = imageRef.current.naturalWidth;
      canvas.height = imageRef.current.naturalHeight;
      
      // Draw original image
      ctx.drawImage(imageRef.current, 0, 0, canvas.width, canvas.height);
    }
    
    toast({
      title: "Edits Reset",
      description: "All edits have been reset to the original image.",
    });
  }

  function handleApplyEdit(edit: ImageEdit) {
    if (!canvasRef.current || !imageRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // Add edit to store
    addImageEdit(generation.id, imageIndex, edit);
    
    // Apply edit to canvas
    const edits = [...(selectedImage.editHistory || []), edit];
    applyEditsToCanvas(canvas, ctx, imageRef.current, edits);
    
    toast({
      title: "Edit Applied",
      description: `${edit.description} has been applied to the image.`,
    });
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-xl font-semibold">Image Editor</h2>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowHistory(!showHistory)}
          >
            <History className="h-4 w-4 mr-2" />
            History
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetEdits}
          >
            <Undo className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button
            size="sm"
            onClick={handleSaveEdit}
          >
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className={`flex-1 ${showHistory ? 'w-3/4' : 'w-full'}`}>
          <div className="flex h-full">
            <div className="w-64 border-r p-4">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-4 w-full">
                  <TabsTrigger value="crop">
                    <Crop className="h-4 w-4" />
                  </TabsTrigger>
                  <TabsTrigger value="rotate">
                    <RotateCw className="h-4 w-4" />
                  </TabsTrigger>
                  <TabsTrigger value="filter">
                    <ImageIcon className="h-4 w-4" />
                  </TabsTrigger>
                  <TabsTrigger value="adjust">
                    <Sliders className="h-4 w-4" />
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="crop" className="mt-4">
                  <CropTool onApply={handleApplyEdit} />
                </TabsContent>
                
                <TabsContent value="rotate" className="mt-4">
                  <RotateTool onApply={handleApplyEdit} />
                </TabsContent>
                
                <TabsContent value="filter" className="mt-4">
                  <FilterTool onApply={handleApplyEdit} />
                </TabsContent>
                
                <TabsContent value="adjust" className="mt-4">
                  <AdjustmentTool onApply={handleApplyEdit} />
                </TabsContent>
              </Tabs>
            </div>
            
            <div className="flex-1 p-4 flex items-center justify-center bg-muted/30 overflow-auto">
              <div className="relative">
                {/* Hidden original image for reference */}
                <img
                  ref={imageRef}
                  src={imageUrl}
                  alt="Original"
                  className="hidden"
                  onLoad={handleImageLoad}
                />
                
                {/* Canvas for editing */}
                <canvas
                  ref={canvasRef}
                  className="max-w-full max-h-[70vh] object-contain"
                />
              </div>
            </div>
          </div>
        </div>
        
        {showHistory && (
          <div className="w-1/4 border-l p-4 overflow-y-auto">
            <EditHistoryPanel 
              generation={generation} 
              imageIndex={imageIndex} 
            />
          </div>
        )}
      </div>
    </div>
  );
}
