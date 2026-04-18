import { test, describe } from 'node:test';
import * as assert from 'node:assert';
import { ShotstackAdapter } from './shotstack';
import { ProductionManifest, Shot } from '../types';

describe('ShotstackAdapter', () => {
  const adapter = new ShotstackAdapter();

  test('has correct name', () => {
    assert.strictEqual(adapter.name, 'shotstack');
  });

  test('generates expected prompt', () => {
    const manifest: ProductionManifest = {
      title: 'Test',
      mood: 'dark',
      colorPalette: ['black'],
      aspectRatio: '16:9',
      shots: []
    };

    const shot: Shot = {
      id: '1',
      description: 'A test shot',
      subject: 'A person',
      environment: 'A room',
      camera: { movement: 'static', angle: 'eye-level' },
      lighting: { style: 'natural' },
      duration: '3.5s'
    };

    const prompt = adapter.generatePrompt(manifest, shot);
    const parsed = JSON.parse(prompt);
    
    assert.strictEqual(parsed.asset.type, 'video');
    assert.strictEqual(parsed.asset.description, 'A test shot');
    assert.strictEqual(parsed.asset.subject, 'A person');
    assert.strictEqual(parsed.asset.environment, 'A room');
    assert.strictEqual(parsed.length, 3.5);
    assert.strictEqual(parsed.transition.in, 'fade');
  });
});
