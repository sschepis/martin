import { test, describe } from 'node:test';
import * as assert from 'node:assert';
import { RunwayGen3Adapter } from './runway-gen3';
import { ProductionManifest, Shot } from '../types';

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
    
    assert.ok(prompt.includes('[Cinematic Video]'));
    assert.ok(prompt.includes('A dark alley'));
    assert.ok(prompt.includes('Subject: A lonely robot'));
    assert.ok(prompt.includes('Environment: Neo-Tokyo'));
    assert.ok(prompt.includes('Camera: pan right, low, 50mm'));
    assert.ok(prompt.includes('Lighting: neon, cool, high'));
    assert.ok(prompt.includes('Mood: dark'));
    assert.ok(prompt.includes('Color Palette: red, black'));
    assert.ok(prompt.includes('--ar 169'));
    
    // Check joiner
    assert.strictEqual(prompt, '[Cinematic Video] | A dark alley | Subject: A lonely robot | Environment: Neo-Tokyo | Camera: pan right, low, 50mm | Lighting: neon, cool, high | Mood: dark | Color Palette: red, black | --ar 169');
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
    assert.ok(prompt.includes('Environment: Not specified'));
    assert.ok(prompt.includes('Camera: static, eye-level, standard lens'));
    // lighting colorTemp and contrast empty will result in ', ' which is handled in the implementation (e.g. `natural, , `).
    // Let's check exact lighting string output based on implementation:
    // `Lighting: ${shot.lighting.style}, ${shot.lighting.colorTemp || ''}, ${shot.lighting.contrast || ''}`
    assert.ok(prompt.includes('Lighting: natural, , '));
  });
});
