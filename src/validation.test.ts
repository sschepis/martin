import { test, describe } from 'node:test';
import * as assert from 'node:assert';
import { validateVideoResult, buildRetryPrompt } from './validation.ts';
import type { VideoEngineResult, VideoGenerationOptions } from './types.ts';

const DEFAULT_OPTIONS: VideoGenerationOptions = {
  aspectRatio: '16:9',
  duration: 5,
};

describe('validateVideoResult', () => {
  test('valid result scores 1.0', () => {
    const result: VideoEngineResult = { url: 'https://example.com/video.mp4', duration: 5 };
    const validation = validateVideoResult(result, DEFAULT_OPTIONS);
    assert.strictEqual(validation.valid, true);
    assert.strictEqual(validation.score, 1.0);
    assert.strictEqual(validation.issues.length, 0);
  });

  test('missing URL fails validation', () => {
    const result: VideoEngineResult = { url: '' };
    const validation = validateVideoResult(result, DEFAULT_OPTIONS);
    assert.ok(validation.issues.some(i => i.includes('URL')));
    assert.ok(validation.score <= 0.5);
  });

  test('non-http URL fails validation', () => {
    const result: VideoEngineResult = { url: '/local/path.mp4' };
    const validation = validateVideoResult(result, DEFAULT_OPTIONS);
    assert.ok(validation.issues.some(i => i.includes('URL')));
  });

  test('short duration triggers issue', () => {
    const result: VideoEngineResult = { url: 'https://example.com/video.mp4', duration: 1 };
    const validation = validateVideoResult(result, { ...DEFAULT_OPTIONS, duration: 5 });
    assert.ok(validation.issues.some(i => i.includes('shorter')));
    assert.ok(validation.score < 1.0);
  });

  test('long duration triggers mild issue', () => {
    const result: VideoEngineResult = { url: 'https://example.com/video.mp4', duration: 20 };
    const validation = validateVideoResult(result, { ...DEFAULT_OPTIONS, duration: 5 });
    assert.ok(validation.issues.some(i => i.includes('longer')));
    assert.ok(validation.valid);
  });

  test('aspect ratio mismatch detected', () => {
    const result: VideoEngineResult = { url: 'https://example.com/video.mp4', width: 1080, height: 1920 };
    const validation = validateVideoResult(result, { ...DEFAULT_OPTIONS, aspectRatio: '16:9' });
    assert.ok(validation.issues.some(i => i.includes('spect ratio')));
  });

  test('matching aspect ratio passes', () => {
    const result: VideoEngineResult = { url: 'https://example.com/video.mp4', width: 1920, height: 1080 };
    const validation = validateVideoResult(result, { ...DEFAULT_OPTIONS, aspectRatio: '16:9' });
    assert.ok(!validation.issues.some(i => i.includes('spect ratio')));
  });

  test('fallback URL triggers warning', () => {
    const result: VideoEngineResult = { url: 'https://shotstack-assets.s3-ap-southeast-2.amazonaws.com/footage/earth.mp4' };
    const validation = validateVideoResult(result, DEFAULT_OPTIONS);
    assert.ok(validation.issues.some(i => i.includes('fallback')));
    assert.ok(validation.valid);
  });

  test('score clamps to [0, 1]', () => {
    const result: VideoEngineResult = { url: '', duration: 0.5, width: 100, height: 100 };
    const validation = validateVideoResult(result, { ...DEFAULT_OPTIONS, aspectRatio: '16:9', duration: 10 });
    assert.ok(validation.score >= 0);
    assert.ok(validation.score <= 1);
  });
});

describe('buildRetryPrompt', () => {
  test('includes issues in retry prefix', () => {
    const prompt = buildRetryPrompt('Generate a video', ['Video URL is invalid']);
    assert.ok(prompt.includes('Video URL is invalid'));
    assert.ok(prompt.includes('[RETRY'));
    assert.ok(prompt.includes('Generate a video'));
  });

  test('adds duration reminder for duration issues', () => {
    const prompt = buildRetryPrompt('Generate a video', ['Video duration 1s is significantly shorter than expected 5s']);
    assert.ok(prompt.includes('duration'));
    assert.ok(prompt.includes('motion throughout'));
  });

  test('adds framing reminder for aspect ratio issues', () => {
    const prompt = buildRetryPrompt('Generate a video', ['Aspect ratio mismatch: got 1080x1920, expected 16:9']);
    assert.ok(prompt.includes('framing'));
    assert.ok(prompt.includes('aspect ratio'));
  });

  test('preserves original prompt', () => {
    const original = 'Cinematic shot of a sunset over the ocean';
    const prompt = buildRetryPrompt(original, ['some issue']);
    assert.ok(prompt.endsWith(original));
  });
});
