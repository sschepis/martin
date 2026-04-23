import type { ProductionManifest, CharacterDefinition, EnvironmentDefinition, ImageEngine } from './types.ts';
import { buildVisualStyleDescription } from './adapters/prompt-utils.ts';

export interface ReferenceImageSet {
  characters: Map<string, string>;
  environments: Map<string, string>;
}

export async function generateReferenceImages(
  manifest: ProductionManifest,
  imageEngine: ImageEngine,
  aspectRatio: string
): Promise<ReferenceImageSet> {
  const result: ReferenceImageSet = {
    characters: new Map(),
    environments: new Map()
  };

  if (manifest.characters) {
    for (const char of manifest.characters) {
      console.log(`[ReferenceImages] Generating reference for character "${char.name || char.id}"...`);
      const prompt = buildCharacterReferencePrompt(char, manifest);
      const url = await imageEngine.generateImage(prompt, aspectRatio);
      result.characters.set(char.id, url);
    }
  }

  if (manifest.environments) {
    for (const env of manifest.environments) {
      console.log(`[ReferenceImages] Generating reference for environment "${env.name || env.id}"...`);
      const prompt = buildEnvironmentReferencePrompt(env, manifest);
      const url = await imageEngine.generateImage(prompt, aspectRatio);
      result.environments.set(env.id, url);
    }
  }

  return result;
}

function buildCharacterReferencePrompt(char: CharacterDefinition, manifest: ProductionManifest): string {
  let prompt = `Photorealistic portrait photograph. ${char.faceDescription}`;
  if (char.hair) prompt += `, ${char.hair}`;
  if (char.bodyType) prompt += `, ${char.bodyType}`;
  prompt += `, wearing ${char.wardrobe}`;
  if (char.distinguishingFeatures) prompt += `, ${char.distinguishingFeatures}`;
  prompt += `. ${manifest.mood} mood.`;
  const vs = buildVisualStyleDescription(manifest.visualStyle);
  if (vs) prompt += ` Visual style: ${vs}.`;
  prompt += ` Color palette: ${manifest.colorPalette.join(', ')}.`;
  prompt += ' Masterpiece, 8k resolution, highly detailed, professional photography.';
  if (manifest.negativePrompt) prompt += ` Avoid: ${manifest.negativePrompt}.`;
  return prompt;
}

function buildEnvironmentReferencePrompt(env: EnvironmentDefinition, manifest: ProductionManifest): string {
  let prompt = `Photorealistic cinematic environment photograph. ${env.spatialDescription}`;
  if (env.atmosphere) prompt += `, ${env.atmosphere}`;
  if (env.timeOfDay) prompt += ` at ${env.timeOfDay}`;
  if (env.props?.length) prompt += `. Scene includes: ${env.props.join(', ')}`;
  prompt += `. ${manifest.mood} mood. Color palette: ${manifest.colorPalette.join(', ')}.`;
  const vs = buildVisualStyleDescription(manifest.visualStyle);
  if (vs) prompt += ` Visual style: ${vs}.`;
  prompt += ' Masterpiece, 8k resolution, professional cinematography.';
  if (manifest.negativePrompt) prompt += ` Avoid: ${manifest.negativePrompt}.`;
  return prompt;
}
