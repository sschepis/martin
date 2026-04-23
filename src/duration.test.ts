import { test, describe } from 'node:test';
import * as assert from 'node:assert';
import { parseShotDuration, estimateContentDuration, resolveSmartDuration } from './duration.ts';
import type { Shot, TempoDefaults } from './types.ts';

const MEDIUM_TEMPO: TempoDefaults = { defaultShotDuration: 5, cameraSpeedModifier: '', transitionTiming: '' };
const FAST_TEMPO: TempoDefaults = { defaultShotDuration: 3, cameraSpeedModifier: 'rapid', transitionTiming: 'Fast' };
const SLOW_TEMPO: TempoDefaults = { defaultShotDuration: 8, cameraSpeedModifier: 'slow, deliberate', transitionTiming: 'Slow' };

function makeShot(overrides: Partial<Shot> = {}): Shot {
  return {
    id: '1',
    description: 'A test scene',
    camera: { movement: 'static', angle: 'eye-level' },
    lighting: { style: 'natural' },
    ...overrides,
  };
}

describe('parseShotDuration', () => {
  test('parses "5s"', () => {
    const result = parseShotDuration(makeShot({ duration: '5s' }));
    assert.deepStrictEqual(result, { min: 5, max: 5, preferred: 5 });
  });

  test('parses "3-7s"', () => {
    const result = parseShotDuration(makeShot({ duration: '3-7s' }));
    assert.deepStrictEqual(result, { min: 3, max: 7, preferred: 5 });
  });

  test('parses "3.5s"', () => {
    const result = parseShotDuration(makeShot({ duration: '3.5s' }));
    assert.deepStrictEqual(result, { min: 3.5, max: 3.5, preferred: 3.5 });
  });

  test('parses numeric string "10"', () => {
    const result = parseShotDuration(makeShot({ duration: '10' }));
    assert.deepStrictEqual(result, { min: 10, max: 10, preferred: 10 });
  });

  test('returns undefined for missing duration', () => {
    const result = parseShotDuration(makeShot());
    assert.strictEqual(result, undefined);
  });

  test('returns undefined for unparseable string', () => {
    const result = parseShotDuration(makeShot({ duration: 'long' }));
    assert.strictEqual(result, undefined);
  });
});

describe('estimateContentDuration', () => {
  test('establishing shot gets longer duration', () => {
    const shot = makeShot({ description: 'Establishing shot of the city skyline' });
    const duration = estimateContentDuration(shot, MEDIUM_TEMPO);
    assert.ok(duration > MEDIUM_TEMPO.defaultShotDuration, `Expected > 5, got ${duration}`);
  });

  test('close-up gets shorter duration', () => {
    const shot = makeShot({ description: 'Close-up on the subject face' });
    const duration = estimateContentDuration(shot, MEDIUM_TEMPO);
    assert.ok(duration < MEDIUM_TEMPO.defaultShotDuration, `Expected < 5, got ${duration}`);
  });

  test('action shot gets shortest multiplier', () => {
    const shot = makeShot({ description: 'Chase sequence through the streets' });
    const duration = estimateContentDuration(shot, MEDIUM_TEMPO);
    assert.ok(duration < MEDIUM_TEMPO.defaultShotDuration, `Expected < 5, got ${duration}`);
  });

  test('neutral description uses base duration', () => {
    const shot = makeShot({ description: 'A person walks down the street' });
    const duration = estimateContentDuration(shot, MEDIUM_TEMPO);
    assert.strictEqual(duration, MEDIUM_TEMPO.defaultShotDuration);
  });

  test('respects tempo base duration', () => {
    const shot = makeShot({ description: 'A person walks' });
    const fast = estimateContentDuration(shot, FAST_TEMPO);
    const slow = estimateContentDuration(shot, SLOW_TEMPO);
    assert.ok(fast < slow, `Fast (${fast}) should be shorter than slow (${slow})`);
  });

  test('clamps to [1, 30]', () => {
    const shot = makeShot({ description: 'A test' });
    const duration = estimateContentDuration(shot, { defaultShotDuration: 100, cameraSpeedModifier: '', transitionTiming: '' });
    assert.ok(duration <= 30);
  });
});

describe('resolveSmartDuration', () => {
  test('uses explicit shot duration over content estimation', () => {
    const shot = makeShot({ duration: '7s', description: 'Close-up on face' });
    const duration = resolveSmartDuration(shot, MEDIUM_TEMPO);
    assert.strictEqual(duration, 7);
  });

  test('narration extends duration beyond base', () => {
    const shot = makeShot({ description: 'A simple scene' });
    const longNarration = 'This is a very long narration that should take more than five seconds to read aloud because it has many many words';
    const duration = resolveSmartDuration(shot, MEDIUM_TEMPO, longNarration);
    assert.ok(duration > MEDIUM_TEMPO.defaultShotDuration, `Expected > 5, got ${duration}`);
  });

  test('engine maxDuration clamps result', () => {
    const shot = makeShot({ duration: '15s' });
    const duration = resolveSmartDuration(shot, MEDIUM_TEMPO, undefined, 5);
    assert.strictEqual(duration, 5);
  });

  test('range clamping works with narration', () => {
    const shot = makeShot({ duration: '2-4s' });
    const longNarration = 'Many many words that would normally take ten seconds to read aloud at normal pace';
    const duration = resolveSmartDuration(shot, MEDIUM_TEMPO, longNarration);
    assert.strictEqual(duration, 4);
  });

  test('no narration returns content-estimated duration', () => {
    const shot = makeShot({ description: 'Establishing shot of the valley' });
    const duration = resolveSmartDuration(shot, MEDIUM_TEMPO);
    assert.ok(duration > MEDIUM_TEMPO.defaultShotDuration);
  });

  test('defaults to tempo duration for neutral shot', () => {
    const shot = makeShot();
    const duration = resolveSmartDuration(shot, MEDIUM_TEMPO);
    assert.strictEqual(duration, MEDIUM_TEMPO.defaultShotDuration);
  });
});
