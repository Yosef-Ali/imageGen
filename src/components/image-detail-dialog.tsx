"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import {
  Copy,
  Download,
  RefreshCw,
  Heart,
  FolderOpen,
  Share2,
  Edit2,
  FileDown,
} from "lucide-react";
import { ShareDialog } from "@/components/sharing/share-dialog";
import { ImageEditorDialog } from "@/components/editor/image-editor-dialog";
import { ExportDialog } from "@/components/export-import/export-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { ImageGeneration } from "@/types";
import { useImageGenStore } from "@/lib/store";
import {
  generateImage,
  base64ToDataUrl,
  downloadImage,
  formatDate,
} from "@/lib/openai";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ImageDetailDialogProps {
  generation: ImageGeneration;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImageDetailDialog({
  generation,
  open,
  onOpenChange,
}: ImageDetailDialogProps) {
  const {
    apiKey,
    addGeneration,
    updateGeneration,
    collections,
    toggleFavorite,
  } = useImageGenStore();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showEditorDialog, setShowEditorDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const { toast } = useToast();

  const selectedImage = generation.images[selectedImageIndex];

  // Get collection name if image is in a collection
  const collectionName = useMemo(() => {
    if (!generation.collectionId) return null;
    const collection = collections.find(
      (c) => c.id === generation.collectionId
    );
    return collection ? collection.name : null;
  }, [generation.collectionId, collections]);

  function copyPrompt() {
    navigator.clipboard.writeText(generation.prompt);
    toast({
      title: "Prompt Copied",
      description: "The prompt has been copied to your clipboard.",
    });
  }

  function handleDownload() {
    if (!selectedImage || !selectedImage.b64_json) {
      toast({
        title: "Download Failed",
        description: "Image data is not available for download.",
        variant: "destructive",
      });
      return;
    }

    const dataUrl = base64ToDataUrl(selectedImage.b64_json);
    const filename = `image-gen-${generation.id}-${selectedImageIndex}.webp`;
    downloadImage(dataUrl, filename);
  }

  function handleToggleFavorite() {
    toggleFavorite(generation.id);
    toast({
      title: generation.favorite
        ? "Removed from Favorites"
        : "Added to Favorites",
      description: generation.favorite
        ? "Image has been removed from your favorites."
        : "Image has been added to your favorites.",
    });
  }

  function handleCollectionChange(collectionId: string | undefined) {
    updateGeneration(generation.id, { collectionId });

    if (collectionId) {
      const collection = collections.find((c) => c.id === collectionId);
      toast({
        title: "Added to Collection",
        description: `Image has been added to "${collection?.name}" collection.`,
      });
    } else {
      toast({
        title: "Removed from Collection",
        description: "Image has been removed from collection.",
      });
    }
  }

  async function handleRegenerate() {
    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please set your OpenAI API key in the settings.",
        variant: "destructive",
      });
      return;
    }

    setIsRegenerating(true);

    const newGeneration = {
      ...generation,
      id: Math.random().toString(36).substring(2, 15),
      createdAt: new Date().toISOString(),
      images: [],
      status: "pending" as const,
    };

    addGeneration(newGeneration);

    try {
      const images = await generateImage(
        apiKey,
        generation.prompt,
        generation.parameters
      );

      updateGeneration(newGeneration.id, {
        images,
        status: "completed",
      });

      toast({
        title: "Image Regenerated",
        description: "Your image has been successfully regenerated.",
      });

      onOpenChange(false);
    } catch (error) {
      updateGeneration(newGeneration.id, {
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error",
      });

      toast({
        title: "Regeneration Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsRegenerating(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Image Details</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {generation.status === "completed" && generation.images.length > 0 ? (
            <div className="relative aspect-square w-full max-h-[400px] overflow-hidden rounded-lg">
              <Image
                src={
                  selectedImage.b64_json
                    ? base64ToDataUrl(selectedImage.b64_json)
                    : selectedImage.url
                }
                alt={generation.prompt}
                fill
                className="object-contain"
              />

              {/* Favorite button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 bg-background/50 backdrop-blur-sm hover:bg-background/70 z-10"
                onClick={handleToggleFavorite}
              >
                <Heart
                  className={`h-5 w-5 ${
                    generation.favorite ? "fill-red-500 text-red-500" : ""
                  }`}
                />
                <span className="sr-only">
                  {generation.favorite
                    ? "Remove from favorites"
                    : "Add to favorites"}
                </span>
              </Button>
            </div>
          ) : generation.status === "pending" ? (
            <div className="aspect-square w-full flex items-center justify-center bg-muted rounded-lg">
              <div className="animate-pulse text-center">
                <p>Generating...</p>
              </div>
            </div>
          ) : (
            <div className="aspect-square w-full flex items-center justify-center bg-muted rounded-lg">
              <div className="text-center text-destructive">
                <p>Generation failed</p>
                <p className="text-sm mt-2">{generation.error}</p>
              </div>
            </div>
          )}

          {generation.images.length > 1 && (
            <div className="flex flex-wrap gap-2 justify-center">
              {generation.images.map((image, index) => (
                <button
                  key={index}
                  className={`relative w-16 h-16 rounded-md overflow-hidden border-2 ${
                    selectedImageIndex === index
                      ? "border-primary"
                      : "border-transparent"
                  }`}
                  onClick={() => setSelectedImageIndex(index)}
                >
                  <Image
                    src={
                      image.b64_json
                        ? base64ToDataUrl(image.b64_json)
                        : image.url
                    }
                    alt={`Variation ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          <div className="space-y-2">
            <h4 className="font-medium">Prompt</h4>
            <div className="relative">
              <p className="text-sm bg-muted p-3 rounded-md">
                {generation.prompt}
              </p>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-1 right-1"
                onClick={copyPrompt}
              >
                <Copy className="h-4 w-4" />
                <span className="sr-only">Copy prompt</span>
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Collection</h4>
            <div className="flex items-center space-x-2">
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
              <Select
                value={generation.collectionId || ""}
                onValueChange={(value) =>
                  handleCollectionChange(value || undefined)
                }
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select a collection" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {collections.map((collection) => (
                    <SelectItem key={collection.id} value={collection.id}>
                      {collection.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-1">Parameters</h4>
              <ul className="text-sm space-y-1">
                <li>
                  <span className="text-muted-foreground">Size:</span>{" "}
                  {generation.parameters.size}
                </li>
                <li>
                  <span className="text-muted-foreground">Quality:</span>{" "}
                  {generation.parameters.quality}
                </li>
                <li>
                  <span className="text-muted-foreground">Style:</span>{" "}
                  {generation.parameters.style}
                </li>
                <li>
                  <span className="text-muted-foreground">Count:</span>{" "}
                  {generation.parameters.n}
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-1">Details</h4>
              <ul className="text-sm space-y-1">
                <li>
                  <span className="text-muted-foreground">Created:</span>{" "}
                  {formatDate(generation.createdAt)}
                </li>
                <li>
                  <span className="text-muted-foreground">Status:</span>{" "}
                  {generation.status}
                </li>
                <li>
                  <span className="text-muted-foreground">Favorite:</span>{" "}
                  {generation.favorite ? "Yes" : "No"}
                </li>
                {collectionName && (
                  <li>
                    <span className="text-muted-foreground">Collection:</span>{" "}
                    {collectionName}
                  </li>
                )}
              </ul>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 justify-between mt-4">
            <Button
              variant="outline"
              onClick={handleRegenerate}
              disabled={isRegenerating || generation.status === "pending"}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              {isRegenerating ? "Regenerating..." : "Regenerate"}
            </Button>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowEditorDialog(true)}
                disabled={generation.status !== "completed" || !selectedImage}
              >
                <Edit2 className="mr-2 h-4 w-4" />
                Edit
              </Button>

              <Button
                variant="outline"
                onClick={() => setShowShareDialog(true)}
                disabled={generation.status !== "completed" || !selectedImage}
              >
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>

              <Button
                variant="outline"
                onClick={() => setShowExportDialog(true)}
                disabled={generation.status !== "completed" || !selectedImage}
              >
                <FileDown className="mr-2 h-4 w-4" />
                Export
              </Button>

              <Button
                onClick={handleDownload}
                disabled={
                  generation.status !== "completed" ||
                  !selectedImage ||
                  !selectedImage.b64_json
                }
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
          </div>

          {showShareDialog && (
            <ShareDialog
              generation={generation}
              imageIndex={selectedImageIndex}
              open={showShareDialog}
              onOpenChange={setShowShareDialog}
            />
          )}

          {showEditorDialog && (
            <ImageEditorDialog
              generation={generation}
              imageIndex={selectedImageIndex}
              open={showEditorDialog}
              onOpenChange={setShowEditorDialog}
            />
          )}

          {showExportDialog && (
            <ExportDialog
              open={showExportDialog}
              onOpenChange={setShowExportDialog}
              exportType="image"
              itemId={generation.id}
              itemName={generation.prompt.substring(0, 30) + "..."}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
