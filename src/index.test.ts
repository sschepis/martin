import { test, describe, mock } from 'node:test';
import * as assert from 'node:assert';
import { Martin, createDirector } from './index.ts';
import { Adapter, ProductionManifest, Shot } from './types.ts';

describe('Martin', () => {
  test('initializes with built-in adapters', () => {
    const director = new Martin();
    
    // Test if exportManifest throws or works for built-in adapters (using an empty manifest)
    const manifest: ProductionManifest = {
      title: 'Test', mood: 'dark', colorPalette: [], aspectRatio: '16:9', shots: []
    };

    const runwayPrompts = director.exportManifest(manifest, 'runway-gen3');
    assert.deepStrictEqual(runwayPrompts, []);

    const lumaPrompts = director.exportManifest(manifest, 'luma');
    assert.deepStrictEqual(lumaPrompts, []);

    const soraPrompts = director.exportManifest(manifest, 'sora');
    assert.deepStrictEqual(soraPrompts, []);
  });

  test('registerAdapter allows adding custom adapters', () => {
    const director = new Martin();
    
    class CustomAdapter implements Adapter {
      name = 'custom';
      generatePrompt(manifest: ProductionManifest, shot: Shot): string {
        return `Custom: ${shot.description}`;
      }
    }

    director.registerAdapter(new CustomAdapter());

    const manifest: ProductionManifest = {
      title: 'Test', mood: 'dark', colorPalette: [], aspectRatio: '16:9',
      shots: [{
        id: '1', description: 'A test shot',
        camera: { movement: 'static', angle: 'eye' },
        lighting: { style: 'flat' }
      }]
    };

    const prompts = director.exportManifest(manifest, 'custom');
    assert.deepStrictEqual(prompts, ['Custom: A test shot']);
  });

  test('exportManifest throws for unknown adapter', () => {
    const director = new Martin();
    const manifest: ProductionManifest = {
      title: 'Test', mood: 'dark', colorPalette: [], aspectRatio: '16:9', shots: []
    };

    assert.throws(() => {
      director.exportManifest(manifest, 'unknown');
    }, /Adapter 'unknown' not found/);
  });


  test('createDirector creates a new instance', () => {
    const director = createDirector();
    assert.ok(director instanceof Martin);
  });
  test('plan returns a manifest with an export function', async () => {
    const director = new Martin();
    
    const production = await director.plan('Test script');
    assert.strictEqual(production.title, 'Generated Production');
    assert.strictEqual(typeof production.export, 'function');

    const prompts = production.export('sora');
    assert.strictEqual(prompts.length, 2);
    assert.ok(prompts[0].includes('Establishing shot'));
  });
});
