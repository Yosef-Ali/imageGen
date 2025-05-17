"use client";

import { Settings, Moon, Sun, FolderOpen, Heart, Download } from "lucide-react";
import { ExportDialog } from "@/components/export-import/export-dialog";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { SettingsDialog } from "@/components/settings-dialog";
import { CollectionsDialog } from "@/components/collections/collections-dialog";
import { useState } from "react";
import { useImageGenStore } from "@/lib/store";

export function Header() {
  const { theme, setTheme } = useTheme();
  const [showSettings, setShowSettings] = useState(false);
  const [showCollections, setShowCollections] = useState(false);
  const [showExportAll, setShowExportAll] = useState(false);
  const { activeCollectionId, collections, setActiveCollection } =
    useImageGenStore();

  const activeCollection = activeCollectionId
    ? collections.find((c) => c.id === activeCollectionId)
    : null;

  return (
    <header className="sticky top-0 z-10 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <a href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold">ImageGen</span>
          </a>
        </div>

        {activeCollection && (
          <div className="flex items-center">
            <span className="text-sm text-muted-foreground mr-2">
              Collection:
            </span>
            <span className="text-sm font-medium">{activeCollection.name}</span>
            <Button
              variant="ghost"
              size="sm"
              className="ml-2 h-7 px-2"
              onClick={() => setActiveCollection(null)}
            >
              Clear
            </Button>
          </div>
        )}

        <div className="flex flex-1 items-center justify-end space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setActiveCollection("favorites")}
            title="Favorites"
          >
            <Heart className="h-5 w-5" />
            <span className="sr-only">Favorites</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowCollections(true)}
            title="Collections"
          >
            <FolderOpen className="h-5 w-5" />
            <span className="sr-only">Collections</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowExportAll(true)}
            title="Export All Data"
          >
            <Download className="h-5 w-5" />
            <span className="sr-only">Export All</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            title="Toggle theme"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSettings(true)}
            title="Settings"
          >
            <Settings className="h-5 w-5" />
            <span className="sr-only">Settings</span>
          </Button>
        </div>
      </div>
      <SettingsDialog open={showSettings} onOpenChange={setShowSettings} />
      <CollectionsDialog
        open={showCollections}
        onOpenChange={setShowCollections}
      />
      <ExportDialog
        open={showExportAll}
        onOpenChange={setShowExportAll}
        exportType="all"
      />
    </header>
  );
}
