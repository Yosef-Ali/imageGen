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
import { useImageGenStore } from "@/lib/store";
import { useToast } from "@/components/ui/use-toast";

const settingsSchema = z.object({
  apiKey: z.string().min(1, "API key is required"),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { apiKey, setApiKey, clearGenerations } = useImageGenStore();
  const [isClearing, setIsClearing] = useState(false);
  const { toast } = useToast();

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      apiKey: apiKey || "",
    },
  });

  function onSubmit(data: SettingsFormValues) {
    setApiKey(data.apiKey);
    toast({
      title: "Settings saved",
      description: "Your API key has been saved.",
    });
    onOpenChange(false);
  }

  function handleClearHistory() {
    setIsClearing(true);
    setTimeout(() => {
      clearGenerations();
      toast({
        title: "History cleared",
        description: "Your generation history has been cleared.",
      });
      setIsClearing(false);
    }, 500);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure your OpenAI API key and other settings.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="apiKey">OpenAI API Key</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="sk-..."
                {...form.register("apiKey")}
              />
              {form.formState.errors.apiKey && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.apiKey.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Your API key is stored locally in your browser and is never sent
                to our servers.
              </p>
            </div>
            <div className="grid gap-2 pt-4">
              <Label>History</Label>
              <Button
                type="button"
                variant="outline"
                onClick={handleClearHistory}
                disabled={isClearing}
              >
                {isClearing ? "Clearing..." : "Clear Generation History"}
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
