import type { Tempo, TempoDefaults } from './types.ts';

export function getTempoDefaults(tempo?: Tempo): TempoDefaults {
  switch (tempo) {
    case 'fast-cut':
      return { defaultShotDuration: 3, cameraSpeedModifier: 'rapid', transitionTiming: 'Fast' };
    case 'slow-burn':
      return { defaultShotDuration: 8, cameraSpeedModifier: 'slow, deliberate', transitionTiming: 'Slow' };
    case 'medium':
    default:
      return { defaultShotDuration: 5, cameraSpeedModifier: '', transitionTiming: '' };
  }
}
