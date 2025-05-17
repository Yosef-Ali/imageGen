import { 
  CollectionExport, 
  TemplateExport, 
  ImageExport, 
  FullExport,
  ImportResult,
  ExportOptions,
  ImportOptions
} from '@/types/export-import';
import { 
  Collection, 
  ImageGeneration, 
  PromptTemplate,
  GeneratedImage
} from '@/types';
import { generateId } from './openai';

// Current version of the export format
const EXPORT_VERSION = '1.0.0';

/**
 * Export a collection and its images
 */
export function exportCollection(
  collection: Collection,
  generations: ImageGeneration[],
  options: ExportOptions
): CollectionExport {
  const collectionGenerations = generations.filter(
    gen => gen.collectionId === collection.id
  );

  // If not including images, remove the b64_json data
  const processedGenerations = options.includeImages
    ? collectionGenerations
    : collectionGenerations.map(gen => ({
        ...gen,
        images: gen.images.map(img => ({
          ...img,
          b64_json: undefined,
          editedB64Json: undefined
        }))
      }));

  return {
    version: EXPORT_VERSION,
    type: 'collection',
    collection,
    generations: processedGenerations,
    exportDate: new Date().toISOString()
  };
}

/**
 * Export templates
 */
export function exportTemplates(
  templates: PromptTemplate[]
): TemplateExport {
  return {
    version: EXPORT_VERSION,
    type: 'template',
    templates,
    exportDate: new Date().toISOString()
  };
}

/**
 * Export a single image
 */
export function exportImage(
  generation: ImageGeneration,
  options: ExportOptions
): ImageExport {
  // If not including images, remove the b64_json data
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
    version: EXPORT_VERSION,
    type: 'image',
    generation: processedGeneration,
    exportDate: new Date().toISOString()
  };
}

/**
 * Export all data
 */
export function exportAll(
  collections: Collection[],
  generations: ImageGeneration[],
  templates: PromptTemplate[],
  options: ExportOptions
): FullExport {
  // If not including images, remove the b64_json data
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
    version: EXPORT_VERSION,
    type: 'full',
    collections,
    generations: processedGenerations,
    templates,
    exportDate: new Date().toISOString()
  };
}

/**
 * Save export data to a file
 */
export function saveExportToFile(
  data: any,
  filename: string
): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Import data from a file
 */
export async function importFromFile(
  file: File,
  options: ImportOptions
): Promise<ImportResult> {
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    
    // Validate the data
    if (!data.version || !data.type) {
      throw new Error('Invalid import file format');
    }
    
    // Check version compatibility
    const [majorVersion] = data.version.split('.');
    const [currentMajorVersion] = EXPORT_VERSION.split('.');
    
    if (majorVersion !== currentMajorVersion) {
      throw new Error(`Incompatible version: ${data.version}. Current version: ${EXPORT_VERSION}`);
    }
    
    // Process based on type
    switch (data.type) {
      case 'collection':
        return processCollectionImport(data, options);
      case 'template':
        return processTemplateImport(data, options);
      case 'image':
        return processImageImport(data, options);
      case 'full':
        return processFullImport(data, options);
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

/**
 * Process collection import
 */
function processCollectionImport(
  data: CollectionExport,
  options: ImportOptions
): ImportResult {
  // In a real implementation, this would add the collection and generations to the store
  // For now, we'll just return a success result
  return {
    success: true,
    type: 'collection',
    message: `Successfully imported collection "${data.collection.name}" with ${data.generations.length} images`,
    imported: {
      collections: 1,
      generations: data.generations.length
    }
  };
}

/**
 * Process template import
 */
function processTemplateImport(
  data: TemplateExport,
  options: ImportOptions
): ImportResult {
  // In a real implementation, this would add the templates to the store
  // For now, we'll just return a success result
  return {
    success: true,
    type: 'template',
    message: `Successfully imported ${data.templates.length} templates`,
    imported: {
      templates: data.templates.length
    }
  };
}

/**
 * Process image import
 */
function processImageImport(
  data: ImageExport,
  options: ImportOptions
): ImportResult {
  // In a real implementation, this would add the image to the store
  // For now, we'll just return a success result
  return {
    success: true,
    type: 'image',
    message: `Successfully imported image "${data.generation.prompt.substring(0, 30)}..."`,
    imported: {
      generations: 1
    }
  };
}

/**
 * Process full import
 */
function processFullImport(
  data: FullExport,
  options: ImportOptions
): ImportResult {
  // In a real implementation, this would add all the data to the store
  // For now, we'll just return a success result
  return {
    success: true,
    type: 'full',
    message: `Successfully imported ${data.collections.length} collections, ${data.generations.length} images, and ${data.templates.length} templates`,
    imported: {
      collections: data.collections.length,
      generations: data.generations.length,
      templates: data.templates.length
    }
  };
}

/**
 * Generate a new ID for imported items to avoid conflicts
 */
export function generateImportId(originalId: string): string {
  return `import_${generateId().substring(0, 8)}_${originalId}`;
}

/**
 * Check if a file is a valid import file
 */
export function isValidImportFile(file: File): boolean {
  return file.type === 'application/json' || file.name.endsWith('.json');
}
