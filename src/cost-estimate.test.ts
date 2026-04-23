import { test, describe } from 'node:test';
import * as assert from 'node:assert';
import { estimateCost, DEFAULT_ENGINE_RATES } from './cost-estimate.ts';
import type { ProductionManifest } from './types.ts';

function makeManifest(overrides: Partial<ProductionManifest> = {}): ProductionManifest {
  return {
    title: 'Test',
    mood: 'dark',
    colorPalette: ['black'],
    aspectRatio: '16:9',
    shots: [
      { id: 'shot-1', description: 'Scene 1', camera: { movement: 'static', angle: 'eye-level' }, lighting: { style: 'natural' } },
      { id: 'shot-2', description: 'Scene 2', camera: { movement: 'pan', angle: 'low' }, lighting: { style: 'neon' }, narration: 'Some text here' },
    ],
    ...overrides,
  };
}

describe('estimateCost', () => {
  test('calculates correct total for basic manifest', () => {
    const cost = estimateCost(makeManifest());
    assert.strictEqual(cost.currency, 'USD');
    assert.strictEqual(cost.totalCost, DEFAULT_ENGINE_RATES.video['weryai'] * 2);
    assert.ok(cost.breakdown.length >= 2);
  });

  test('includes audio costs when audioEngine is elevenlabs', () => {
    const cost = estimateCost(makeManifest(), { audioEngine: 'elevenlabs' });
    assert.ok(cost.summary['audio'] > 0);
    assert.ok(cost.breakdown.some(b => b.category === 'audio'));
  });

  test('uses per-shot engine overrides', () => {
    const m = makeManifest({
      shots: [
        { id: 'shot-1', description: 'Scene 1', camera: { movement: 'static', angle: 'eye-level' }, lighting: { style: 'natural' }, videoEngine: 'luma' },
        { id: 'shot-2', description: 'Scene 2', camera: { movement: 'pan', angle: 'low' }, lighting: { style: 'neon' } },
      ],
    });
    const cost = estimateCost(m);
    const lumaCost = cost.breakdown.find(b => b.engine === 'luma');
    const weryaiCost = cost.breakdown.find(b => b.engine === 'weryai');
    assert.ok(lumaCost);
    assert.ok(weryaiCost);
    assert.strictEqual(lumaCost!.unitCost, DEFAULT_ENGINE_RATES.video['luma']);
  });

  test('includes reference image costs when enabled', () => {
    const m = makeManifest({
      characters: [{ id: 'hero', faceDescription: 'rugged', wardrobe: 'coat' }],
      environments: [{ id: 'env1', spatialDescription: 'alley' }],
    });
    const cost = estimateCost(m, { useReferenceImages: true });
    assert.ok(cost.summary['reference-image'] > 0);
    const refItem = cost.breakdown.find(b => b.category === 'reference-image');
    assert.ok(refItem);
    assert.strictEqual(refItem!.quantity, 2);
  });

  test('includes image costs when useImageToVideo enabled', () => {
    const cost = estimateCost(makeManifest(), { useImageToVideo: true });
    assert.ok(cost.summary['image'] > 0);
  });

  test('returns zero for all-mock configuration', () => {
    const cost = estimateCost(makeManifest(), { videoEngine: 'mock', audioEngine: 'mock', imageEngine: 'mock' }, {
      video: { mock: 0 },
      image: { mock: 0 },
      audio: { mock: 0 },
    });
    assert.strictEqual(cost.totalCost, 0);
  });
});
