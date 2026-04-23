import type { VideoEngineResult, VideoGenerationOptions } from './types.ts';

export interface ValidationResult {
  valid: boolean;
  issues: string[];
  score: number;
}

function parseAspectRatio(ratio: string): { w: number; h: number } | undefined {
  const match = ratio.match(/^(\d+):(\d+)$/);
  if (!match) return undefined;
  return { w: parseInt(match[1], 10), h: parseInt(match[2], 10) };
}

function aspectRatioMatch(actual: { w: number; h: number }, expected: { w: number; h: number }): boolean {
  const actualRatio = actual.w / actual.h;
  const expectedRatio = expected.w / expected.h;
  return Math.abs(actualRatio - expectedRatio) / expectedRatio < 0.05;
}

export function validateVideoResult(
  result: VideoEngineResult,
  expected: VideoGenerationOptions
): ValidationResult {
  let score = 1.0;
  const issues: string[] = [];

  if (!result.url || !result.url.startsWith('http')) {
    issues.push('Video URL is invalid or missing');
    score -= 0.5;
  }

  if (result.duration != null && expected.duration != null) {
    if (result.duration < expected.duration * 0.5) {
      issues.push(`Video duration ${result.duration}s is significantly shorter than expected ${expected.duration}s`);
      score -= 0.3;
    } else if (result.duration > expected.duration * 2.0) {
      issues.push(`Video duration ${result.duration}s is significantly longer than expected ${expected.duration}s`);
      score -= 0.1;
    }
  }

  if (result.width != null && result.height != null) {
    const expectedAR = parseAspectRatio(expected.aspectRatio);
    if (expectedAR) {
      const actualAR = { w: result.width, h: result.height };
      if (!aspectRatioMatch(actualAR, expectedAR)) {
        issues.push(`Aspect ratio mismatch: got ${result.width}x${result.height}, expected ${expected.aspectRatio}`);
        score -= 0.2;
      }
    }
  }

  const FALLBACK_PATTERNS = ['shotstack-assets', 'mock', 'placeholder', 'fallback'];
  if (result.url && FALLBACK_PATTERNS.some(p => result.url.includes(p))) {
    issues.push('Result appears to be a fallback/mock URL');
    score -= 0.1;
  }

  score = Math.max(0, Math.min(1, score));

  return {
    valid: issues.length === 0 || score >= 0.5,
    issues,
    score,
  };
}

export function buildRetryPrompt(originalPrompt: string, issues: string[]): string {
  const issuesSummary = issues.join('; ');
  let retryPrefix = `[RETRY - Previous generation had issues: ${issuesSummary}. Please ensure this generation avoids these issues.] `;

  if (issues.some(i => i.includes('duration'))) {
    retryPrefix += 'Ensure the video has clear motion throughout its full duration. ';
  }
  if (issues.some(i => i.includes('spect ratio'))) {
    retryPrefix += 'Ensure correct framing for the specified aspect ratio. ';
  }

  return retryPrefix + originalPrompt;
}
