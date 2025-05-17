import { 
  ImageEdit, 
  ImageEditParameters, 
  ImageEditType, 
  ImageFilterType 
} from '@/types';
import { generateId } from './openai';

/**
 * Creates a new image edit object
 */
export function createImageEdit(
  type: ImageEditType,
  parameters: ImageEditParameters,
  description: string
): ImageEdit {
  return {
    id: generateId(),
    type,
    parameters,
    createdAt: new Date().toISOString(),
    description
  };
}

/**
 * Applies image edits to a canvas
 */
export function applyEditsToCanvas(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  originalImage: HTMLImageElement,
  edits: ImageEdit[]
): void {
  // Clear canvas and draw original image
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);
  
  // Sort edits by creation date
  const sortedEdits = [...edits].sort((a, b) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
  
  // Apply each edit in sequence
  for (const edit of sortedEdits) {
    applyEditToCanvas(canvas, ctx, edit);
  }
}

/**
 * Applies a single edit to a canvas
 */
function applyEditToCanvas(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  edit: ImageEdit
): void {
  const { type, parameters } = edit;
  
  switch (type) {
    case 'crop':
      applyCrop(canvas, ctx, parameters);
      break;
    case 'rotate':
      applyRotate(canvas, ctx, parameters);
      break;
    case 'filter':
      applyFilter(canvas, ctx, parameters);
      break;
    case 'adjustment':
      applyAdjustment(canvas, ctx, parameters);
      break;
  }
}

/**
 * Applies crop to canvas
 */
function applyCrop(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  parameters: ImageEditParameters
): void {
  const { cropX, cropY, cropWidth, cropHeight } = parameters;
  
  if (
    cropX === undefined || 
    cropY === undefined || 
    cropWidth === undefined || 
    cropHeight === undefined
  ) {
    return;
  }
  
  // Get current image data
  const imageData = ctx.getImageData(cropX, cropY, cropWidth, cropHeight);
  
  // Resize canvas to crop dimensions
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = cropWidth;
  tempCanvas.height = cropHeight;
  const tempCtx = tempCanvas.getContext('2d');
  
  if (!tempCtx) return;
  
  // Draw cropped image to temp canvas
  tempCtx.putImageData(imageData, 0, 0);
  
  // Clear original canvas and resize
  canvas.width = cropWidth;
  canvas.height = cropHeight;
  
  // Draw temp canvas to original
  ctx.drawImage(tempCanvas, 0, 0);
}

/**
 * Applies rotation to canvas
 */
function applyRotate(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  parameters: ImageEditParameters
): void {
  const { angle } = parameters;
  
  if (angle === undefined) return;
  
  const radians = (angle * Math.PI) / 180;
  
  // Save current image
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = canvas.width;
  tempCanvas.height = canvas.height;
  const tempCtx = tempCanvas.getContext('2d');
  
  if (!tempCtx) return;
  
  tempCtx.putImageData(imageData, 0, 0);
  
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Move to center, rotate, and draw
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(radians);
  ctx.drawImage(
    tempCanvas, 
    -canvas.width / 2, 
    -canvas.height / 2, 
    canvas.width, 
    canvas.height
  );
  ctx.restore();
}

/**
 * Applies filter to canvas
 */
