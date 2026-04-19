import { Adapter, ProductionManifest, Shot } from '../types.ts';

export class RunwayGen3Adapter implements Adapter {
  name = 'runway-gen3';

  generatePrompt(manifest: ProductionManifest, shot: Shot): string {
    // Runway Gen-3 Alpha/Turbo responds extremely well to explicit structural keywords, 
    // motion descriptions at the beginning of the prompt, and technical camera terminology.
    
    const motion = shot.camera.movement !== 'Static' ? `Dynamic motion: ${shot.camera.movement}. ` : 'Static camera. ';
    const lighting = [shot.lighting.style, shot.lighting.colorTemp, shot.lighting.contrast].filter(Boolean).join(', ');

    const parts = [
      `${motion}${shot.description}`,
      `Subject: ${shot.subject || 'Not specified'}`,
      `Setting: ${shot.environment || 'Not specified'}`,
      `Cinematography: ${shot.camera.angle}, ${shot.camera.lens || '35mm prime lens'}`,
      `Lighting: ${lighting}`,
      `Aesthetics: ${manifest.mood}, ${manifest.colorPalette.join(' and ')} tones`,
      `--ar ${manifest.aspectRatio.replace(':', '')}`
    ];

    return parts.filter(p => p && p.trim() !== '').join(' | ');
  }
}
