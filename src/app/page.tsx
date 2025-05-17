"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/header";
import { GenerationForm } from "@/components/generation-form";
import { ImageGallery } from "@/components/image-gallery";
import { useImageGenStore } from "@/lib/store";
import { SettingsDialog } from "@/components/settings-dialog";

export default function Home() {
  const { apiKey } = useImageGenStore();
  const [showSettings, setShowSettings] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // This ensures hydration issues are avoided
  useEffect(() => {
    setIsClient(true);
    if (!apiKey) {
      setShowSettings(true);
    }
  }, [apiKey]);

  if (!isClient) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container py-6 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">ImageGen</h1>
          <p className="text-muted-foreground">
            Generate images using OpenAI&apos;s DALL-E 3 model
          </p>
        </div>
        <GenerationForm />
        <ImageGallery />
      </main>
      <SettingsDialog open={showSettings} onOpenChange={setShowSettings} />
    </div>
  );
}
