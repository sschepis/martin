import { test, describe } from 'node:test';
import * as assert from 'node:assert';
import { resolveMotionControl, buildMotionDescription, applyTempoToMotion, MOTION_PRESETS } from './motion.ts';
import type { Shot, TempoDefaults } from './types.ts';

function makeShot(movement: string): Shot {
  return {
    id: '1',
    description: 'Test shot',
    camera: { movement, angle: 'eye-level' },
    lighting: { style: 'natural' },
  };
}

describe('resolveMotionControl', () => {
  test('resolves exact preset match', () => {
    const result = resolveMotionControl(makeShot('pan-left'));
    assert.strictEqual(result.trajectory?.type, 'pan');
    assert.strictEqual(result.trajectory?.direction, 'left');
    assert.strictEqual(result.trajectory?.speed, 'medium');
  });

  test('resolves with speed prefix stripped', () => {
    const result = resolveMotionControl(makeShot('Slow Push-in'));
    assert.strictEqual(result.trajectory?.type, 'dolly');
    assert.strictEqual(result.trajectory?.direction, 'forward');
    assert.strictEqual(result.trajectory?.speed, 'slow');
  });

  test('resolves fast prefix', () => {
    const result = resolveMotionControl(makeShot('Rapid Pan-Right'));
    assert.strictEqual(result.trajectory?.type, 'pan');
    assert.strictEqual(result.trajectory?.direction, 'right');
    assert.strictEqual(result.trajectory?.speed, 'fast');
  });

  test('resolves case-insensitive', () => {
    const result = resolveMotionControl(makeShot('TRACKING'));
    assert.strictEqual(result.trajectory?.type, 'tracking');
  });

  test('resolves static', () => {
    const result = resolveMotionControl(makeShot('Static'));
    assert.strictEqual(result.trajectory?.type, 'static');
  });

  test('falls back gracefully for unknown movements', () => {
    const result = resolveMotionControl(makeShot('corkscrew'));
    assert.ok(result.trajectory);
    assert.strictEqual(result.trajectory?.speed, 'medium');
  });

  test('handles compound movements via substring match', () => {
    const result = resolveMotionControl(makeShot('zoom-in'));
    assert.strictEqual(result.trajectory?.type, 'zoom');
    assert.strictEqual(result.trajectory?.direction, 'in');
  });
});

describe('buildMotionDescription', () => {
  test('produces readable description for dolly', () => {
    const desc = buildMotionDescription({ trajectory: { type: 'dolly', direction: 'forward', speed: 'slow' } });
    assert.ok(desc.includes('Slow'));
    assert.ok(desc.includes('dolly'));
    assert.ok(desc.includes('forward'));
  });

  test('omits speed for medium', () => {
    const desc = buildMotionDescription({ trajectory: { type: 'pan', direction: 'left', speed: 'medium' } });
    assert.ok(!desc.includes('Medium'));
    assert.ok(desc.includes('pan'));
    assert.ok(desc.includes('left'));
  });

  test('includes motion strength', () => {
    const desc = buildMotionDescription({
      trajectory: { type: 'pan', direction: 'right', speed: 'medium' },
      motionStrength: 0.9,
    });
    assert.ok(desc.includes('strong motion intensity'));
  });

  test('returns empty string when no trajectory', () => {
    const desc = buildMotionDescription({});
    assert.strictEqual(desc, '');
  });
});

describe('applyTempoToMotion', () => {
  test('applies fast tempo override', () => {
    const motion = { trajectory: { type: 'pan', direction: 'left', speed: 'medium' as const } };
    const tempo: TempoDefaults = { defaultShotDuration: 3, cameraSpeedModifier: 'rapid', transitionTiming: 'Fast' };
    const result = applyTempoToMotion(motion, tempo);
    assert.strictEqual(result.trajectory?.speed, 'fast');
  });

  test('applies slow tempo override', () => {
    const motion = { trajectory: { type: 'dolly', direction: 'forward', speed: 'medium' as const } };
    const tempo: TempoDefaults = { defaultShotDuration: 8, cameraSpeedModifier: 'slow, deliberate', transitionTiming: 'Slow' };
    const result = applyTempoToMotion(motion, tempo);
    assert.strictEqual(result.trajectory?.speed, 'slow');
  });

  test('no-ops for medium tempo', () => {
    const motion = { trajectory: { type: 'pan', direction: 'left', speed: 'fast' as const } };
    const tempo: TempoDefaults = { defaultShotDuration: 5, cameraSpeedModifier: '', transitionTiming: '' };
    const result = applyTempoToMotion(motion, tempo);
    assert.strictEqual(result.trajectory?.speed, 'fast');
  });

  test('no-ops when no tempo', () => {
    const motion = { trajectory: { type: 'pan', direction: 'left', speed: 'medium' as const } };
    const result = applyTempoToMotion(motion);
    assert.strictEqual(result.trajectory?.speed, 'medium');
  });
});

describe('MOTION_PRESETS', () => {
  test('has at least 20 presets', () => {
    assert.ok(MOTION_PRESETS.size >= 20);
  });

  test('all presets have type', () => {
    for (const [, preset] of MOTION_PRESETS) {
      assert.ok(preset.type, 'every preset must have a type');
    }
  });
});
