import { test, describe } from 'node:test';
import * as assert from 'node:assert';
import { buildStoryboardImagePrompt, buildAnnotation } from './storyboard.ts';
import type { ProductionManifest, Shot } from './types.ts';

function makeManifest(overrides: Partial<ProductionManifest> = {}): ProductionManifest {
  return {
    title: 'Test',
    mood: 'dark',
    colorPalette: ['black', 'red'],
    aspectRatio: '16:9',
    shots: [],
    ...overrides,
  };
}

function makeShot(overrides: Partial<Shot> = {}): Shot {
  return {
    id: 'shot-1',
    description: 'A dark alley scene',
    camera: { movement: 'pan-left', angle: 'low', lens: '35mm' },
    lighting: { style: 'neon' },
    ...overrides,
  };
}

describe('buildStoryboardImagePrompt', () => {
  test('includes camera, lighting, and mood', () => {
    const prompt = buildStoryboardImagePrompt(makeManifest(), makeShot());
    assert.ok(prompt.includes('low'));
    assert.ok(prompt.includes('pan-left'));
    assert.ok(prompt.includes('neon'));
    assert.ok(prompt.includes('dark'));
  });

  test('includes shot description', () => {
    const prompt = buildStoryboardImagePrompt(makeManifest(), makeShot());
    assert.ok(prompt.includes('A dark alley scene'));
  });

  test('includes subject when present', () => {
    const shot = makeShot({ subject: 'A lone detective' });
    const prompt = buildStoryboardImagePrompt(makeManifest(), shot);
    assert.ok(prompt.includes('A lone detective'));
  });

  test('includes negative prompt when present', () => {
    const m = makeManifest({ negativePrompt: 'no watermarks' });
    const prompt = buildStoryboardImagePrompt(m, makeShot());
    assert.ok(prompt.includes('no watermarks'));
  });

  test('includes lens when present', () => {
    const prompt = buildStoryboardImagePrompt(makeManifest(), makeShot());
    assert.ok(prompt.includes('35mm'));
  });

  test('includes color palette', () => {
    const prompt = buildStoryboardImagePrompt(makeManifest(), makeShot());
    assert.ok(prompt.includes('black, red'));
  });
});

describe('buildAnnotation', () => {
  test('extracts camera details', () => {
    const a = buildAnnotation(makeManifest(), makeShot());
    assert.strictEqual(a.cameraMovement, 'pan-left');
    assert.strictEqual(a.cameraAngle, 'low');
    assert.strictEqual(a.lens, '35mm');
  });

  test('extracts lighting style', () => {
    const a = buildAnnotation(makeManifest(), makeShot());
    assert.strictEqual(a.lightingStyle, 'neon');
  });

  test('includes narration when present', () => {
    const shot = makeShot({ narration: 'The night was cold.' });
    const a = buildAnnotation(makeManifest(), shot);
    assert.strictEqual(a.narration, 'The night was cold.');
  });

  test('resolves character names from manifest', () => {
    const m = makeManifest({
      characters: [{ id: 'hero', name: 'John', faceDescription: 'rugged', wardrobe: 'trenchcoat' }],
    });
    const shot = makeShot({ characterIds: ['hero'] });
    const a = buildAnnotation(m, shot);
    assert.deepStrictEqual(a.characters, ['John']);
  });

  test('includes transition when present', () => {
    const shot = makeShot({ transition: { type: 'fade', duration: 1.5 } });
    const a = buildAnnotation(makeManifest(), shot);
    assert.strictEqual(a.transition, 'fade (1.5s)');
  });

  test('uses default duration when none specified', () => {
    const a = buildAnnotation(makeManifest(), makeShot());
    assert.strictEqual(a.duration, '5s');
  });
});
