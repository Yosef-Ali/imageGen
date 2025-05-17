import { PromptTemplate } from '@/types';
import { createPromptTemplate, extractVariablesFromTemplate } from './openai';

// Landscape templates
const landscapeTemplates: PromptTemplate[] = [
  createPromptTemplate(
    'Epic Landscape',
    'A breathtaking {{landscape_type}} landscape with {{weather_condition}}, {{time_of_day}} lighting, ultra-detailed, 8k, professional photography',
    'landscape',
    [
      { name: 'landscape_type', description: 'Type of landscape (mountain, coastal, forest, desert, etc.)', defaultValue: 'mountain' },
      { name: 'weather_condition', description: 'Weather condition (clear skies, stormy clouds, fog, etc.)', defaultValue: 'dramatic clouds' },
      { name: 'time_of_day', description: 'Time of day (sunrise, sunset, midday, night, etc.)', defaultValue: 'sunset' },
    ],
    'Creates epic, dramatic landscape images with customizable environment',
    true
  ),
  createPromptTemplate(
    'Fantasy Landscape',
    'A magical {{landscape_type}} landscape with {{fantasy_element}}, ethereal atmosphere, vibrant colors, fantasy concept art style',
    'landscape',
    [
      { name: 'landscape_type', description: 'Type of landscape (floating islands, enchanted forest, crystal canyon, etc.)', defaultValue: 'floating islands' },
      { name: 'fantasy_element', description: 'Fantasy element (glowing mushrooms, ancient ruins, magical creatures, etc.)', defaultValue: 'ancient ruins' },
    ],
    'Creates fantasy-style landscapes with magical elements',
    true
  ),
];

// Portrait templates
const portraitTemplates: PromptTemplate[] = [
  createPromptTemplate(
    'Character Portrait',
    'Portrait of a {{gender}} {{character_type}} with {{distinctive_feature}}, {{emotion}} expression, {{lighting}} lighting, highly detailed, professional photography',
    'portrait',
    [
      { name: 'gender', description: 'Gender of the character', defaultValue: 'female' },
      { name: 'character_type', description: 'Type of character (warrior, wizard, scientist, etc.)', defaultValue: 'warrior' },
      { name: 'distinctive_feature', description: 'Distinctive feature (scar, unusual eyes, unique hairstyle, etc.)', defaultValue: 'battle scars' },
      { name: 'emotion', description: 'Emotional expression (determined, joyful, contemplative, etc.)', defaultValue: 'determined' },
      { name: 'lighting', description: 'Lighting style (dramatic, soft, cinematic, etc.)', defaultValue: 'dramatic' },
    ],
    'Creates detailed character portraits with customizable features',
    true
  ),
  createPromptTemplate(
    'Fantasy Character',
    'Full body portrait of a {{race}} {{class}} with {{armor_or_clothing}} and {{weapon_or_accessory}}, fantasy style, detailed, concept art',
    'portrait',
    [
      { name: 'race', description: 'Fantasy race (human, elf, dwarf, orc, etc.)', defaultValue: 'elf' },
      { name: 'class', description: 'Character class (warrior, mage, rogue, etc.)', defaultValue: 'mage' },
      { name: 'armor_or_clothing', description: 'Armor or clothing description', defaultValue: 'ornate robes' },
      { name: 'weapon_or_accessory', description: 'Weapon or accessory', defaultValue: 'glowing staff' },
    ],
    'Creates fantasy character illustrations in a concept art style',
    true
  ),
];

// Abstract templates
const abstractTemplates: PromptTemplate[] = [
  createPromptTemplate(
    'Abstract Art',
    'Abstract {{style}} artwork with {{color_scheme}} colors, {{texture}} textures, and {{shape}} shapes, {{mood}} mood',
    'abstract',
    [
      { name: 'style', description: 'Art style (expressionist, geometric, fluid, etc.)', defaultValue: 'fluid' },
      { name: 'color_scheme', description: 'Color scheme (vibrant, monochromatic, pastel, etc.)', defaultValue: 'vibrant' },
      { name: 'texture', description: 'Texture type (smooth, rough, organic, etc.)', defaultValue: 'organic' },
      { name: 'shape', description: 'Shape types (circular, angular, flowing, etc.)', defaultValue: 'flowing' },
      { name: 'mood', description: 'Mood of the artwork (energetic, calm, chaotic, etc.)', defaultValue: 'energetic' },
    ],
    'Creates abstract artwork with customizable style elements',
    true
  ),
];

