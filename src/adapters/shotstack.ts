import { Adapter, ProductionManifest, Shot, ShotContext } from '../types.ts';
import { resolveSubject, resolveEnvironmentDesc } from './prompt-utils.ts';

export class ShotstackAdapter implements Adapter {
  name = 'shotstack';

  generatePrompt(manifest: ProductionManifest, shot: Shot, _context?: ShotContext): string {
    const output: Record<string, unknown> = {
      asset: {
        type: 'video',
        description: shot.description,
        subject: resolveSubject(manifest, shot, _context),
        environment: resolveEnvironmentDesc(manifest, shot)
      },
      length: shot.duration ? parseFloat(shot.duration) : 5.0,
      transition: {
        in: 'fade',
        out: 'fade'
      }
    };

    if (manifest.negativePrompt) output.negativePrompt = manifest.negativePrompt;
    if (manifest.styleGuards?.length) output.styleGuards = manifest.styleGuards;
    if (manifest.visualStyle) output.visualStyle = manifest.visualStyle;

    return JSON.stringify(output, null, 2);
  }
}
