import { Adapter, ProductionManifest, Shot } from '../types';

export class WeryAIAdapter implements Adapter {
  name = 'weryai';

  generatePrompt(manifest: ProductionManifest, shot: Shot): string {
    // WeryAI (Kling/Veo engine) responds best to highly descriptive, visually rich, and natural language narrative prompts.
    // We avoid robotic "Subject: X, Camera: Y" formats and instead weave the technical details into a cohesive visual description.
    
    const cameraDesc = `${shot.camera.movement} movement from a ${shot.camera.angle} angle`;
    const lensDesc = shot.camera.lens ? `shot on a ${shot.camera.lens} lens` : 'cinematic framing';
    const lightingDesc = `${shot.lighting.style} lighting${shot.lighting.colorTemp ? ` at ${shot.lighting.colorTemp}` : ''}${shot.lighting.contrast ? `, ${shot.lighting.contrast}` : ''}`;

    return `Photorealistic, high-quality cinematic video. ${shot.description} ` +
           `The scene features ${shot.subject || 'the main subject'} in ${shot.environment || 'a detailed environment'}. ` +
           `Visually, the camera uses a ${cameraDesc}, ${lensDesc}. ` +
           `The atmosphere is defined by ${lightingDesc}, creating a deeply ${manifest.mood} mood. ` +
           `Color grading highlights ${manifest.colorPalette.join(', ')}. ` +
           `Masterpiece, 8k resolution, highly detailed, professional cinematography.`;
  }
}
