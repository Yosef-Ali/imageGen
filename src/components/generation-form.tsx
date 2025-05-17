"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useImageGenStore } from "@/lib/store";
import { useToast } from "@/components/ui/use-toast";
import { generateImage, createImageGeneration } from "@/lib/openai";
import {
  ImageSize,
  ImageQuality,
  ImageStyle,
  ImageModel,
  PromptTemplate,
} from "@/types";
import { BookOpen, History, Sparkles } from "lucide-react";
import { PromptTemplatesDialog } from "@/components/prompts/prompt-templates-dialog";
import { TemplateVariablesDialog } from "@/components/prompts/template-variables-dialog";
import { PromptHistoryDialog } from "@/components/prompts/prompt-history-dialog";
import { AIPromptAssistant } from "@/components/prompts/ai-prompt-assistant";

const formSchema = z.object({
  prompt: z.string().min(1, "Prompt is required"),
  model: z.enum(["dall-e-3", "gpt-image-1"] as const),
  size: z.enum(["1024x1024", "1024x1792", "1792x1024"] as const),
  quality: z.enum(["standard", "hd"] as const),
  style: z.enum(["vivid", "natural"] as const),
  n: z.number().min(1).max(4),
  collectionId: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function GenerationForm() {
  const {
    apiKey,
    addGeneration,
    updateGeneration,
    getDefaultParameters,
    collections,
    activeCollectionId,
    promptTemplates,
    getPromptTemplateById,
    activePromptTemplateId,
    addToPromptHistory,
  } = useImageGenStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [showTemplatesDialog, setShowTemplatesDialog] = useState(false);
  const [showVariablesDialog, setShowVariablesDialog] = useState(false);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] =
    useState<PromptTemplate | null>(null);
  const { toast } = useToast();

  const defaultParams = getDefaultParameters();

  // Load active template if set
  useEffect(() => {
    if (activePromptTemplateId) {
      const template = getPromptTemplateById(activePromptTemplateId);
      if (template) {
        setSelectedTemplate(template);
        setShowVariablesDialog(true);
      }
    }
  }, [activePromptTemplateId, getPromptTemplateById]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
      size: defaultParams.size,
      quality: defaultParams.quality,
      style: defaultParams.style,
      n: defaultParams.n,
      collectionId:
        activeCollectionId && activeCollectionId !== "favorites"
          ? activeCollectionId
          : undefined,
    },
  });

  async function onSubmit(data: FormValues) {
    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please set your OpenAI API key in the settings.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    // Add prompt to history
    addToPromptHistory(data.prompt);

    const parameters = {
      size: data.size as ImageSize,
      quality: data.quality as ImageQuality,
      style: data.style as ImageStyle,
      n: data.n,
    };

    const generation = createImageGeneration(
      data.prompt,
      parameters,
      data.collectionId,
      selectedTemplate?.id
    );
    addGeneration(generation);

    try {
      const images = await generateImage(apiKey, data.prompt, parameters);

      updateGeneration(generation.id, {
        images,
        status: "completed",
      });

      toast({
        title: "Image Generated",
        description: "Your image has been successfully generated.",
      });

      form.reset({
        prompt: "",
        size: data.size,
        quality: data.quality,
        style: data.style,
        n: data.n,
        collectionId: data.collectionId,
      });
    } catch (error) {
      updateGeneration(generation.id, {
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error",
      });

      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  }

  function handleSelectTemplate(template: PromptTemplate) {
    setSelectedTemplate(template);
    setShowVariablesDialog(true);
  }

  function handleApplyTemplate(processedPrompt: string) {
    form.setValue("prompt", processedPrompt);
  }

  function handleSelectHistoryPrompt(prompt: string) {
    form.setValue("prompt", prompt);
  }

  function handleApplyAISuggestion(suggestion: string) {
    form.setValue("prompt", suggestion);
  }

  return (
    <div className="w-full max-w-3xl mx-auto p-4 space-y-4 bg-card rounded-lg border shadow-sm">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="prompt">Prompt</Label>
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowTemplatesDialog(true)}
                title="Use prompt template"
              >
                <BookOpen className="h-4 w-4 mr-1" />
                Templates
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowHistoryDialog(true)}
                title="View prompt history"
              >
                <History className="h-4 w-4 mr-1" />
                History
              </Button>
            </div>
          </div>
          <Textarea
            id="prompt"
            placeholder="Describe the image you want to generate..."
            className="min-h-[100px]"
            {...form.register("prompt")}
          />
          {form.formState.errors.prompt && (
            <p className="text-sm text-red-500">
              {form.formState.errors.prompt.message}
            </p>
          )}
          <div className="flex justify-end">
            <AIPromptAssistant
              basePrompt={form.getValues("prompt")}
              onApplySuggestion={handleApplyAISuggestion}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="space-y-2">
            <Label htmlFor="model">Model</Label>
            <Select
              defaultValue={form.getValues("model")}
              onValueChange={(value) =>
                form.setValue("model", value as ImageModel)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt-image-1">
                  GPT-4 Image (Recommended)
                </SelectItem>
                <SelectItem value="dall-e-3">DALL-E 3</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="size">Size</Label>
            <Select
              defaultValue={form.getValues("size")}
              onValueChange={(value) =>
                form.setValue("size", value as ImageSize)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1024x1024">Square (1024x1024)</SelectItem>
                <SelectItem value="1024x1792">Portrait (1024x1792)</SelectItem>
                <SelectItem value="1792x1024">Landscape (1792x1024)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quality">Quality</Label>
            <Select
              defaultValue={form.getValues("quality")}
              onValueChange={(value) =>
                form.setValue("quality", value as ImageQuality)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select quality" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="hd">HD</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="style">Style</Label>
            <Select
              defaultValue={form.getValues("style")}
              onValueChange={(value) =>
                form.setValue("style", value as ImageStyle)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vivid">Vivid</SelectItem>
                <SelectItem value="natural">Natural</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="n">Number of Images</Label>
            <Select
              defaultValue={form.getValues("n").toString()}
              onValueChange={(value) => form.setValue("n", parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select count" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1</SelectItem>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="3">3</SelectItem>
                <SelectItem value="4">4</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {collections.length > 0 && (
          <div className="space-y-2">
            <Label htmlFor="collection">Add to Collection (Optional)</Label>
            <Select
              value={form.getValues("collectionId") || ""}
              onValueChange={(value) =>
                form.setValue("collectionId", value || undefined)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a collection" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {collections.map((collection) => (
                  <SelectItem key={collection.id} value={collection.id}>
                    {collection.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <Button type="submit" className="w-full" disabled={isGenerating}>
          {isGenerating ? "Generating..." : "Generate Image"}
        </Button>
      </form>

      {/* Prompt Template Dialogs */}
      <PromptTemplatesDialog
        open={showTemplatesDialog}
        onOpenChange={setShowTemplatesDialog}
        onSelectTemplate={handleSelectTemplate}
      />

      {selectedTemplate && (
        <TemplateVariablesDialog
          template={selectedTemplate}
          open={showVariablesDialog}
          onOpenChange={setShowVariablesDialog}
          onApplyTemplate={handleApplyTemplate}
        />
      )}

      {/* Prompt History Dialog */}
      <PromptHistoryDialog
        open={showHistoryDialog}
        onOpenChange={setShowHistoryDialog}
        onSelectPrompt={handleSelectHistoryPrompt}
      />
    </div>
  );
}
