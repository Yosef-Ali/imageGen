"use client";

import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { ImageEditor } from "./image-editor";
import { ImageGeneration } from "@/types";

interface ImageEditorDialogProps {
  generation: ImageGeneration;
  imageIndex: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImageEditorDialog({
  generation,
  imageIndex,
  open,
  onOpenChange,
}: ImageEditorDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[90vw] sm:max-h-[90vh] p-0 overflow-hidden">
        <ImageEditor
          generation={generation}
          imageIndex={imageIndex}
          onClose={() => onOpenChange(false)}
          onSave={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
