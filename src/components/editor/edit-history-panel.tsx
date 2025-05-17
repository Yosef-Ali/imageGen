"use client";

import { Clock, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useImageGenStore } from "@/lib/store";
import { ImageGeneration } from "@/types";
import { formatDate } from "@/lib/openai";
import { useToast } from "@/components/ui/use-toast";

interface EditHistoryPanelProps {
  generation: ImageGeneration;
  imageIndex: number;
}

export function EditHistoryPanel({
  generation,
  imageIndex,
}: EditHistoryPanelProps) {
  const { removeImageEdit } = useImageGenStore();
  const { toast } = useToast();

  const selectedImage = generation.images[imageIndex];
  const editHistory = selectedImage.editHistory || [];

  function handleRemoveEdit(editId: string) {
    removeImageEdit(generation.id, imageIndex, editId);
    
    toast({
      title: "Edit Removed",
      description: "The edit has been removed from the history.",
    });
  }

  if (editHistory.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <Clock className="h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-muted-foreground">
          No edits have been applied to this image yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-medium">Edit History</h3>
      
      <div className="space-y-2">
        {editHistory.map((edit) => (
          <div
            key={edit.id}
            className="flex items-start justify-between p-3 border rounded-md"
          >
            <div>
              <p className="text-sm font-medium">{edit.description}</p>
              <p className="text-xs text-muted-foreground">
                {formatDate(edit.createdAt)}
              </p>
              <p className="text-xs mt-1">
                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                  {edit.type}
                </span>
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleRemoveEdit(edit.id)}
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Remove edit</span>
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
