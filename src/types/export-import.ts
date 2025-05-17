import { 
  ImageGeneration, 
  Collection, 
  PromptTemplate,
  GeneratedImage
} from '@/types';

/**
 * Export data format for collections
 */
export interface CollectionExport {
  version: string;
  type: 'collection';
  collection: Collection;
  generations: ImageGeneration[];
  exportDate: string;
}

/**
 * Export data format for templates
 */
export interface TemplateExport {
  version: string;
  type: 'template';
  templates: PromptTemplate[];
  exportDate: string;
}

/**
 * Export data format for a single image
 */
export interface ImageExport {
  version: string;
  type: 'image';
  generation: ImageGeneration;
  exportDate: string;
}

/**
 * Export data format for all data
 */
export interface FullExport {
  version: string;
  type: 'full';
  collections: Collection[];
  generations: ImageGeneration[];
  templates: PromptTemplate[];
  exportDate: string;
}

/**
 * Union type for all export formats
 */
export type ExportData = 
  | CollectionExport 
  | TemplateExport 
  | ImageExport 
  | FullExport;

/**
 * Import result
 */
export interface ImportResult {
  success: boolean;
  type: 'collection' | 'template' | 'image' | 'full';
  message: string;
  imported: {
    collections?: number;
    generations?: number;
    templates?: number;
    images?: number;
  };
}

/**
 * Export options
 */
export interface ExportOptions {
  includeImages: boolean;
  format: 'json' | 'zip';
}

/**
 * Import options
 */
export interface ImportOptions {
  replaceExisting: boolean;
  importImages: boolean;
}
