import { test, describe } from 'node:test';
import * as assert from 'node:assert';
import { RunwayGen3Adapter } from './runway-gen3.ts';
import { ProductionManifest, Shot } from '../types.ts';

describe('RunwayGen3Adapter', () => {
  const adapter = new RunwayGen3Adapter();

  test('has correct name', () => {
    assert.strictEqual(adapter.name, 'runway-gen3');
  });

  test('generates expected prompt', () => {
    const manifest: ProductionManifest = {
      title: 'Test',
      mood: 'dark',
      colorPalette: ['red', 'black'],
      aspectRatio: '16:9',
      shots: []
    };

    const shot: Shot = {
      id: '1',
      description: 'A dark alley',
      subject: 'A lonely robot',
      environment: 'Neo-Tokyo',
      camera: { movement: 'pan right', angle: 'low', lens: '50mm' },
      lighting: { style: 'neon', colorTemp: 'cool', contrast: 'high' }
    };

    const prompt = adapter.generatePrompt(manifest, shot);

    assert.ok(prompt.includes('A dark alley'));
    assert.ok(prompt.includes('Subject: A lonely robot'));
    assert.ok(prompt.includes('Setting: Neo-Tokyo'));
    assert.ok(prompt.includes('low'));
    assert.ok(prompt.includes('50mm'));
    assert.ok(prompt.includes('neon'));
    assert.ok(prompt.includes('dark'));
    assert.ok(prompt.includes('red and black'));
    assert.ok(prompt.includes('--ar 169'));
    assert.ok(prompt.includes(' | '));
  });

  test('handles missing optional fields gracefully', () => {
    const manifest: ProductionManifest = {
      title: 'Test',
      mood: 'bright',
      colorPalette: ['yellow'],
      aspectRatio: '1:1',
      shots: []
    };

    const shot: Shot = {
      id: '1',
      description: 'A bright room',
      camera: { movement: 'static', angle: 'eye-level' },
      lighting: { style: 'natural' }
    };

    const prompt = adapter.generatePrompt(manifest, shot);

    assert.ok(prompt.includes('Subject: Not specified'));
    assert.ok(prompt.includes('Setting: Not specified'));
    assert.ok(prompt.includes('A bright room'));
    assert.ok(prompt.includes('natural'));
    assert.ok(prompt.includes('bright'));
  });
});
