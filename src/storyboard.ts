import type {
  ProductionManifest, Shot, ImageEngine, StoryboardFrame,
  StoryboardResult, StoryboardAnnotation, ShotContext
} from './types.ts';
import { getTempoDefaults } from './tempo.ts';
import { resolveSmartDuration } from './duration.ts';

export function buildStoryboardImagePrompt(
  manifest: ProductionManifest,
  shot: Shot,
  _context?: ShotContext
): string {
  const parts: string[] = [];
  parts.push('Cinematic storyboard frame, professional illustration style.');
  parts.push(shot.description);

  if (shot.subject) parts.push(`Subject: ${shot.subject}.`);
  if (shot.environment) parts.push(`Setting: ${shot.environment}.`);

  parts.push(`Camera: ${shot.camera.angle}, ${shot.camera.movement}.`);
  if (shot.camera.lens) parts.push(`Lens: ${shot.camera.lens}.`);
  parts.push(`Lighting: ${shot.lighting.style}.`);
  parts.push(`Mood: ${manifest.mood}. Color palette: ${manifest.colorPalette.join(', ')}.`);

  if (manifest.negativePrompt) parts.push(`Avoid: ${manifest.negativePrompt}.`);

  return parts.join(' ');
}

export function buildAnnotation(
  manifest: ProductionManifest,
  shot: Shot
): StoryboardAnnotation {
  const annotation: StoryboardAnnotation = {
    cameraMovement: shot.camera.movement,
    cameraAngle: shot.camera.angle,
    lightingStyle: shot.lighting.style,
    duration: shot.duration || '5s',
  };
  if (shot.camera.lens) annotation.lens = shot.camera.lens;
  if (shot.narration) annotation.narration = shot.narration;
  if (shot.environment) annotation.environment = shot.environment;
  if (shot.characterIds && manifest.characters) {
    annotation.characters = shot.characterIds
      .map(id => manifest.characters!.find(c => c.id === id)?.name || id)
      .filter(Boolean);
  }
  if (shot.transition) {
    annotation.transition = `${shot.transition.type}${shot.transition.duration ? ` (${shot.transition.duration}s)` : ''}`;
  }
  return annotation;
}

export async function generateStoryboard(
  manifest: ProductionManifest,
  imageEngine: ImageEngine
): Promise<StoryboardResult> {
  const frames: StoryboardFrame[] = [];
  const tempoDefaults = getTempoDefaults(manifest.tempo);
  let totalDuration = 0;

  for (let i = 0; i < manifest.shots.length; i++) {
    const shot = manifest.shots[i];
    const context: ShotContext = {
      shotIndex: i,
      totalShots: manifest.shots.length,
      previousShot: i > 0 ? manifest.shots[i - 1] : undefined,
      tempo: tempoDefaults,
    };

    console.log(`[Storyboard] Generating frame ${i + 1}/${manifest.shots.length}: ${shot.id}`);
    const prompt = buildStoryboardImagePrompt(manifest, shot, context);
    const imageUrl = await imageEngine.generateImage(prompt, manifest.aspectRatio);
    const annotation = buildAnnotation(manifest, shot);
    const duration = resolveSmartDuration(shot, tempoDefaults, shot.narration);
    totalDuration += duration;

    frames.push({
      shotId: shot.id,
      imageUrl,
      shot,
      annotations: annotation,
    });
  }

  return {
    title: manifest.title,
    mood: manifest.mood,
    frames,
    totalDuration,
  };
}
