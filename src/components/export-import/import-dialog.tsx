"use client";

import { useState, useRef } from "react";
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
import { useToast } from "@/components/ui/use-toast";
import { useImageGenStore } from "@/lib/store";
import { isValidImportFile } from "@/lib/export-import";
import { ImportOptions, ImportResult } from "@/types/export-import";
import { Upload, AlertCircle, FileJson, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImportDialog({
  open,
  onOpenChange,
}: ImportDialogProps) {
  const [replaceExisting, setReplaceExisting] = useState(false);
  const [importImages, setImportImages] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { importData } = useImageGenStore();
  const { toast } = useToast();

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files || files.length === 0) {
      setSelectedFile(null);
      return;
    }
    
    const file = files[0];
    if (!isValidImportFile(file)) {
      setError("Invalid file format. Please select a JSON file.");
      setSelectedFile(null);
      return;
    }
    
    setSelectedFile(file);
    setError(null);
    setImportResult(null);
  }

  function handleSelectFile() {
    fileInputRef.current?.click();
  }

  async function handleImport() {
    if (!selectedFile) return;
    
    setIsImporting(true);
    setError(null);
    
    try {
      const options: ImportOptions = {
        replaceExisting,
        importImages,
      };
      
      const fileContent = await selectedFile.text();
      const data = JSON.parse(fileContent);
      
      const result = importData(data, options);
      setImportResult(result);
      
      if (result.success) {
        toast({
          title: "Import Successful",
          description: result.message,
        });
      } else {
        setError(result.message);
        toast({
          title: "Import Failed",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Import error:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      setError(errorMessage);
      toast({
        title: "Import Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  }

  function handleClose() {
    if (importResult?.success) {
      onOpenChange(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Import Data</DialogTitle>
          <DialogDescription>
            Import collections, templates, and images from a previously exported file.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {importResult?.success && (
            <Alert variant="default" className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Import Successful</AlertTitle>
              <AlertDescription className="text-green-700">
                {importResult.message}
              </AlertDescription>
            </Alert>
          )}
          
          <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-md">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
            
            {selectedFile ? (
              <div className="text-center">
                <FileJson className="h-10 w-10 text-primary mx-auto mb-2" />
                <p className="font-medium">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectFile}
                  className="mt-2"
                >
                  Change File
                </Button>
              </div>
            ) : (
              <div className="text-center">
                <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground mb-2">
                  Drag and drop your file here, or click to select
                </p>
                <Button variant="outline" onClick={handleSelectFile}>
                  Select File
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="replace-existing">Replace Existing Items</Label>
                <p className="text-sm text-muted-foreground">
                  Overwrite items with the same ID
                </p>
              </div>
              <Switch
                id="replace-existing"
                checked={replaceExisting}
                onCheckedChange={setReplaceExisting}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="import-images">Import Images</Label>
                <p className="text-sm text-muted-foreground">
                  Import image data if available
                </p>
              </div>
              <Switch
                id="import-images"
                checked={importImages}
                onCheckedChange={setImportImages}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isImporting}
          >
            {importResult?.success ? "Close" : "Cancel"}
          </Button>
          <Button
            onClick={handleImport}
            disabled={!selectedFile || isImporting}
          >
            <Upload className="mr-2 h-4 w-4" />
            {isImporting ? "Importing..." : "Import"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
