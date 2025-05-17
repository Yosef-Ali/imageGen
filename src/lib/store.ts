import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  ImageGeneration,
  GenerationParameters,
  Collection,
  PromptTemplate,
  PromptHistory,
  AIPromptSuggestion,
  ImageEdit,
  ImageEditParameters,
  GeneratedImage
} from '@/types';
import {
  ImportResult,
  ExportOptions,
  ImportOptions,
  CollectionExport,
  TemplateExport,
  ImageExport,
  FullExport
} from '@/types/export-import';

interface ImageGenStore {
  apiKey: string | null;
  generations: ImageGeneration[];
  collections: Collection[];
  promptTemplates: PromptTemplate[];
  promptHistory: PromptHistory[];
  activeCollectionId: string | null;
  activePromptTemplateId: string | null;
  aiSuggestions: AIPromptSuggestion[];
  isLoadingAISuggestions: boolean;

  // API Key
  setApiKey: (key: string) => void;

  // Generations
  addGeneration: (generation: ImageGeneration) => void;
  updateGeneration: (id: string, updates: Partial<ImageGeneration>) => void;
  removeGeneration: (id: string) => void;
  clearGenerations: () => void;
  getDefaultParameters: () => GenerationParameters;

  // Collections
  addCollection: (collection: Collection) => void;
  updateCollection: (id: string, updates: Partial<Collection>) => void;
  removeCollection: (id: string) => void;
  setActiveCollection: (id: string | null) => void;
  toggleFavorite: (id: string) => void;
  getFavorites: () => ImageGeneration[];
  getCollectionImages: (collectionId: string) => ImageGeneration[];

  // Prompt Templates
  addPromptTemplate: (template: PromptTemplate) => void;
  updatePromptTemplate: (id: string, updates: Partial<PromptTemplate>) => void;
  removePromptTemplate: (id: string) => void;
  setActivePromptTemplate: (id: string | null) => void;
  getPromptTemplateById: (id: string) => PromptTemplate | undefined;

  // Prompt History
  addToPromptHistory: (prompt: string) => void;
  incrementPromptUsage: (id: string) => void;
  clearPromptHistory: () => void;

  // AI Suggestions
  setAISuggestions: (suggestions: AIPromptSuggestion[]) => void;
  clearAISuggestions: () => void;
  setIsLoadingAISuggestions: (isLoading: boolean) => void;
  generateAIPromptSuggestion: (basePrompt: string) => Promise<string>;

  // Image Editing
  addImageEdit: (generationId: string, imageIndex: number, edit: ImageEdit) => void;
  updateImageEdit: (generationId: string, imageIndex: number, editId: string, updates: Partial<ImageEdit>) => void;
  removeImageEdit: (generationId: string, imageIndex: number, editId: string) => void;
  setEditedImage: (generationId: string, imageIndex: number, editedUrl: string, editedB64Json?: string) => void;
  resetImageEdits: (generationId: string, imageIndex: number) => void;

  // Export/Import
  exportCollection: (collectionId: string, options: ExportOptions) => CollectionExport | null;
  exportTemplates: (templateIds: string[], options: ExportOptions) => TemplateExport | null;
  exportImage: (generationId: string, options: ExportOptions) => ImageExport | null;
  exportAll: (options: ExportOptions) => FullExport;
  importData: (data: any, options: ImportOptions) => ImportResult;
}

