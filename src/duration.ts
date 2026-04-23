import type { Shot, TempoDefaults } from './types.ts';
import { estimateNarrationDuration } from './audio-timing.ts';

export interface DurationRange {
  min: number;
  max: number;
  preferred: number;
}

const DURATION_REGEX = /^(\d+(?:\.\d+)?)\s*(?:-\s*(\d+(?:\.\d+)?))?\s*s?$/;

export function parseShotDuration(shot: Shot): DurationRange | undefined {
  if (!shot.duration) return undefined;
  const match = shot.duration.trim().match(DURATION_REGEX);
  if (!match) return undefined;

  const min = parseFloat(match[1]);
  if (match[2]) {
    const max = parseFloat(match[2]);
    return { min, max, preferred: (min + max) / 2 };
  }
  return { min, max: min, preferred: min };
}

interface ContentModifier {
  patterns: RegExp;
  multiplier: number;
}

const CONTENT_MODIFIERS: ContentModifier[] = [
  { patterns: /\b(establishing|wide shot|landscape|environment|panoramic|panorama|bird'?s?.?eye)\b/i, multiplier: 1.3 },
  { patterns: /\b(close-?up|detail|insert|extreme close|macro)\b/i, multiplier: 0.7 },
  { patterns: /\b(chase|fight|action|run|explode|explosion|pursuit|rapid|crash|impact)\b/i, multiplier: 0.6 },
  { patterns: /\b(contemplat|meditat|peaceful|still|quiet|serene|tranquil|calm)\b/i, multiplier: 1.4 },
  { patterns: /\b(tracking|steadicam|orbit|follow)\b/i, multiplier: 1.2 },
];

export function estimateContentDuration(shot: Shot, tempo: TempoDefaults): number {
  const base = tempo.defaultShotDuration;
  const searchText = `${shot.description} ${shot.camera.movement} ${shot.camera.angle}`;

  let strongestMultiplier = 1.0;
  let strongestDistance = 0;

  for (const mod of CONTENT_MODIFIERS) {
    if (mod.patterns.test(searchText)) {
      const distance = Math.abs(mod.multiplier - 1.0);
      if (distance > strongestDistance) {
        strongestDistance = distance;
        strongestMultiplier = mod.multiplier;
      }
    }
  }

  const result = Math.round(base * strongestMultiplier * 2) / 2;
  return Math.max(1, Math.min(30, result));
}

export function resolveSmartDuration(
  shot: Shot,
  tempo: TempoDefaults,
  narrationText?: string,
  maxDuration?: number
): number {
  const parsed = parseShotDuration(shot);

  let base: number;
  if (parsed) {
    base = parsed.preferred;
  } else {
    base = estimateContentDuration(shot, tempo);
  }

  if (narrationText && narrationText.trim().length > 0) {
    const narrationDuration = estimateNarrationDuration(narrationText);
    base = Math.max(base, narrationDuration);
  }

  if (parsed) {
    base = Math.max(parsed.min, Math.min(parsed.max, base));
  }

  if (maxDuration != null) {
    base = Math.min(base, maxDuration);
  }

  return base;
}
