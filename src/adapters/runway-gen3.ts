import { Adapter, ProductionManifest, Shot, ShotContext } from '../types.ts';
import { resolveStyleGuards, resolveNegativePrompt, resolveSubject, resolveEnvironmentDesc, resolveColorGrading, buildContextPrefix, resolveCameraMovement } from './prompt-utils.ts';

export class RunwayGen3Adapter implements Adapter {
  name = 'runway-gen3';

  generatePrompt(manifest: ProductionManifest, shot: Shot, context?: ShotContext): string {
    const movement = resolveCameraMovement(shot, context);
    const motion = movement.toLowerCase().includes('static') ? 'Static camera. ' : `Dynamic motion: ${movement}. `;
    const lighting = [shot.lighting.style, shot.lighting.colorTemp, shot.lighting.contrast].filter(Boolean).join(', ');

    const subject = resolveSubject(manifest, shot, context);
    const environment = resolveEnvironmentDesc(manifest, shot);
    const colorGrading = resolveColorGrading(manifest);
    const guards = resolveStyleGuards(manifest);
    const aesthetics = [manifest.mood, `${colorGrading} tones`, ...guards].join(', ');
    const contextPrefix = buildContextPrefix(manifest, shot, context);

    const parts = [
      `${contextPrefix}${motion}${shot.description}`,
      `Subject: ${subject}`,
      `Setting: ${environment}`,
      `Cinematography: ${shot.camera.angle}, ${shot.camera.lens || '35mm prime lens'}`,
      `Lighting: ${lighting}`,
      `Aesthetics: ${aesthetics}`,
      `--ar ${manifest.aspectRatio.replace(':', '')}`
    ];

    const neg = resolveNegativePrompt(manifest);
    if (neg) parts.push(`Negative: ${neg}`);

    return parts.filter(p => p && p.trim() !== '').join(' | ');
  }
}
