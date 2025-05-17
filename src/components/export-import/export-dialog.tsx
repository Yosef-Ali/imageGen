"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/components/ui/use-toast";
import { useImageGenStore } from "@/lib/store";
import { saveExportToFile } from "@/lib/export-import";
import { ExportOptions } from "@/types/export-import";
import { Download, FileJson, FileArchive } from "lucide-react";

export type ExportType = "collection" | "template" | "image" | "all";

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exportType: ExportType;
  itemId?: string;
  itemIds?: string[];
  itemName?: string;
}

export function ExportDialog({
  open,
  onOpenChange,
  exportType,
  itemId,
  itemIds,
  itemName,
}: ExportDialogProps) {
  const [includeImages, setIncludeImages] = useState(true);
  const [format, setFormat] = useState<"json" | "zip">("json");
  const [isExporting, setIsExporting] = useState(false);
  
  const {
    exportCollection,
    exportTemplates,
    exportImage,
    exportAll,
    collections,
    generations,
    promptTemplates,
  } = useImageGenStore();
  
  const { toast } = useToast();

  function handleExport() {
    setIsExporting(true);
    
    try {
      const options: ExportOptions = {
        includeImages,
        format,
      };
      
      let exportData;
      let filename;
      
      switch (exportType) {
        case "collection":
          if (!itemId) return;
          exportData = exportCollection(itemId, options);
          const collection = collections.find(c => c.id === itemId);
          filename = `collection-${collection?.name || itemId}.json`;
          break;
          
        case "template":
          exportData = exportTemplates(itemIds || [], options);
          filename = itemIds && itemIds.length === 1
            ? `template-${promptTemplates.find(t => t.id === itemIds[0])?.name || itemIds[0]}.json`
            : `templates-${new Date().toISOString().split('T')[0]}.json`;
          break;
          
        case "image":
          if (!itemId) return;
          exportData = exportImage(itemId, options);
          filename = `image-${itemId}.json`;
          break;
          
        case "all":
          exportData = exportAll(options);
          filename = `imagegen-export-${new Date().toISOString().split('T')[0]}.json`;
          break;
      }
      
      if (!exportData) {
        throw new Error("Failed to export data");
      }
      
      saveExportToFile(exportData, filename);
      
      toast({
        title: "Export Successful",
        description: `Your data has been exported to ${filename}`,
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Export {getExportTypeLabel(exportType)}</DialogTitle>
          <DialogDescription>
            {getExportDescription(exportType, itemName)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="include-images">Include Images</Label>
              <p className="text-sm text-muted-foreground">
                Export with image data (larger file size)
              </p>
            </div>
            <Switch
              id="include-images"
              checked={includeImages}
              onCheckedChange={setIncludeImages}
            />
          </div>

          <div className="space-y-3">
            <Label>Export Format</Label>
            <RadioGroup
              value={format}
              onValueChange={(value) => setFormat(value as "json" | "zip")}
              className="flex flex-col space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="json" id="json" />
                <Label htmlFor="json" className="flex items-center cursor-pointer">
                  <FileJson className="h-4 w-4 mr-2" />
                  JSON File
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="zip" id="zip" disabled />
                <Label
                  htmlFor="zip"
                  className="flex items-center cursor-pointer text-muted-foreground"
                >
                  <FileArchive className="h-4 w-4 mr-2" />
                  ZIP Archive (Coming Soon)
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isExporting}
          >
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            <Download className="mr-2 h-4 w-4" />
            {isExporting ? "Exporting..." : "Export"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function getExportTypeLabel(type: ExportType): string {
  switch (type) {
    case "collection":
      return "Collection";
    case "template":
      return "Templates";
    case "image":
      return "Image";
    case "all":
      return "All Data";
  }
}

function getExportDescription(type: ExportType, itemName?: string): string {
  switch (type) {
    case "collection":
      return `Export the collection "${itemName || "Selected"}" and its images.`;
    case "template":
      return "Export your selected prompt templates.";
    case "image":
      return "Export the selected image.";
    case "all":
      return "Export all your collections, images, and templates.";
  }
}
