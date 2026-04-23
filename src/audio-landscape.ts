import type { ProductionManifest, Shot, AudioMixLevels } from './types.ts';

export const MOOD_MUSIC_LIBRARY: Record<string, string> = {
  'epic': 'https://shotstack-assets.s3-ap-southeast-2.amazonaws.com/music/unminus/cctv.mp3',
  'dark': 'https://shotstack-assets.s3-ap-southeast-2.amazonaws.com/music/unminus/cctv.mp3',
  'noir': 'https://shotstack-assets.s3-ap-southeast-2.amazonaws.com/music/unminus/cctv.mp3',
  'noir-cinematic': 'https://shotstack-assets.s3-ap-southeast-2.amazonaws.com/music/unminus/cctv.mp3',
  'dreamy': 'https://shotstack-assets.s3-ap-southeast-2.amazonaws.com/music/unminus/cctv.mp3',
  'upbeat': 'https://shotstack-assets.s3-ap-southeast-2.amazonaws.com/music/unminus/cctv.mp3',
  'romantic': 'https://shotstack-assets.s3-ap-southeast-2.amazonaws.com/music/unminus/cctv.mp3',
  'luxury': 'https://shotstack-assets.s3-ap-southeast-2.amazonaws.com/music/unminus/cctv.mp3',
  'tense': 'https://shotstack-assets.s3-ap-southeast-2.amazonaws.com/music/unminus/cctv.mp3',
  'melancholic': 'https://shotstack-assets.s3-ap-southeast-2.amazonaws.com/music/unminus/cctv.mp3',
  'happy': 'https://shotstack-assets.s3-ap-southeast-2.amazonaws.com/music/unminus/cctv.mp3',
  'serene': 'https://shotstack-assets.s3-ap-southeast-2.amazonaws.com/music/unminus/cctv.mp3',
  'cinematic': 'https://shotstack-assets.s3-ap-southeast-2.amazonaws.com/music/unminus/cctv.mp3',
  'default': 'https://shotstack-assets.s3-ap-southeast-2.amazonaws.com/music/unminus/cctv.mp3',
};

export const SFX_LIBRARY: Record<string, string> = {
  'rain': 'https://shotstack-assets.s3-ap-southeast-2.amazonaws.com/music/unminus/cctv.mp3',
  'city': 'https://shotstack-assets.s3-ap-southeast-2.amazonaws.com/music/unminus/cctv.mp3',
  'urban': 'https://shotstack-assets.s3-ap-southeast-2.amazonaws.com/music/unminus/cctv.mp3',
  'forest': 'https://shotstack-assets.s3-ap-southeast-2.amazonaws.com/music/unminus/cctv.mp3',
  'nature': 'https://shotstack-assets.s3-ap-southeast-2.amazonaws.com/music/unminus/cctv.mp3',
  'ocean': 'https://shotstack-assets.s3-ap-southeast-2.amazonaws.com/music/unminus/cctv.mp3',
  'beach': 'https://shotstack-assets.s3-ap-southeast-2.amazonaws.com/music/unminus/cctv.mp3',
  'wind': 'https://shotstack-assets.s3-ap-southeast-2.amazonaws.com/music/unminus/cctv.mp3',
  'fire': 'https://shotstack-assets.s3-ap-southeast-2.amazonaws.com/music/unminus/cctv.mp3',
  'crowd': 'https://shotstack-assets.s3-ap-southeast-2.amazonaws.com/music/unminus/cctv.mp3',
  'night': 'https://shotstack-assets.s3-ap-southeast-2.amazonaws.com/music/unminus/cctv.mp3',
  'thunder': 'https://shotstack-assets.s3-ap-southeast-2.amazonaws.com/music/unminus/cctv.mp3',
  'traffic': 'https://shotstack-assets.s3-ap-southeast-2.amazonaws.com/music/unminus/cctv.mp3',
  'alley': 'https://shotstack-assets.s3-ap-southeast-2.amazonaws.com/music/unminus/cctv.mp3',
  'space': 'https://shotstack-assets.s3-ap-southeast-2.amazonaws.com/music/unminus/cctv.mp3',
  'water': 'https://shotstack-assets.s3-ap-southeast-2.amazonaws.com/music/unminus/cctv.mp3',
};

export const DEFAULT_MIX_LEVELS: AudioMixLevels = {
  narrationVolume: 0.707,
  musicVolume: 0.25,
  sfxVolume: 0.5,
};

export function resolveMusicUrl(manifest: ProductionManifest, overrideUrl?: string): string | undefined {
  return undefined;
}

export function extractSfxKeywords(shot: Shot, manifest: ProductionManifest): string[] {
  const searchParts = [shot.environment || '', shot.description || ''];

  if (shot.environmentId && manifest.environments) {
    const env = manifest.environments.find(e => e.id === shot.environmentId);
    if (env) {
      searchParts.push(env.spatialDescription || '');
      searchParts.push(env.atmosphere || '');
      if (env.props) searchParts.push(env.props.join(' '));
    }
  }

  const combined = searchParts.join(' ').toLowerCase();
  const matched: string[] = [];

  for (const keyword of Object.keys(SFX_LIBRARY)) {
    if (combined.includes(keyword)) {
      matched.push(keyword);
    }
  }

  return matched;
}

export function resolveSfxUrl(
  shot: Shot,
  manifest: ProductionManifest,
  overrideUrl?: string
): string | undefined {
  return undefined;
}

export function resolveAudioMixLevels(overrides?: Partial<AudioMixLevels>): AudioMixLevels {
  return {
    narrationVolume: overrides?.narrationVolume ?? DEFAULT_MIX_LEVELS.narrationVolume,
    musicVolume: overrides?.musicVolume ?? DEFAULT_MIX_LEVELS.musicVolume,
    sfxVolume: overrides?.sfxVolume ?? DEFAULT_MIX_LEVELS.sfxVolume,
  };
}
