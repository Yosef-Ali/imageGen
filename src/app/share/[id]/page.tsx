"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface SharedImage {
  id: string;
  prompt: string;
  imageUrl: string;
  createdAt: string;
}

export default function SharePage({ params }: { params: { id: string } }) {
  const [isLoading, setIsLoading] = useState(true);
  const [sharedImage, setSharedImage] = useState<SharedImage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // In a real app, we would fetch the shared image data from an API
    // For this demo, we'll simulate a fetch with a timeout
    const fetchSharedImage = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Check if ID exists (for demo, we'll just check if it's a valid string)
        if (!params.id || params.id.length < 5) {
          setError("Invalid or expired share link");
          return;
        }
        
        // Create a simulated shared image
        setSharedImage({
          id: params.id,
          prompt: "A beautiful landscape with mountains and a lake at sunset",
          imageUrl: "https://source.unsplash.com/random/1024x1024/?landscape",
          createdAt: new Date().toISOString(),
        });
      } catch (err) {
        setError("Failed to load shared image");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSharedImage();
  }, [params.id]);

  function handleDownload() {
    if (!sharedImage) return;
    
    // In a real app, we would download the actual image
    // For this demo, we'll just show a toast
    toast({
      title: "Download Started",
      description: "Your image download has started.",
    });
    
    // Open the image in a new tab (as a simple download alternative)
    window.open(sharedImage.imageUrl, '_blank');
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex h-14 items-center">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold">ImageGen</span>
          </Link>
        </div>
      </header>
      
      <main className="container py-6">
        <div className="mb-6">
          <Link href="/" className="flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to home
          </Link>
        </div>
        
        <div className="max-w-3xl mx-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="animate-pulse text-center">
                <p>Loading shared image...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <h3 className="text-xl font-semibold mb-2 text-destructive">{error}</h3>
              <p className="text-muted-foreground">
                The image you're looking for might have been removed or the link has expired.
              </p>
              <Button asChild className="mt-4">
                <Link href="/">Go to Homepage</Link>
              </Button>
            </div>
          ) : sharedImage ? (
            <div className="space-y-6">
              <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
                <div className="aspect-square relative w-full">
                  <Image
                    src={sharedImage.imageUrl}
                    alt={sharedImage.prompt}
                    fill
                    className="object-contain"
                  />
                </div>
                
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-2">Shared Image</h2>
                  <p className="text-muted-foreground mb-4">
                    Generated on {new Date(sharedImage.createdAt).toLocaleDateString()}
                  </p>
                  
                  <div className="bg-muted p-4 rounded-md mb-4">
                    <h3 className="text-sm font-medium mb-2">Prompt</h3>
                    <p className="text-sm">{sharedImage.prompt}</p>
                  </div>
                  
                  <Button onClick={handleDownload} className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Download Image
                  </Button>
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Want to create your own AI-generated images?
                </p>
                <Button asChild variant="link">
                  <Link href="/">Try ImageGen for free</Link>
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}
