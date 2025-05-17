"use client";

import { useState } from "react";
import { Copy, Share2, Download, Twitter, Facebook, Link } from "lucide-react";
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
import { useToast } from "@/components/ui/use-toast";
import { ImageGeneration } from "@/types";
import { base64ToDataUrl, downloadImage } from "@/lib/openai";

interface ShareDialogProps {
  generation: ImageGeneration;
  imageIndex: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShareDialog({
  generation,
  imageIndex,
  open,
  onOpenChange,
}: ShareDialogProps) {
  const [isCreatingShareLink, setIsCreatingShareLink] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const selectedImage = generation.images[imageIndex];
  const imageDataUrl = selectedImage?.b64_json 
    ? base64ToDataUrl(selectedImage.b64_json) 
    : selectedImage?.url || '';

  async function handleCreateShareLink() {
    setIsCreatingShareLink(true);
    
    try {
      // In a real app, we would upload the image to a server and get a URL
      // For this demo, we'll create a simulated URL
      const simulatedId = Math.random().toString(36).substring(2, 15);
      const shareUrl = `${window.location.origin}/share/${simulatedId}`;
      
      // Simulate a delay for the upload
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setShareUrl(shareUrl);
      toast({
        title: "Share Link Created",
        description: "Your image share link has been created.",
      });
    } catch (error) {
      toast({
        title: "Error Creating Share Link",
        description: "There was an error creating your share link.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingShareLink(false);
    }
  }

  function handleCopyLink() {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link Copied",
        description: "The share link has been copied to your clipboard.",
      });
    }
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

    const filename = `image-gen-${generation.id}-${imageIndex}.webp`;
    downloadImage(imageDataUrl, filename);
  }

  function handleShareToTwitter() {
    if (shareUrl) {
      const text = `Check out this AI-generated image: "${generation.prompt}" ${shareUrl}`;
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
      window.open(twitterUrl, '_blank');
    }
  }

  function handleShareToFacebook() {
    if (shareUrl) {
      const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
      window.open(facebookUrl, '_blank');
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Share Image</DialogTitle>
          <DialogDescription>
            Share this image with others or download it to your device.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="aspect-square w-full max-h-[300px] overflow-hidden rounded-lg relative">
            {imageDataUrl && (
              <img 
                src={imageDataUrl} 
                alt={generation.prompt} 
                className="w-full h-full object-contain"
              />
            )}
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Prompt</h4>
            <p className="text-sm bg-muted p-3 rounded-md line-clamp-2">
              {generation.prompt}
            </p>
          </div>

          {!shareUrl ? (
            <Button 
              onClick={handleCreateShareLink} 
              disabled={isCreatingShareLink}
              className="w-full"
            >
              <Share2 className="mr-2 h-4 w-4" />
              {isCreatingShareLink ? "Creating Share Link..." : "Create Share Link"}
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Input 
                  value={shareUrl} 
                  readOnly 
                  className="flex-1"
                />
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={handleCopyLink}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex justify-between">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleShareToTwitter}
                  className="flex-1 mr-2"
                >
                  <Twitter className="mr-2 h-4 w-4" />
                  Twitter
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleShareToFacebook}
                  className="flex-1"
                >
                  <Facebook className="mr-2 h-4 w-4" />
                  Facebook
                </Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={handleDownload}
          >
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
          <Button 
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
