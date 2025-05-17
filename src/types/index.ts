export interface ImageGeneration {
  id: string;
  prompt: string;
  createdAt: string;
  images: GeneratedImage[];
  parameters: GenerationParameters;
  status: 'pending' | 'completed' | 'failed';
  error?: string;
  collectionId?: string;
  favorite?: boolean;
  promptTemplateId?: string;
}

export interface GeneratedImage {
  url: string;
  b64_json?: string;
  editedUrl?: string;
  editedB64Json?: string;
  editHistory?: ImageEdit[];
  isEdited?: boolean;
}

export interface GenerationParameters {
  model: ImageModel;
  size: ImageSize;
  quality: ImageQuality;
  style: ImageStyle;
  n: number;
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PromptTemplate {
  id: string;
  name: string;
  description?: string;
  template: string;
  category: PromptCategory;
  variables: PromptVariable[];
  createdAt: string;
  updatedAt: string;
  isBuiltIn?: boolean;
}

export interface PromptVariable {
  name: string;
  description?: string;
  defaultValue?: string;
  required?: boolean;
}

export interface PromptHistory {
  id: string;
  prompt: string;
  createdAt: string;
  usageCount: number;
  lastUsed: string;
}

export interface AIPromptSuggestion {
  prompt: string;
  confidence: number;
}

export type PromptCategory =
  | 'landscape'
  | 'portrait'
  | 'abstract'
  | 'product'
  | 'character'
  | 'architecture'
  | 'food'
  | 'animal'
  | 'custom';

export interface ImageEdit {
  id: string;
  type: ImageEditType;
  parameters: ImageEditParameters;
  createdAt: string;
  description: string;
}

export interface ImageEditParameters {
  // Common parameters
  intensity?: number; // 0-100

  // Crop parameters
  cropX?: number;
  cropY?: number;
  cropWidth?: number;
  cropHeight?: number;

  // Rotate parameters
  angle?: number;

  // Filter parameters
  filterType?: ImageFilterType;

  // Adjustment parameters
  brightness?: number; // -100 to 100
  contrast?: number; // -100 to 100
  saturation?: number; // -100 to 100
  blur?: number; // 0 to 20
}

export type ImageEditType =
  | 'crop'
  | 'rotate'
  | 'filter'
  | 'adjustment';

export type ImageFilterType =
  | 'none'
  | 'grayscale'
  | 'sepia'
  | 'invert'
  | 'vintage'
  | 'blueprint'
  | 'noir';

export type ImageSize = '1024x1024' | '1024x1792' | '1792x1024';
export type ImageQuality = 'standard' | 'hd';
export type ImageStyle = 'vivid' | 'natural';
export type ImageModel = 'dall-e-3' | 'gpt-image-1';