// Helper functions for importing data
function importCollection(
  data: CollectionExport,
  options: ImportOptions,
  set: any,
  get: any
): ImportResult {
  const existingCollections = get().collections;
  const existingGenerations = get().generations;

  // Check if collection already exists
  const existingCollection = existingCollections.find(c => c.id === data.collection.id);

  // Generate new IDs to avoid conflicts
  const newCollectionId = existingCollection && !options.replaceExisting
    ? `import_${Math.random().toString(36).substring(2, 9)}`
    : data.collection.id;

  // Process collection
  const collection = {
    ...data.collection,
    id: newCollectionId,
    updatedAt: new Date().toISOString()
  };

  // Process generations
  const generations = data.generations.map(gen => {
    // Check if generation already exists
    const existingGeneration = existingGenerations.find(g => g.id === gen.id);
    const newGenId = existingGeneration && !options.replaceExisting
      ? `import_${Math.random().toString(36).substring(2, 9)}`
      : gen.id;

    return {
      ...gen,
      id: newGenId,
      collectionId: newCollectionId
    };
  });

  // Update store
  set((state: any) => {
    // Add or update collection
    const updatedCollections = existingCollection && options.replaceExisting
      ? state.collections.map((c: Collection) => c.id === data.collection.id ? collection : c)
      : [...state.collections, collection];

    // Add or update generations
    const updatedGenerations = [...state.generations];

    generations.forEach(gen => {
      const existingIndex = updatedGenerations.findIndex(g => g.id === gen.id);
      if (existingIndex >= 0 && options.replaceExisting) {
        updatedGenerations[existingIndex] = gen;
      } else if (existingIndex === -1) {
        updatedGenerations.push(gen);
      }
    });

    return {
      collections: updatedCollections,
      generations: updatedGenerations
    };
  });

  return {
    success: true,
    type: 'collection',
    message: `Successfully imported collection "${data.collection.name}" with ${generations.length} images`,
    imported: {
      collections: 1,
      generations: generations.length
    }
  };
}

function importTemplates(
  data: TemplateExport,
  options: ImportOptions,
  set: any,
  get: any
): ImportResult {
  const existingTemplates = get().promptTemplates;

  // Process templates
  const templates = data.templates.map(template => {
    // Check if template already exists
    const existingTemplate = existingTemplates.find(t => t.id === template.id);

    // Skip built-in templates that already exist
    if (existingTemplate && template.isBuiltIn) {
      return null;
    }

    // Generate new ID if needed
    const newTemplateId = existingTemplate && !options.replaceExisting
      ? `import_${Math.random().toString(36).substring(2, 9)}`
      : template.id;

    return {
      ...template,
      id: newTemplateId,
      updatedAt: new Date().toISOString()
    };
  }).filter(Boolean) as PromptTemplate[];

  // Update store
  set((state: any) => {
    // Add or update templates
    const updatedTemplates = [...state.promptTemplates];

    templates.forEach(template => {
      const existingIndex = updatedTemplates.findIndex(t => t.id === template.id);
      if (existingIndex >= 0 && options.replaceExisting) {
        updatedTemplates[existingIndex] = template;
      } else if (existingIndex === -1) {
        updatedTemplates.push(template);
      }
    });

    return {
      promptTemplates: updatedTemplates
    };
  });

  return {
    success: true,
    type: 'template',
    message: `Successfully imported ${templates.length} templates`,
    imported: {
      templates: templates.length
    }
  };
}

function importImage(
  data: ImageExport,
  options: ImportOptions,
  set: any,
  get: any
): ImportResult {
  const existingGenerations = get().generations;

  // Check if generation already exists
  const existingGeneration = existingGenerations.find(g => g.id === data.generation.id);

  // Generate new ID if needed
  const newGenId = existingGeneration && !options.replaceExisting
    ? `import_${Math.random().toString(36).substring(2, 9)}`
    : data.generation.id;

  // Process generation
  const generation = {
    ...data.generation,
    id: newGenId
  };

  // Update store
  set((state: any) => {
    // Add or update generation
    const updatedGenerations = existingGeneration && options.replaceExisting
      ? state.generations.map((g: ImageGeneration) => g.id === data.generation.id ? generation : g)
      : [...state.generations, generation];

    return {
      generations: updatedGenerations
    };
  });

  return {
    success: true,
    type: 'image',
    message: `Successfully imported image "${data.generation.prompt.substring(0, 30)}..."`,
    imported: {
      generations: 1
    }
  };
}

