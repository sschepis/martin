import { Adapter, ProductionManifest, Shot } from '../types';

export class WeryAIAdapter implements Adapter {
  name = 'weryai';

  generatePrompt(manifest: ProductionManifest, shot: Shot): string {
    // WeryAI specific prompt formatting
    return `Create a cinematic video. Subject: ${shot.subject || 'none'}. ` +
           `Environment: ${shot.environment || 'none'}. ` +
           `Action: ${shot.description}. ` +
           `Camera: ${shot.camera.movement}, ${shot.camera.angle}, ${shot.camera.lens || 'standard'}. ` +
           `Lighting: ${shot.lighting.style}. ` +
           `Mood: ${manifest.mood}. Colors: ${manifest.colorPalette.join(', ')}.`;
  }
}
