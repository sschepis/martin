import { test, describe } from 'node:test';
import * as assert from 'node:assert';
import { generatePromptVariants } from './prompt-variants.ts';
import type { ProductionManifest, Shot, Adapter, ShotContext } from './types.ts';

const mockAdapter: Adapter = {
  name: 'test-adapter',
  generatePrompt(_manifest, shot, _context?) {
    return `Base prompt for ${shot.description}. Masterpiece, 8k resolution.`;
  }
};

function makeManifest(): ProductionManifest {
  return {
    title: 'Test',
    mood: 'dark',
    colorPalette: ['black'],
    aspectRatio: '16:9',
    shots: [],
  };
}

function makeShot(overrides: Partial<Shot> = {}): Shot {
  return {
    id: 'shot-1',
    description: 'A dark alley',
    subject: 'A detective',
    environment: 'Neo-Tokyo',
    camera: { movement: 'static', angle: 'eye-level' },
    lighting: { style: 'natural' },
    ...overrides,
  };
}

const defaultContext: ShotContext = { shotIndex: 0, totalShots: 1 };

describe('generatePromptVariants', () => {
  test('count=1 returns only original', () => {
    const variants = generatePromptVariants(makeManifest(), makeShot(), mockAdapter, defaultContext, 1);
    assert.strictEqual(variants.length, 1);
    assert.strictEqual(variants[0].strategy, 'original');
  });

  test('count=3 returns 3 variants with different strategies', () => {
    const variants = generatePromptVariants(makeManifest(), makeShot(), mockAdapter, defaultContext, 3);
    assert.strictEqual(variants.length, 3);
    assert.strictEqual(variants[0].strategy, 'original');
    assert.strictEqual(variants[1].strategy, 'rephrase');
    assert.strictEqual(variants[2].strategy, 'emphasize-subject');
  });

  test('each variant prompt differs from original', () => {
    const variants = generatePromptVariants(makeManifest(), makeShot(), mockAdapter, defaultContext, 4);
    const originalPrompt = variants[0].prompt;
    for (let i = 1; i < variants.length; i++) {
      assert.notStrictEqual(variants[i].prompt, originalPrompt, `Variant ${i} should differ from original`);
    }
  });

  test('variant IDs are unique', () => {
    const variants = generatePromptVariants(makeManifest(), makeShot(), mockAdapter, defaultContext, 3);
    const ids = variants.map(v => v.id);
    assert.strictEqual(new Set(ids).size, ids.length);
  });

  test('rephrase variant adds composition emphasis', () => {
    const variants = generatePromptVariants(makeManifest(), makeShot(), mockAdapter, defaultContext, 2);
    const rephrase = variants.find(v => v.strategy === 'rephrase');
    assert.ok(rephrase);
    assert.ok(rephrase!.prompt.includes('VARIANT'));
  });

  test('emphasize-subject includes subject name', () => {
    const variants = generatePromptVariants(makeManifest(), makeShot(), mockAdapter, defaultContext, 3);
    const subjectVariant = variants.find(v => v.strategy === 'emphasize-subject');
    assert.ok(subjectVariant);
    assert.ok(subjectVariant!.prompt.includes('A detective'));
  });

  test('vary-style swaps style tokens', () => {
    const variants = generatePromptVariants(makeManifest(), makeShot(), mockAdapter, defaultContext, 5);
    const styleVariant = variants.find(v => v.strategy === 'vary-style');
    assert.ok(styleVariant);
    assert.ok(!styleVariant!.prompt.includes('Masterpiece') || !styleVariant!.prompt.includes('8k resolution'));
  });

  test('strategy cycles for count > 5', () => {
    const variants = generatePromptVariants(makeManifest(), makeShot(), mockAdapter, defaultContext, 6);
    assert.strictEqual(variants.length, 6);
    assert.strictEqual(variants[5].strategy, 'rephrase');
  });
});
