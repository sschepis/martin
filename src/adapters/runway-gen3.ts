import { Adapter, ProductionManifest, Shot } from '../types';

export class RunwayGen3Adapter implements Adapter {
  name = 'runway-gen3';

  generatePrompt(manifest: ProductionManifest, shot: Shot): string {
    // Runway Gen-3 responds well to comma-separated descriptive keywords and explicit motion cues.
    const parts = [
      `[Cinematic Video]`,
      shot.description,
      `Subject: ${shot.subject || 'Not specified'}`,
      `Environment: ${shot.environment || 'Not specified'}`,
      `Camera: ${shot.camera.movement}, ${shot.camera.angle}, ${shot.camera.lens || 'standard lens'}`,
      `Lighting: ${shot.lighting.style}, ${shot.lighting.colorTemp || ''}, ${shot.lighting.contrast || ''}`,
      `Mood: ${manifest.mood}`,
      `Color Palette: ${manifest.colorPalette.join(', ')}`,
      `--ar ${manifest.aspectRatio.replace(':', '')}`
    ];

    return parts.filter(p => p && p.trim() !== '').join(' | ');
  }
}
