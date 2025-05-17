"use client";

import { useState } from "react";
import { Clock, Search, Check, Trash2 } from "lucide-react";
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
import { useImageGenStore } from "@/lib/store";
import { useToast } from "@/components/ui/use-toast";
import { formatDate } from "@/lib/openai";
import { PromptHistory } from "@/types";

interface PromptHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectPrompt: (prompt: string) => void;
}

export function PromptHistoryDialog({
  open,
  onOpenChange,
  onSelectPrompt,
}: PromptHistoryDialogProps) {
  const { promptHistory, clearPromptHistory, incrementPromptUsage } = useImageGenStore();
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  function handleSelectPrompt(item: PromptHistory) {
    onSelectPrompt(item.prompt);
    incrementPromptUsage(item.id);
    onOpenChange(false);
    
    toast({
      title: "Prompt Selected",
      description: "The prompt has been applied.",
    });
  }

  function handleClearHistory() {
    clearPromptHistory();
    toast({
      title: "History Cleared",
      description: "Your prompt history has been cleared.",
    });
  }

  // Filter and sort prompt history
  const filteredHistory = promptHistory
    .filter((item) => 
      item.prompt.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime());

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Prompt History</DialogTitle>
          <DialogDescription>
            View and reuse your previous prompts.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search prompts..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="border rounded-md h-[400px] overflow-y-auto">
            {filteredHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <Clock className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">
                  {searchQuery
                    ? "No matching prompts found."
                    : "Your prompt history is empty."}
                </p>
              </div>
            ) : (
              <div className="space-y-2 p-2">
                {filteredHistory.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between p-3 border rounded-md hover:bg-accent/50 cursor-pointer"
                    onClick={() => handleSelectPrompt(item)}
                  >
                    <div className="flex-1">
                      <p className="text-sm line-clamp-2">{item.prompt}</p>
                      <div className="flex items-center mt-1 text-xs text-muted-foreground">
                        <span>Used {item.usageCount} times</span>
                        <span className="mx-2">•</span>
                        <span>Last used: {formatDate(item.lastUsed)}</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="ml-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectPrompt(item);
                      }}
                    >
                      <Check className="h-4 w-4" />
                      <span className="sr-only">Use</span>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearHistory}
            disabled={promptHistory.length === 0}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Clear History
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
