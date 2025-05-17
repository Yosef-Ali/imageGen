"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { useImageGenStore } from "@/lib/store";
import { ImageGeneration, Collection } from "@/types";
import { ImageDetailDialog } from "@/components/image-detail-dialog";
import { ShareDialog } from "@/components/sharing/share-dialog";
import { base64ToDataUrl, formatDate } from "@/lib/openai";
import { Heart, FolderPlus, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ImageGallery() {
  const {
    generations,
    activeCollectionId,
    collections,
    getFavorites,
    getCollectionImages,
    toggleFavorite,
  } = useImageGenStore();
  const [selectedGeneration, setSelectedGeneration] =
    useState<ImageGeneration | null>(null);
  const [showCollectionSelector, setShowCollectionSelector] = useState<
    string | null
  >(null);
  const [sharingInfo, setSharingInfo] = useState<{
    generation: ImageGeneration;
    imageIndex: number;
  } | null>(null);

  // Filter images based on active collection
  const displayedGenerations = useMemo(() => {
    if (!activeCollectionId) {
      return generations;
    } else if (activeCollectionId === "favorites") {
      return getFavorites();
    } else {
      return getCollectionImages(activeCollectionId);
    }
  }, [generations, activeCollectionId, getFavorites, getCollectionImages]);

  // Get active collection name
  const activeCollectionName = useMemo(() => {
    if (!activeCollectionId) {
      return "All Images";
    } else if (activeCollectionId === "favorites") {
      return "Favorites";
    } else {
      const collection = collections.find((c) => c.id === activeCollectionId);
      return collection ? collection.name : "Collection";
    }
  }, [activeCollectionId, collections]);

  if (generations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center p-4">
        <h3 className="text-xl font-semibold mb-2">No images yet</h3>
        <p className="text-muted-foreground">
          Enter a prompt above to generate your first image.
        </p>
      </div>
    );
  }

  if (displayedGenerations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center p-4">
        <h3 className="text-xl font-semibold mb-2">
          No images in {activeCollectionName}
        </h3>
        <p className="text-muted-foreground">
          This collection is empty. Generate new images or add existing ones to
          this collection.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
        {displayedGenerations.map((generation) => (
          <div
            key={generation.id}
            className="relative overflow-hidden rounded-lg border bg-card shadow-sm transition-all hover:shadow-md"
          >
            <div
              className="aspect-square relative overflow-hidden cursor-pointer"
              onClick={() => setSelectedGeneration(generation)}
            >
              {generation.status === "pending" ? (
                <div className="absolute inset-0 flex items-center justify-center bg-muted">
                  <div className="animate-pulse text-center">
                    <p>Generating...</p>
                  </div>
                </div>
              ) : generation.status === "failed" ? (
                <div className="absolute inset-0 flex items-center justify-center bg-muted">
                  <div className="text-center text-destructive">
                    <p>Generation failed</p>
                  </div>
                </div>
              ) : generation.images.length > 0 ? (
                <div className="relative w-full h-full">
                  <Image
                    src={
                      generation.images[0].isEdited &&
                      generation.images[0].editedUrl
                        ? generation.images[0].editedUrl
                        : generation.images[0].b64_json
                        ? base64ToDataUrl(generation.images[0].b64_json)
                        : generation.images[0].url
                    }
                    alt={generation.prompt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover"
                  />
                  {generation.images[0].isEdited && (
                    <div className="absolute bottom-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-md">
                      Edited
                    </div>
                  )}
                </div>
              ) : null}

              {/* Favorite button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 bg-background/50 backdrop-blur-sm hover:bg-background/70 z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(generation.id);
                }}
              >
                <Heart
                  className={`h-4 w-4 ${
                    generation.favorite ? "fill-red-500 text-red-500" : ""
                  }`}
                />
                <span className="sr-only">Favorite</span>
              </Button>

              {/* Collection button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-12 bg-background/50 backdrop-blur-sm hover:bg-background/70 z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowCollectionSelector(generation.id);
                }}
              >
                <FolderPlus className="h-4 w-4" />
                <span className="sr-only">Add to collection</span>
              </Button>

              {/* Share button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-[5.5rem] bg-background/50 backdrop-blur-sm hover:bg-background/70 z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  setSharingInfo({
                    generation,
                    imageIndex: 0,
                  });
                }}
              >
                <Share2 className="h-4 w-4" />
                <span className="sr-only">Share</span>
              </Button>
            </div>

            <div className="p-3">
              <p
                className="text-sm line-clamp-2 cursor-pointer"
                onClick={() => setSelectedGeneration(generation)}
              >
                {generation.prompt}
              </p>
              <div className="flex justify-between items-center mt-1">
                <p className="text-xs text-muted-foreground">
                  {formatDate(generation.createdAt)}
                </p>
                {generation.images.length > 1 && (
                  <p className="text-xs font-medium">
                    +{generation.images.length - 1} more
                  </p>
                )}
              </div>

              {/* Collection selector (conditionally rendered) */}
              {showCollectionSelector === generation.id &&
                collections.length > 0 && (
                  <div className="mt-2 p-2 border rounded-md bg-background shadow-md">
                    <p className="text-xs font-medium mb-1">
                      Add to collection:
                    </p>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {collections.map((collection) => (
                        <button
                          key={collection.id}
                          className={`w-full text-left text-xs p-1 rounded hover:bg-accent ${
                            generation.collectionId === collection.id
                              ? "bg-accent"
                              : ""
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            const newCollectionId =
                              generation.collectionId === collection.id
                                ? undefined
                                : collection.id;
                            useImageGenStore
                              .getState()
                              .updateGeneration(generation.id, {
                                collectionId: newCollectionId,
                              });
                            setShowCollectionSelector(null);
                          }}
                        >
                          {collection.name}
                        </button>
                      ))}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full mt-1 h-6 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowCollectionSelector(null);
                      }}
                    >
                      Close
                    </Button>
                  </div>
                )}
            </div>
          </div>
        ))}
      </div>

      {selectedGeneration && (
        <ImageDetailDialog
          generation={selectedGeneration}
          open={!!selectedGeneration}
          onOpenChange={(open) => !open && setSelectedGeneration(null)}
        />
      )}

      {sharingInfo && (
        <ShareDialog
          generation={sharingInfo.generation}
          imageIndex={sharingInfo.imageIndex}
          open={!!sharingInfo}
          onOpenChange={(open) => !open && setSharingInfo(null)}
        />
      )}
    </>
  );
}
