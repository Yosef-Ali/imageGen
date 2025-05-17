import OpenAI from 'openai';
import {
  GenerationParameters,
  ImageGeneration,
  GeneratedImage,
  Collection,
  PromptTemplate,
  PromptCategory,
  PromptVariable
} from '@/types';

export async function generateImage(
  apiKey: string,
  prompt: string,
  parameters: GenerationParameters
): Promise<GeneratedImage[]> {
  const openai = new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true,
  });

  try {
    const response = await openai.images.generate({
      model: parameters.model,
      prompt,
      n: parameters.n,
      size: parameters.size,
      quality: parameters.quality,
      style: parameters.style,
      response_format: "b64_json",
    });

    return response.data.map(item => ({
      url: item.url || '',
      b64_json: item.b64_json,
    }));
  } catch (error) {
    console.error('Error generating image:', error);
    throw error;
  }
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) +
         Math.random().toString(36).substring(2, 15);
}

export function createImageGeneration(
  prompt: string,
  parameters: GenerationParameters,
  collectionId?: string,
  promptTemplateId?: string
): ImageGeneration {
  return {
    id: generateId(),
    prompt,
    createdAt: new Date().toISOString(),
    images: [],
    parameters,
    status: 'pending',
    collectionId,
    favorite: false,
    promptTemplateId,
  };
}

export function createCollection(
  name: string,
  description?: string
): Collection {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    name,
    description,
    createdAt: now,
    updatedAt: now,
  };
}

export function base64ToDataUrl(base64: string): string {
  return `data:image/webp;base64,${base64}`;
}

export function downloadImage(dataUrl: string, filename: string): void {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function createPromptTemplate(
  name: string,
  template: string,
  category: PromptCategory,
  variables: PromptVariable[] = [],
  description?: string,
  isBuiltIn: boolean = false
): PromptTemplate {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    name,
    template,
    category,
    variables,
    description,
    createdAt: now,
    updatedAt: now,
    isBuiltIn,
  };
}

export function processPromptTemplate(
  template: PromptTemplate,
  variableValues: Record<string, string> = {}
): string {
  let processedPrompt = template.template;

  // Replace variables in the template
  template.variables.forEach(variable => {
    const value = variableValues[variable.name] || variable.defaultValue || '';
    const regex = new RegExp(`\\{\\{${variable.name}\\}\\}`, 'g');
    processedPrompt = processedPrompt.replace(regex, value);
  });

  return processedPrompt;
}

export function extractVariablesFromTemplate(template: string): PromptVariable[] {
  const variableRegex = /\{\{([^}]+)\}\}/g;
  const variables: PromptVariable[] = [];
  const variableNames = new Set<string>();

  let match;
  while ((match = variableRegex.exec(template)) !== null) {
    const name = match[1].trim();
    if (!variableNames.has(name)) {
      variableNames.add(name);
      variables.push({
        name,
        description: `Value for ${name}`,
        required: true,
      });
    }
  }

  return variables;
}