// Product templates
const productTemplates: PromptTemplate[] = [
  createPromptTemplate(
    'Product Showcase',
    'Professional product photography of a {{product_type}} with {{background}} background, {{lighting}} lighting, {{angle}} angle, commercial quality',
    'product',
    [
      { name: 'product_type', description: 'Type of product (smartphone, watch, shoes, etc.)', defaultValue: 'smartphone' },
      { name: 'background', description: 'Background style (minimalist white, gradient, contextual, etc.)', defaultValue: 'minimalist white' },
      { name: 'lighting', description: 'Lighting style (soft, dramatic, studio, etc.)', defaultValue: 'studio' },
      { name: 'angle', description: 'Camera angle (front view, 3/4 view, top-down, etc.)', defaultValue: '3/4 view' },
    ],
    'Creates professional product photography for commercial use',
    true
  ),
];

// Architecture templates
const architectureTemplates: PromptTemplate[] = [
  createPromptTemplate(
    'Architectural Visualization',
    'Architectural visualization of a {{building_type}} with {{architectural_style}} style, {{time_of_day}} lighting, {{environment}} surroundings, photorealistic rendering',
    'architecture',
    [
      { name: 'building_type', description: 'Type of building (house, skyscraper, museum, etc.)', defaultValue: 'modern house' },
      { name: 'architectural_style', description: 'Architectural style (modern, brutalist, art deco, etc.)', defaultValue: 'minimalist' },
      { name: 'time_of_day', description: 'Time of day (morning, sunset, night, etc.)', defaultValue: 'sunset' },
      { name: 'environment', description: 'Surrounding environment (urban, forest, coastal, etc.)', defaultValue: 'coastal' },
    ],
    'Creates photorealistic architectural visualizations',
    true
  ),
];

// Food templates
const foodTemplates: PromptTemplate[] = [
  createPromptTemplate(
    'Food Photography',
    'Professional food photography of {{dish_name}}, {{plating_style}} plating, {{lighting}} lighting, {{angle}} angle, mouth-watering, high-end restaurant quality',
    'food',
    [
      { name: 'dish_name', description: 'Name of the dish', defaultValue: 'pasta with truffle' },
      { name: 'plating_style', description: 'Plating style (minimalist, rustic, artistic, etc.)', defaultValue: 'artistic' },
      { name: 'lighting', description: 'Lighting style (bright, moody, natural, etc.)', defaultValue: 'natural' },
      { name: 'angle', description: 'Camera angle (overhead, 45-degree, close-up, etc.)', defaultValue: '45-degree' },
    ],
    'Creates professional food photography with customizable presentation',
    true
  ),
];

// Animal templates
const animalTemplates: PromptTemplate[] = [
  createPromptTemplate(
    'Wildlife Photography',
    'Wildlife photography of a {{animal_type}} in its {{habitat}} habitat, {{action}} action, {{time_of_day}} lighting, telephoto lens, National Geographic style',
    'animal',
    [
      { name: 'animal_type', description: 'Type of animal (lion, eagle, dolphin, etc.)', defaultValue: 'lion' },
      { name: 'habitat', description: 'Natural habitat (savanna, forest, ocean, etc.)', defaultValue: 'savanna' },
      { name: 'action', description: 'Action the animal is performing (hunting, resting, running, etc.)', defaultValue: 'hunting' },
      { name: 'time_of_day', description: 'Time of day (dawn, midday, dusk, etc.)', defaultValue: 'dawn' },
    ],
    'Creates wildlife photography in a National Geographic style',
    true
  ),
];

// Combine all templates
export const builtInTemplates: PromptTemplate[] = [
  ...landscapeTemplates,
  ...portraitTemplates,
  ...abstractTemplates,
  ...productTemplates,
  ...architectureTemplates,
  ...foodTemplates,
  ...animalTemplates,
];
