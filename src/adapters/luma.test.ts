import { test, describe } from 'node:test';
import * as assert from 'node:assert';
import { LumaDreamMachineAdapter } from './luma';
import { ProductionManifest, Shot } from '../types';

describe('LumaDreamMachineAdapter', () => {
  const adapter = new LumaDreamMachineAdapter();

  test('has correct name', () => {
    assert.strictEqual(adapter.name, 'luma');
  });

  test('generates expected prompt', () => {
    const manifest: ProductionManifest = {
      title: 'Test',
      mood: 'dreamy',
      colorPalette: ['blue', 'purple'],
      aspectRatio: '16:9',
      shots: []
    };

    const shot: Shot = {
      id: '1',
      description: 'The clouds are moving fast.',
      subject: 'A flying bird',
      environment: 'The sky',
      camera: { movement: 'tracking', angle: 'high', lens: 'wide' },
      lighting: { style: 'soft', colorTemp: 'warm', contrast: 'low' }
    };

    const prompt = adapter.generatePrompt(manifest, shot);
    
    const expected = 'A cinematic shot featuring A flying bird in The sky. The clouds are moving fast. The camera features a tracking from a high angle, shot on a wide. The lighting is soft with low contrast. Overall mood is dreamy with a color palette of blue, purple.';
    assert.strictEqual(prompt, expected);
  });

  test('handles missing optional fields gracefully', () => {
    const manifest: ProductionManifest = {
      title: 'Test',
      mood: 'dreamy',
      colorPalette: ['blue'],
      aspectRatio: '16:9',
      shots: []
    };

    const shot: Shot = {
      id: '1',
      description: 'A simple scene.',
      camera: { movement: 'static', angle: 'eye-level' },
      lighting: { style: 'flat' }
    };

    const prompt = adapter.generatePrompt(manifest, shot);
    
    const expected = 'A cinematic shot featuring the main subject in the scene. A simple scene. The camera features a static from a eye-level angle, shot on a standard lens. The lighting is flat with natural contrast. Overall mood is dreamy with a color palette of blue.';
    assert.strictEqual(prompt, expected);
  });
});