function importFull(
  data: FullExport,
  options: ImportOptions,
  set: any,
  get: any
): ImportResult {
  const existingCollections = get().collections;
  const existingGenerations = get().generations;
  const existingTemplates = get().promptTemplates;

  // Process collections
  const collections = data.collections.map(collection => {
    // Check if collection already exists
    const existingCollection = existingCollections.find(c => c.id === collection.id);

    // Generate new ID if needed
    const newCollectionId = existingCollection && !options.replaceExisting
      ? `import_${Math.random().toString(36).substring(2, 9)}`
      : collection.id;

    return {
      ...collection,
      id: newCollectionId,
      updatedAt: new Date().toISOString()
    };
  });

  // Process generations
  const generations = data.generations.map(gen => {
    // Check if generation already exists
    const existingGeneration = existingGenerations.find(g => g.id === gen.id);

    // Generate new ID if needed
    const newGenId = existingGeneration && !options.replaceExisting
      ? `import_${Math.random().toString(36).substring(2, 9)}`
      : gen.id;

    // Update collection ID if needed
    let collectionId = gen.collectionId;
    if (collectionId) {
      const collection = collections.find(c => c.id === collectionId || c.id.endsWith(collectionId));
      if (collection) {
        collectionId = collection.id;
      }
    }

    return {
      ...gen,
      id: newGenId,
      collectionId
    };
  });

  // Process templates
  const templates = data.templates.map(template => {
    // Check if template already exists
    const existingTemplate = existingTemplates.find(t => t.id === template.id);

    // Skip built-in templates that already exist
    if (existingTemplate && template.isBuiltIn) {
      return null;
    }

    // Generate new ID if needed
    const newTemplateId = existingTemplate && !options.replaceExisting
      ? `import_${Math.random().toString(36).substring(2, 9)}`
      : template.id;

    return {
      ...template,
      id: newTemplateId,
      updatedAt: new Date().toISOString()
    };
  }).filter(Boolean) as PromptTemplate[];

  // Update store
  set((state: any) => {
    // Add or update collections
    const updatedCollections = [...state.collections];
    collections.forEach(collection => {
      const existingIndex = updatedCollections.findIndex(c => c.id === collection.id);
      if (existingIndex >= 0 && options.replaceExisting) {
        updatedCollections[existingIndex] = collection;
      } else if (existingIndex === -1) {
        updatedCollections.push(collection);
      }
    });

    // Add or update generations
    const updatedGenerations = [...state.generations];
    generations.forEach(gen => {
      const existingIndex = updatedGenerations.findIndex(g => g.id === gen.id);
      if (existingIndex >= 0 && options.replaceExisting) {
        updatedGenerations[existingIndex] = gen;
      } else if (existingIndex === -1) {
        updatedGenerations.push(gen);
      }
    });

    // Add or update templates
    const updatedTemplates = [...state.promptTemplates];
    templates.forEach(template => {
      const existingIndex = updatedTemplates.findIndex(t => t.id === template.id);
      if (existingIndex >= 0 && options.replaceExisting) {
        updatedTemplates[existingIndex] = template;
      } else if (existingIndex === -1) {
        updatedTemplates.push(template);
      }
    });

    return {
      collections: updatedCollections,
      generations: updatedGenerations,
      promptTemplates: updatedTemplates
    };
  });

  return {
    success: true,
    type: 'full',
    message: `Successfully imported ${collections.length} collections, ${generations.length} images, and ${templates.length} templates`,
    imported: {
      collections: collections.length,
      generations: generations.length,
      templates: templates.length
    }
  };
}

