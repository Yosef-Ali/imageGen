"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useImageGenStore } from "@/lib/store";
import { useToast } from "@/components/ui/use-toast";
import { createCollection, formatDate } from "@/lib/openai";
import { Collection } from "@/types";
import { Pencil, Trash2, FolderPlus, Download, Upload } from "lucide-react";
import {
  ExportDialog,
  ExportType,
} from "@/components/export-import/export-dialog";
import { ImportDialog } from "@/components/export-import/import-dialog";

const collectionSchema = z.object({
  name: z.string().min(1, "Collection name is required"),
  description: z.string().optional(),
});

type CollectionFormValues = z.infer<typeof collectionSchema>;

interface CollectionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CollectionsDialog({
  open,
  onOpenChange,
}: CollectionsDialogProps) {
  const {
    collections,
    addCollection,
    updateCollection,
    removeCollection,
    setActiveCollection,
  } = useImageGenStore();
  const [editingCollection, setEditingCollection] = useState<Collection | null>(
    null
  );
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [exportCollection, setExportCollection] = useState<Collection | null>(
    null
  );
  const { toast } = useToast();

  const form = useForm<CollectionFormValues>({
    resolver: zodResolver(collectionSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  function onSubmit(data: CollectionFormValues) {
    if (editingCollection) {
      updateCollection(editingCollection.id, {
        ...data,
        updatedAt: new Date().toISOString(),
      });
      toast({
        title: "Collection updated",
        description: `Collection "${data.name}" has been updated.`,
      });
    } else {
      const newCollection = createCollection(data.name, data.description);
      addCollection(newCollection);
      toast({
        title: "Collection created",
        description: `Collection "${data.name}" has been created.`,
      });
    }
    resetForm();
  }

  function handleEdit(collection: Collection) {
    setEditingCollection(collection);
    form.reset({
      name: collection.name,
      description: collection.description || "",
    });
  }

  function handleDelete(id: string, name: string) {
    removeCollection(id);
    toast({
      title: "Collection deleted",
      description: `Collection "${name}" has been deleted.`,
    });
    if (editingCollection?.id === id) {
      resetForm();
    }
  }

  function resetForm() {
    setEditingCollection(null);
    form.reset({
      name: "",
      description: "",
    });
  }

  function handleSelectCollection(id: string) {
    setActiveCollection(id);
    onOpenChange(false);
  }

  function handleExportCollection(collection: Collection) {
    setExportCollection(collection);
    setShowExportDialog(true);
  }

  function handleImport() {
    setShowImportDialog(true);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Collections</DialogTitle>
          <DialogDescription>
            Organize your generated images into collections.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6">
          <div>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Collection Name</Label>
                <Input
                  id="name"
                  placeholder="My Collection"
                  {...form.register("name")}
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="A brief description of this collection"
                  {...form.register("description")}
                />
              </div>

              <div className="flex justify-between">
                {editingCollection ? (
                  <>
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                    <Button type="submit">Update Collection</Button>
                  </>
                ) : (
                  <Button type="submit" className="ml-auto">
                    <FolderPlus className="mr-2 h-4 w-4" />
                    Create Collection
                  </Button>
                )}
              </div>
            </form>
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">Your Collections</h3>
              <Button variant="outline" size="sm" onClick={handleImport}>
                <Upload className="mr-2 h-4 w-4" />
                Import
              </Button>
            </div>
            {collections.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                You haven't created any collections yet.
              </p>
            ) : (
              <div className="space-y-2">
                {collections.map((collection) => (
                  <div
                    key={collection.id}
                    className="flex items-center justify-between p-3 border rounded-md hover:bg-accent/50 cursor-pointer"
                    onClick={() => handleSelectCollection(collection.id)}
                  >
                    <div className="flex-1">
                      <h4 className="font-medium">{collection.name}</h4>
                      {collection.description && (
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {collection.description}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Created: {formatDate(collection.createdAt)}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExportCollection(collection);
                        }}
                      >
                        <Download className="h-4 w-4" />
                        <span className="sr-only">Export</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(collection);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(collection.id, collection.name);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* Export Dialog */}
      {showExportDialog && exportCollection && (
        <ExportDialog
          open={showExportDialog}
          onOpenChange={setShowExportDialog}
          exportType="collection"
          itemId={exportCollection.id}
          itemName={exportCollection.name}
        />
      )}

      {/* Import Dialog */}
      {showImportDialog && (
        <ImportDialog
          open={showImportDialog}
          onOpenChange={setShowImportDialog}
        />
      )}
    </Dialog>
  );
}
