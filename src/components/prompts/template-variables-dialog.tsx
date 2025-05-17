"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
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
import { useToast } from "@/components/ui/use-toast";
import { PromptTemplate } from "@/types";
import { processPromptTemplate } from "@/lib/openai";

interface TemplateVariablesDialogProps {
  template: PromptTemplate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyTemplate: (processedPrompt: string) => void;
}

export function TemplateVariablesDialog({
  template,
  open,
  onOpenChange,
  onApplyTemplate,
}: TemplateVariablesDialogProps) {
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [processedPrompt, setProcessedPrompt] = useState<string>("");
  const { toast } = useToast();
  
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<Record<string, string>>();
  
  // Watch all form values to update the preview
  const formValues = watch();
  
  useEffect(() => {
    if (template) {
      // Initialize form with default values
      const initialValues: Record<string, string> = {};
      template.variables.forEach(variable => {
        initialValues[variable.name] = variable.defaultValue || '';
      });
      reset(initialValues);
      setVariableValues(initialValues);
    }
  }, [template, reset]);
  
  // Update processed prompt when variables change
  useEffect(() => {
    if (template) {
      const processed = processPromptTemplate(template, formValues);
      setProcessedPrompt(processed);
    }
  }, [template, formValues]);
  
  function onSubmit(data: Record<string, string>) {
    if (!template) return;
    
    const processed = processPromptTemplate(template, data);
    onApplyTemplate(processed);
    onOpenChange(false);
    
    toast({
      title: "Template Applied",
      description: "The template has been applied to your prompt.",
    });
  }
  
  if (!template) return null;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{template.name}</DialogTitle>
          <DialogDescription>
            {template.description || "Fill in the variables to customize your prompt."}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-4 py-4">
            {template.variables.map((variable) => (
              <div key={variable.name} className="space-y-2">
                <Label htmlFor={variable.name}>
                  {variable.name.split('_').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ')}
                  {variable.required && <span className="text-red-500 ml-1">*</span>}
                </Label>
                <Input
                  id={variable.name}
                  placeholder={variable.description || `Enter ${variable.name}`}
                  {...register(variable.name, { 
                    required: variable.required ? `${variable.name} is required` : false 
                  })}
                />
                {errors[variable.name] && (
                  <p className="text-sm text-red-500">
                    {errors[variable.name]?.message}
                  </p>
                )}
                {variable.description && (
                  <p className="text-xs text-muted-foreground">
                    {variable.description}
                  </p>
                )}
              </div>
            ))}
          </div>
          
          <div className="space-y-2">
            <Label>Preview</Label>
            <div className="p-3 bg-muted rounded-md text-sm">
              {processedPrompt || template.template}
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Apply Template</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