function applyFilter(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  parameters: ImageEditParameters
): void {
  const { filterType, intensity = 100 } = parameters;
  
  if (!filterType || filterType === 'none') return;
  
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const factor = intensity / 100;
  
  switch (filterType) {
    case 'grayscale':
      for (let i = 0; i < data.length; i += 4) {
        const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
        data[i] = data[i] * (1 - factor) + gray * factor;
        data[i + 1] = data[i + 1] * (1 - factor) + gray * factor;
        data[i + 2] = data[i + 2] * (1 - factor) + gray * factor;
      }
      break;
    case 'sepia':
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        const sepiaR = (r * 0.393 + g * 0.769 + b * 0.189);
        const sepiaG = (r * 0.349 + g * 0.686 + b * 0.168);
        const sepiaB = (r * 0.272 + g * 0.534 + b * 0.131);
        
        data[i] = r * (1 - factor) + sepiaR * factor;
        data[i + 1] = g * (1 - factor) + sepiaG * factor;
        data[i + 2] = b * (1 - factor) + sepiaB * factor;
      }
      break;
    case 'invert':
      for (let i = 0; i < data.length; i += 4) {
        data[i] = data[i] * (1 - factor) + (255 - data[i]) * factor;
        data[i + 1] = data[i + 1] * (1 - factor) + (255 - data[i + 1]) * factor;
        data[i + 2] = data[i + 2] * (1 - factor) + (255 - data[i + 2]) * factor;
      }
      break;
    case 'vintage':
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        const vintageR = r * 0.9 + g * 0.05 + b * 0.05;
        const vintageG = r * 0.05 + g * 0.9 + b * 0.05;
        const vintageB = r * 0.05 + g * 0.05 + b * 0.9;
        
        data[i] = r * (1 - factor) + vintageR * factor;
        data[i + 1] = g * (1 - factor) + vintageG * factor;
        data[i + 2] = b * (1 - factor) + vintageB * factor;
      }
      break;
    case 'blueprint':
      for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        data[i] = data[i] * (1 - factor) + (avg * 0.1) * factor;
        data[i + 1] = data[i + 1] * (1 - factor) + (avg * 0.3) * factor;
        data[i + 2] = data[i + 2] * (1 - factor) + (avg * 1.0) * factor;
      }
      break;
    case 'noir':
      for (let i = 0; i < data.length; i += 4) {
        const gray = (data[i] * 0.3 + data[i + 1] * 0.59 + data[i + 2] * 0.11);
        const contrast = gray * 1.5;
        
        data[i] = data[i] * (1 - factor) + contrast * factor;
        data[i + 1] = data[i + 1] * (1 - factor) + contrast * factor;
        data[i + 2] = data[i + 2] * (1 - factor) + contrast * factor;
      }
      break;
  }
  
  ctx.putImageData(imageData, 0, 0);
}

/**
 * Applies adjustments to canvas
 */
function applyAdjustment(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  parameters: ImageEditParameters
): void {
  const { 
    brightness = 0, 
    contrast = 0, 
    saturation = 0,
    blur = 0
  } = parameters;
  
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  // Apply brightness
  if (brightness !== 0) {
    const factor = brightness / 100;
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, Math.max(0, data[i] + 255 * factor));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + 255 * factor));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + 255 * factor));
    }
  }
  
  // Apply contrast
  if (contrast !== 0) {
    const factor = (contrast + 100) / 100;
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, Math.max(0, ((data[i] / 255 - 0.5) * factor + 0.5) * 255));
      data[i + 1] = Math.min(255, Math.max(0, ((data[i + 1] / 255 - 0.5) * factor + 0.5) * 255));
      data[i + 2] = Math.min(255, Math.max(0, ((data[i + 2] / 255 - 0.5) * factor + 0.5) * 255));
    }
  }
  
  // Apply saturation
  if (saturation !== 0) {
    const factor = (saturation + 100) / 100;
    for (let i = 0; i < data.length; i += 4) {
      const gray = 0.2989 * data[i] + 0.5870 * data[i + 1] + 0.1140 * data[i + 2];
      data[i] = Math.min(255, Math.max(0, gray + factor * (data[i] - gray)));
      data[i + 1] = Math.min(255, Math.max(0, gray + factor * (data[i + 1] - gray)));
      data[i + 2] = Math.min(255, Math.max(0, gray + factor * (data[i + 2] - gray)));
    }
  }
  
  ctx.putImageData(imageData, 0, 0);
  
  // Apply blur (using CSS filter)
  if (blur > 0) {
    // We need to use a temporary canvas for the blur effect
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    
    if (!tempCtx) return;
    
    // Draw current canvas to temp canvas
    tempCtx.drawImage(canvas, 0, 0);
    
    // Clear original canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set blur filter and draw back
    ctx.filter = `blur(${blur}px)`;
    ctx.drawImage(tempCanvas, 0, 0);
    ctx.filter = 'none';
  }
}

/**
 * Converts canvas to data URL
 */
export function canvasToDataURL(canvas: HTMLCanvasElement): string {
  return canvas.toDataURL('image/webp', 0.9);
}

/**
 * Converts data URL to base64 string
 */
export function dataURLToBase64(dataURL: string): string {
  return dataURL.split(',')[1];
}

/**
 * Gets filter name for display
 */
export function getFilterName(filterType: ImageFilterType): string {
  switch (filterType) {
    case 'none': return 'None';
    case 'grayscale': return 'Grayscale';
    case 'sepia': return 'Sepia';
    case 'invert': return 'Invert';
    case 'vintage': return 'Vintage';
    case 'blueprint': return 'Blueprint';
    case 'noir': return 'Noir';
    default: return 'Unknown';
  }
}