export const useImageGenStore = create<ImageGenStore>()(
  persist(
    (set, get) => ({
      // State
      apiKey: null,
      generations: [],
      collections: [],
      promptTemplates: [],
      promptHistory: [],
      activeCollectionId: null,
      activePromptTemplateId: null,
      aiSuggestions: [],
      isLoadingAISuggestions: false,

      // API Key
      setApiKey: (key) => set({ apiKey: key }),

      // Generations
      addGeneration: (generation) =>
        set((state) => ({
          generations: [generation, ...state.generations]
        })),
      updateGeneration: (id, updates) =>
        set((state) => ({
          generations: state.generations.map((gen) =>
            gen.id === id ? { ...gen, ...updates } : gen
          )
        })),
      removeGeneration: (id) =>
        set((state) => ({
          generations: state.generations.filter((gen) => gen.id !== id)
        })),
      clearGenerations: () => set({ generations: [] }),
      getDefaultParameters: () => ({
        model: 'gpt-image-1',
        size: '1024x1024',
        quality: 'standard',
        style: 'vivid',
        n: 1
      }),

      // Collections
      addCollection: (collection) =>
        set((state) => ({
          collections: [collection, ...state.collections]
        })),
      updateCollection: (id, updates) =>
        set((state) => ({
          collections: state.collections.map((col) =>
            col.id === id ? { ...col, ...updates } : col
          )
        })),
      removeCollection: (id) =>
        set((state) => ({
          collections: state.collections.filter((col) => col.id !== id),
          generations: state.generations.map((gen) =>
            gen.collectionId === id ? { ...gen, collectionId: undefined } : gen
          )
        })),
      setActiveCollection: (id) =>
        set({ activeCollectionId: id }),
      toggleFavorite: (id) =>
        set((state) => ({
          generations: state.generations.map((gen) =>
            gen.id === id ? { ...gen, favorite: !gen.favorite } : gen
          )
        })),
      getFavorites: () => {
        return get().generations.filter((gen) => gen.favorite);
      },
      getCollectionImages: (collectionId) => {
        return get().generations.filter((gen) => gen.collectionId === collectionId);
      },

      // Prompt Templates
      addPromptTemplate: (template) =>
        set((state) => ({
          promptTemplates: [template, ...state.promptTemplates]
        })),
      updatePromptTemplate: (id, updates) =>
        set((state) => ({
          promptTemplates: state.promptTemplates.map((template) =>
            template.id === id ? { ...template, ...updates } : template
          )
        })),
      removePromptTemplate: (id) =>
        set((state) => ({
          promptTemplates: state.promptTemplates.filter((template) =>
            template.id !== id || template.isBuiltIn
          ),
          activePromptTemplateId: state.activePromptTemplateId === id ?
            null : state.activePromptTemplateId
        })),
      setActivePromptTemplate: (id) =>
        set({ activePromptTemplateId: id }),
      getPromptTemplateById: (id) => {
        return get().promptTemplates.find((template) => template.id === id);
      },

      // Prompt History
      addToPromptHistory: (prompt) => {
        const now = new Date().toISOString();
        const existingPrompt = get().promptHistory.find(
          (item) => item.prompt.toLowerCase() === prompt.toLowerCase()
        );

        if (existingPrompt) {
          set((state) => ({
            promptHistory: state.promptHistory.map((item) =>
              item.id === existingPrompt.id
                ? {
                    ...item,
                    usageCount: item.usageCount + 1,
                    lastUsed: now,
                  }
                : item
            ),
          }));
        } else {
          const newPromptHistory = {
            id: Math.random().toString(36).substring(2, 15),
            prompt,
            createdAt: now,
            usageCount: 1,
            lastUsed: now,
          };

          set((state) => ({
            promptHistory: [newPromptHistory, ...state.promptHistory].slice(0, 50), // Keep only the last 50 prompts
          }));
        }
      },
      incrementPromptUsage: (id) => {
        const now = new Date().toISOString();
        set((state) => ({
          promptHistory: state.promptHistory.map((item) =>
            item.id === id
              ? {
                  ...item,
                  usageCount: item.usageCount + 1,
                  lastUsed: now,
                }
              : item
          ),
        }));
      },
      clearPromptHistory: () => set({ promptHistory: [] }),

      // AI Suggestions
      setAISuggestions: (suggestions) => set({ aiSuggestions: suggestions }),
      clearAISuggestions: () => set({ aiSuggestions: [] }),
      setIsLoadingAISuggestions: (isLoading) => set({ isLoadingAISuggestions: isLoading }),
      generateAIPromptSuggestion: async (basePrompt) => {
        set({ isLoadingAISuggestions: true });

        try {
          // In a real app, we would call an AI API here
          // For this demo, we'll just simulate a response
          await new Promise(resolve => setTimeout(resolve, 1500));

          const suggestions = [
            {
              prompt: `${basePrompt}, highly detailed, professional photography, 8k, ultra realistic`,
              confidence: 0.95
            },
            {
              prompt: `${basePrompt}, cinematic lighting, dramatic atmosphere, artstation trending`,
              confidence: 0.85
            },
            {
              prompt: `${basePrompt}, vibrant colors, fantasy style, digital art, concept art`,
              confidence: 0.75
            }
          ];

          set({
            aiSuggestions: suggestions,
            isLoadingAISuggestions: false
          });

          return suggestions[0].prompt; // Return the highest confidence suggestion
        } catch (error) {
          console.error('Error generating AI prompt suggestion:', error);
          set({ isLoadingAISuggestions: false });
          return basePrompt; // Return the original prompt if there's an error
        }
      },

      // Image Editing
      addImageEdit: (generationId, imageIndex, edit) => {
        set((state) => {
          const generation = state.generations.find(gen => gen.id === generationId);
          if (!generation || !generation.images[imageIndex]) return state;

          const updatedImages = [...generation.images];
          const image = updatedImages[imageIndex];

          updatedImages[imageIndex] = {
            ...image,
            editHistory: [...(image.editHistory || []), edit],
            isEdited: true
          };

          return {
            generations: state.generations.map(gen =>
              gen.id === generationId
                ? { ...gen, images: updatedImages }
                : gen
            )
          };
        });
      },

      updateImageEdit: (generationId, imageIndex, editId, updates) => {
        set((state) => {
          const generation = state.generations.find(gen => gen.id === generationId);
          if (!generation || !generation.images[imageIndex]) return state;

          const image = generation.images[imageIndex];
          if (!image.editHistory) return state;

          const updatedEditHistory = image.editHistory.map(edit =>
            edit.id === editId ? { ...edit, ...updates } : edit
          );

          const updatedImages = [...generation.images];
          updatedImages[imageIndex] = {
            ...image,
            editHistory: updatedEditHistory
          };

          return {
            generations: state.generations.map(gen =>
              gen.id === generationId
                ? { ...gen, images: updatedImages }
                : gen
            )
          };
        });
      },

      removeImageEdit: (generationId, imageIndex, editId) => {
        set((state) => {
          const generation = state.generations.find(gen => gen.id === generationId);
          if (!generation || !generation.images[imageIndex]) return state;

          const image = generation.images[imageIndex];
          if (!image.editHistory) return state;

          const updatedEditHistory = image.editHistory.filter(edit => edit.id !== editId);

          const updatedImages = [...generation.images];
          updatedImages[imageIndex] = {
            ...image,
            editHistory: updatedEditHistory,
            isEdited: updatedEditHistory.length > 0
          };

          return {
            generations: state.generations.map(gen =>
              gen.id === generationId
                ? { ...gen, images: updatedImages }
                : gen
            )
          };
        });
      },

      setEditedImage: (generationId, imageIndex, editedUrl, editedB64Json) => {
        set((state) => {
          const generation = state.generations.find(gen => gen.id === generationId);
          if (!generation || !generation.images[imageIndex]) return state;

          const updatedImages = [...generation.images];
          updatedImages[imageIndex] = {
            ...updatedImages[imageIndex],
            editedUrl,
            editedB64Json,
            isEdited: true
          };

          return {
            generations: state.generations.map(gen =>
              gen.id === generationId
                ? { ...gen, images: updatedImages }
                : gen
            )
          };
        });
      },

      resetImageEdits: (generationId, imageIndex) => {
        set((state) => {
          const generation = state.generations.find(gen => gen.id === generationId);
          if (!generation || !generation.images[imageIndex]) return state;

          const updatedImages = [...generation.images];
          updatedImages[imageIndex] = {
            ...updatedImages[imageIndex],
            editedUrl: undefined,
            editedB64Json: undefined,
            editHistory: [],
            isEdited: false
          };

          return {
            generations: state.generations.map(gen =>
              gen.id === generationId
                ? { ...gen, images: updatedImages }
                : gen
            )
          };
        });
      },

      // Export/Import Functions
      exportCollection: (collectionId, options) => {
        const collection = get().collections.find(col => col.id === collectionId);
        if (!collection) return null;

        const generations = get().generations.filter(gen => gen.collectionId === collectionId);

        // Process generations based on options
        const processedGenerations = options.includeImages
          ? generations
          : generations.map(gen => ({
              ...gen,
              images: gen.images.map(img => ({
                ...img,
                b64_json: undefined,
                editedB64Json: undefined
              }))
            }));

        return {
          version: '1.0.0',
          type: 'collection',
          collection,
          generations: processedGenerations,
          exportDate: new Date().toISOString()
        };
      },

      exportTemplates: (templateIds, options) => {
        const allTemplates = get().promptTemplates;
        const templates = templateIds.length > 0
          ? allTemplates.filter(template => templateIds.includes(template.id))
          : allTemplates;

        if (templates.length === 0) return null;

        return {
          version: '1.0.0',
          type: 'template',
          templates,
          exportDate: new Date().toISOString()
        };
      },

      exportImage: (generationId, options) => {
        const generation = get().generations.find(gen => gen.id === generationId);
        if (!generation) return null;

        // Process generation based on options
        const processedGeneration = options.includeImages
          ? generation
          : {
              ...generation,
              images: generation.images.map(img => ({
                ...img,
                b64_json: undefined,
                editedB64Json: undefined
              }))
            };

        return {
          version: '1.0.0',
          type: 'image',
          generation: processedGeneration,
          exportDate: new Date().toISOString()
        };
      },

      exportAll: (options) => {
        const collections = get().collections;
        const generations = get().generations;
        const templates = get().promptTemplates;

        // Process generations based on options
        const processedGenerations = options.includeImages
          ? generations
          : generations.map(gen => ({
              ...gen,
              images: gen.images.map(img => ({
                ...img,
                b64_json: undefined,
                editedB64Json: undefined
              }))
            }));

        return {
          version: '1.0.0',
          type: 'full',
          collections,
          generations: processedGenerations,
          templates,
          exportDate: new Date().toISOString()
        };
      },

      importData: (data, options) => {
        try {
          // Validate the data
          if (!data.version || !data.type) {
            throw new Error('Invalid import file format');
          }

          // Check version compatibility
          const [majorVersion] = data.version.split('.');
          if (majorVersion !== '1') {
            throw new Error(`Incompatible version: ${data.version}. Current version: 1.0.0`);
          }

          // Process based on type
          switch (data.type) {
            case 'collection':
              return importCollection(data, options, set, get);
            case 'template':
              return importTemplates(data, options, set, get);
            case 'image':
              return importImage(data, options, set, get);
            case 'full':
              return importFull(data, options, set, get);
            default:
              throw new Error(`Unknown import type: ${data.type}`);
          }
        } catch (error) {
          console.error('Import error:', error);
          return {
            success: false,
            type: 'full',
            message: error instanceof Error ? error.message : 'Unknown error during import',
            imported: {}
          };
        }
      }
    }),
    {
      name: 'image-gen-storage',
    }
  )
);
