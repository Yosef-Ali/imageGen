"use client";

import { useState } from "react";
import { Sparkles, RefreshCw, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useImageGenStore } from "@/lib/store";
import { useToast } from "@/components/ui/use-toast";
import { AIPromptSuggestion } from "@/types";

interface AIPromptAssistantProps {
  basePrompt: string;
  onApplySuggestion: (suggestion: string) => void;
}

export function AIPromptAssistant({
  basePrompt,
  onApplySuggestion,
}: AIPromptAssistantProps) {
  const { 
    aiSuggestions, 
    isLoadingAISuggestions, 
    generateAIPromptSuggestion,
    setAISuggestions,
    clearAISuggestions
  } = useImageGenStore();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { toast } = useToast();

  async function handleGenerateSuggestions() {
    if (!basePrompt.trim()) {
      toast({
        title: "Empty Prompt",
        description: "Please enter a base prompt first.",
        variant: "destructive",
      });
      return;
    }

    setShowSuggestions(true);
    
    try {
      await generateAIPromptSuggestion(basePrompt);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate suggestions. Please try again.",
        variant: "destructive",
      });
    }
  }

  function handleApplySuggestion(suggestion: string) {
    onApplySuggestion(suggestion);
    setShowSuggestions(false);
    clearAISuggestions();
    
    toast({
      title: "Suggestion Applied",
      description: "The AI suggestion has been applied to your prompt.",
    });
  }

  if (!showSuggestions) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="flex items-center"
        onClick={handleGenerateSuggestions}
      >
        <Sparkles className="mr-2 h-4 w-4" />
        Enhance with AI
      </Button>
    );
  }

  return (
    <div className="space-y-3 p-3 border rounded-md">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">AI Prompt Suggestions</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setShowSuggestions(false);
            clearAISuggestions();
          }}
        >
          Close
        </Button>
      </div>

      {isLoadingAISuggestions ? (
        <div className="flex items-center justify-center py-4">
          <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">
            Generating suggestions...
          </span>
        </div>
      ) : aiSuggestions.length > 0 ? (
        <div className="space-y-2">
          {aiSuggestions.map((suggestion, index) => (
            <div
              key={index}
              className="flex items-start justify-between p-2 border rounded-md hover:bg-accent/50"
            >
              <p className="text-sm flex-1">{suggestion.prompt}</p>
              <Button
                variant="ghost"
                size="sm"
                className="ml-2"
                onClick={() => handleApplySuggestion(suggestion.prompt)}
              >
                <Check className="h-4 w-4" />
                <span className="sr-only">Apply</span>
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-2">
          <p className="text-sm text-muted-foreground">
            No suggestions available. Try again with a different prompt.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={handleGenerateSuggestions}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
}
