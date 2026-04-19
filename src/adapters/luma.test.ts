import { test, describe } from 'node:test';
import * as assert from 'node:assert';
import { LumaDreamMachineAdapter } from './luma.ts';
import { ProductionManifest, Shot } from '../types.ts';

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

    assert.ok(prompt.includes('The clouds are moving fast.'));
    assert.ok(prompt.includes('A flying bird'));
    assert.ok(prompt.includes('The sky'));
    assert.ok(prompt.includes('tracking'));
    assert.ok(prompt.includes('high'));
    assert.ok(prompt.includes('soft'));
    assert.ok(prompt.includes('dreamy'));
    assert.ok(prompt.includes('blue, purple'));
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

    assert.ok(prompt.includes('A simple scene.'));
    assert.ok(prompt.includes('the main subject'));
    assert.ok(prompt.includes('the scene'));
    assert.ok(prompt.includes('eye-level'));
    assert.ok(prompt.includes('flat'));
    assert.ok(prompt.includes('dreamy'));
    assert.ok(prompt.includes('blue'));
  });
});
