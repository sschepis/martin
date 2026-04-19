import { test, describe } from 'node:test';
import * as assert from 'node:assert';
import { SoraAdapter } from './sora.ts';
import { ProductionManifest, Shot } from '../types.ts';

describe('SoraAdapter', () => {
  const adapter = new SoraAdapter();

  test('has correct name', () => {
    assert.strictEqual(adapter.name, 'sora');
  });

  test('generates expected prompt', () => {
    const manifest: ProductionManifest = {
      title: 'Test',
      mood: 'Epic',
      colorPalette: ['Gold', 'Silver'],
      aspectRatio: '16:9',
      shots: []
    };

    const shot: Shot = {
      id: '1',
      description: 'A knight riding a horse',
      subject: 'A brave knight',
      environment: 'A medieval battlefield',
      camera: { movement: 'PAN', angle: 'HIGH', lens: '50mm prime' },
      lighting: { style: 'Dramatic', colorTemp: 'warm', contrast: 'High Contrast' }
    };

    const prompt = adapter.generatePrompt(manifest, shot);
    
    const expected = 'A highly detailed, photorealistic video of A knight riding a horse. The subject is A brave knight, situated in A medieval battlefield. The camera executes a pan from a high angle, simulating a 50mm prime. The lighting is dramatic with high contrast, creating a epic atmosphere. The dominant colors are Gold, Silver.';
    assert.strictEqual(prompt, expected);
  });

  test('handles missing optional fields gracefully', () => {
    const manifest: ProductionManifest = {
      title: 'Test',
      mood: 'Calm',
      colorPalette: ['Green'],
      aspectRatio: '16:9',
      shots: []
    };

    const shot: Shot = {
      id: '1',
      description: 'A quiet forest',
      camera: { movement: 'Static', angle: 'Eye-level' },
      lighting: { style: 'Soft' }
    };

    const prompt = adapter.generatePrompt(manifest, shot);
    
    const expected = 'A highly detailed, photorealistic video of A quiet forest. The subject is not explicitly defined, situated in an undefined environment. The camera executes a static from a eye-level angle, simulating a standard cinematic lens. The lighting is soft, creating a calm atmosphere. The dominant colors are Green.';
    assert.strictEqual(prompt, expected);
  });
});
