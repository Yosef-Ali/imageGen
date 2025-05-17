"use client";

import { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useImageGenStore } from "@/lib/store";
import { useToast } from "@/components/ui/use-toast";
import { PromptTemplate, PromptCategory, PromptVariable } from "@/types";
import {
  createPromptTemplate,
  extractVariablesFromTemplate,
  formatDate,
} from "@/lib/openai";
import { builtInTemplates } from "@/lib/built-in-templates";
import {
  Pencil,
  Trash2,
  Plus,
  BookOpen,
  Wand2,
  Download,
  Upload,
} from "lucide-react";
import { ExportDialog } from "@/components/export-import/export-dialog";
import { ImportDialog } from "@/components/export-import/import-dialog";

const templateSchema = z.object({
  name: z.string().min(1, "Template name is required"),
  description: z.string().optional(),
  template: z.string().min(1, "Template content is required"),
  category: z.string().min(1, "Category is required"),
});

type TemplateFormValues = z.infer<typeof templateSchema>;

interface PromptTemplatesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectTemplate?: (template: PromptTemplate) => void;
}

export function PromptTemplatesDialog({
  open,
  onOpenChange,
  onSelectTemplate,
}: PromptTemplatesDialogProps) {
  const {
    promptTemplates,
    addPromptTemplate,
    updatePromptTemplate,
    removePromptTemplate,
    setActivePromptTemplate,
  } = useImageGenStore();
  const [editingTemplate, setEditingTemplate] = useState<PromptTemplate | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<"built-in" | "custom">("built-in");
  const [selectedCategory, setSelectedCategory] = useState<
    PromptCategory | "all"
  >("all");
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<string[]>([]);
  const { toast } = useToast();

  const form = useForm<TemplateFormValues>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: "",
      description: "",
      template: "",
      category: "landscape",
    },
  });

  // Initialize built-in templates if none exist
  useEffect(() => {
    const hasBuiltInTemplates = promptTemplates.some(
      (template) => template.isBuiltIn
    );
    if (!hasBuiltInTemplates && builtInTemplates.length > 0) {
      builtInTemplates.forEach((template) => {
        addPromptTemplate(template);
      });
    }
  }, [promptTemplates, addPromptTemplate]);

  function onSubmit(data: TemplateFormValues) {
    const variables = extractVariablesFromTemplate(data.template);

    if (editingTemplate) {
      updatePromptTemplate(editingTemplate.id, {
        ...data,
        category: data.category as PromptCategory,
        variables,
        updatedAt: new Date().toISOString(),
      });
      toast({
        title: "Template updated",
        description: `Template "${data.name}" has been updated.`,
      });
    } else {
      const newTemplate = createPromptTemplate(
        data.name,
        data.template,
        data.category as PromptCategory,
        variables,
        data.description
      );
      addPromptTemplate(newTemplate);
      toast({
        title: "Template created",
        description: `Template "${data.name}" has been created.`,
      });
    }
    resetForm();
  }

  function handleEdit(template: PromptTemplate) {
    if (template.isBuiltIn) {
      toast({
        title: "Cannot edit built-in template",
        description:
          "Built-in templates cannot be edited. You can create a copy instead.",
        variant: "destructive",
      });
      return;
    }

    setEditingTemplate(template);
    form.reset({
      name: template.name,
      description: template.description || "",
      template: template.template,
      category: template.category,
    });
  }

  function handleCopy(template: PromptTemplate) {
    setEditingTemplate(null);
    form.reset({
      name: `Copy of ${template.name}`,
      description: template.description || "",
      template: template.template,
      category: template.category,
    });
    setActiveTab("custom");
  }

  function handleDelete(id: string, name: string) {
    removePromptTemplate(id);
    toast({
      title: "Template deleted",
      description: `Template "${name}" has been deleted.`,
    });
    if (editingTemplate?.id === id) {
      resetForm();
    }
  }

  function resetForm() {
    setEditingTemplate(null);
    form.reset({
      name: "",
      description: "",
      template: "",
      category: "landscape",
    });
  }

  function handleSelectTemplate(template: PromptTemplate) {
    if (onSelectTemplate) {
      onSelectTemplate(template);
      onOpenChange(false);
    } else {
      setActivePromptTemplate(template.id);
      onOpenChange(false);
    }
  }

  function handleExportTemplates() {
    // Export all templates in the current filtered view
    const templateIds = filteredTemplates.map((template) => template.id);
    setSelectedTemplateIds(templateIds);
    setShowExportDialog(true);
  }

  function handleImportTemplates() {
    setShowImportDialog(true);
  }

  // Filter templates based on active tab and selected category
  const filteredTemplates = promptTemplates.filter((template) => {
    const matchesTab =
      activeTab === "built-in" ? template.isBuiltIn : !template.isBuiltIn;
    const matchesCategory =
      selectedCategory === "all" || template.category === selectedCategory;
    return matchesTab && matchesCategory;
  });

  // Get unique categories from templates
  const categories = Array.from(
    new Set(promptTemplates.map((template) => template.category))
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Prompt Templates</DialogTitle>
          <DialogDescription>
            Use templates to generate consistent, high-quality prompts.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/2 space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex space-x-2">
                <Button
                  variant={activeTab === "built-in" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveTab("built-in")}
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  Built-in
                </Button>
                <Button
                  variant={activeTab === "custom" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveTab("custom")}
                >
                  <Wand2 className="mr-2 h-4 w-4" />
                  Custom
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleImportTemplates}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Import
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportTemplates}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
                <Select
                  value={selectedCategory}
                  onValueChange={(value) =>
                    setSelectedCategory(value as PromptCategory | "all")
                  }
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="border rounded-md h-[400px] overflow-y-auto">
              {filteredTemplates.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-4">
                  <p className="text-muted-foreground">
                    {activeTab === "built-in"
                      ? "No built-in templates in this category."
                      : "You haven't created any custom templates yet."}
                  </p>
                  {activeTab === "custom" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => resetForm()}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Create Template
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-2 p-2">
                  {filteredTemplates.map((template) => (
                    <div
                      key={template.id}
                      className="flex items-center justify-between p-3 border rounded-md hover:bg-accent/50 cursor-pointer"
                      onClick={() => handleSelectTemplate(template)}
                    >
                      <div className="flex-1">
                        <h4 className="font-medium">{template.name}</h4>
                        {template.description && (
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {template.description}
                          </p>
                        )}
                        <div className="flex items-center mt-1">
                          <span className="text-xs px-2 py-0.5 bg-primary/10 rounded-full">
                            {template.category}
                          </span>
                          <span className="text-xs text-muted-foreground ml-2">
                            {template.variables.length} variables
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(template);
                          }}
                          title="Copy template"
                        >
                          <Plus className="h-4 w-4" />
                          <span className="sr-only">Copy</span>
                        </Button>
                        {!template.isBuiltIn && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(template);
                              }}
                              title="Edit template"
                            >
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(template.id, template.name);
                              }}
                              title="Delete template"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="md:w-1/2">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Template Name</Label>
                <Input
                  id="name"
                  placeholder="My Template"
                  {...form.register("name")}
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={form.getValues("category")}
                  onValueChange={(value) => form.setValue("category", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="landscape">Landscape</SelectItem>
                    <SelectItem value="portrait">Portrait</SelectItem>
                    <SelectItem value="abstract">Abstract</SelectItem>
                    <SelectItem value="product">Product</SelectItem>
                    <SelectItem value="character">Character</SelectItem>
                    <SelectItem value="architecture">Architecture</SelectItem>
                    <SelectItem value="food">Food</SelectItem>
                    <SelectItem value="animal">Animal</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="A brief description of this template"
                  {...form.register("description")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="template">Template Content</Label>
                <Textarea
                  id="template"
                  placeholder="Enter your template with {{variables}} in double curly braces"
                  className="min-h-[120px] font-mono text-sm"
                  {...form.register("template")}
                />
                {form.formState.errors.template && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.template.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Use double curly braces for variables, e.g.,{" "}
                  {"{{variable_name}}"}
                </p>
              </div>

              <div className="flex justify-between">
                {editingTemplate ? (
                  <>
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                    <Button type="submit">Update Template</Button>
                  </>
                ) : (
                  <Button type="submit" className="ml-auto">
                    Create Template
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* Export Dialog */}
      {showExportDialog && (
        <ExportDialog
          open={showExportDialog}
          onOpenChange={setShowExportDialog}
          exportType="template"
          itemIds={selectedTemplateIds}
        />
      )}

      {/* Import Dialog */}
      {showImportDialog && (
        <ImportDialog
          open={showImportDialog}
          onOpenChange={setShowImportDialog}
        />
      )}
    </Dialog>
  );
}
