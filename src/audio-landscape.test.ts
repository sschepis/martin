import { test, describe } from 'node:test';
import * as assert from 'node:assert';
import { resolveMusicUrl, extractSfxKeywords, resolveSfxUrl, resolveAudioMixLevels, DEFAULT_MIX_LEVELS, MOOD_MUSIC_LIBRARY, SFX_LIBRARY } from './audio-landscape.ts';
import type { ProductionManifest, Shot } from './types.ts';

function makeManifest(overrides: Partial<ProductionManifest> = {}): ProductionManifest {
  return {
    title: 'Test',
    mood: 'dark',
    colorPalette: ['black'],
    aspectRatio: '16:9',
    shots: [],
    ...overrides,
  };
}

function makeShot(overrides: Partial<Shot> = {}): Shot {
  return {
    id: '1',
    description: 'A test scene',
    camera: { movement: 'static', angle: 'eye-level' },
    lighting: { style: 'natural' },
    ...overrides,
  };
}

describe('resolveMusicUrl', () => {
  test('returns user-provided override URL', () => {
    const url = resolveMusicUrl(makeManifest(), 'https://example.com/music.mp3');
    assert.strictEqual(url, 'https://example.com/music.mp3');
  });

  test('returns manifest audioLandscape musicUrl', () => {
    const m = makeManifest({ audioLandscape: { musicUrl: 'https://manifest.com/track.mp3' } });
    const url = resolveMusicUrl(m);
    assert.strictEqual(url, 'https://manifest.com/track.mp3');
  });

  test('maps known mood to music URL', () => {
    const url = resolveMusicUrl(makeManifest({ mood: 'epic' }));
    assert.strictEqual(url, MOOD_MUSIC_LIBRARY['epic']);
  });

  test('partial mood match works', () => {
    const url = resolveMusicUrl(makeManifest({ mood: 'noir-cinematic' }));
    assert.ok(url);
    assert.ok(url!.includes('mixkit'));
  });

  test('falls back to default for unknown mood', () => {
    const url = resolveMusicUrl(makeManifest({ mood: 'xyzzy-unknown' }));
    assert.strictEqual(url, MOOD_MUSIC_LIBRARY['default']);
  });
});

describe('extractSfxKeywords', () => {
  test('finds keywords in environment', () => {
    const shot = makeShot({ environment: 'A rainy city alley' });
    const keywords = extractSfxKeywords(shot, makeManifest());
    assert.ok(keywords.includes('rain'));
    assert.ok(keywords.includes('city'));
    assert.ok(keywords.includes('alley'));
  });

  test('finds keywords in description', () => {
    const shot = makeShot({ description: 'Thunder crashes over the ocean' });
    const keywords = extractSfxKeywords(shot, makeManifest());
    assert.ok(keywords.includes('thunder'));
    assert.ok(keywords.includes('ocean'));
  });

  test('reads from environment definitions', () => {
    const m = makeManifest({
      environments: [{ id: 'forest-env', spatialDescription: 'Dense forest with rain', atmosphere: 'misty' }],
    });
    const shot = makeShot({ environmentId: 'forest-env' });
    const keywords = extractSfxKeywords(shot, m);
    assert.ok(keywords.includes('forest'));
    assert.ok(keywords.includes('rain'));
  });

  test('returns empty for no matches', () => {
    const shot = makeShot({ description: 'A blank white room' });
    const keywords = extractSfxKeywords(shot, makeManifest());
    assert.strictEqual(keywords.length, 0);
  });
});

describe('resolveSfxUrl', () => {
  test('returns URL for matched keyword', () => {
    const shot = makeShot({ environment: 'rainy street' });
    const url = resolveSfxUrl(shot, makeManifest());
    assert.strictEqual(url, SFX_LIBRARY['rain']);
  });

  test('returns override URL when provided', () => {
    const shot = makeShot({ environment: 'rainy street' });
    const url = resolveSfxUrl(shot, makeManifest(), 'https://custom.com/sfx.mp3');
    assert.strictEqual(url, 'https://custom.com/sfx.mp3');
  });

  test('returns undefined when no match', () => {
    const shot = makeShot({ description: 'A blank room' });
    const url = resolveSfxUrl(shot, makeManifest());
    assert.strictEqual(url, undefined);
  });
});

describe('resolveAudioMixLevels', () => {
  test('uses defaults when no overrides', () => {
    const levels = resolveAudioMixLevels();
    assert.deepStrictEqual(levels, DEFAULT_MIX_LEVELS);
  });

  test('applies partial overrides', () => {
    const levels = resolveAudioMixLevels({ musicVolume: 0.5 });
    assert.strictEqual(levels.musicVolume, 0.5);
    assert.strictEqual(levels.narrationVolume, DEFAULT_MIX_LEVELS.narrationVolume);
    assert.strictEqual(levels.sfxVolume, DEFAULT_MIX_LEVELS.sfxVolume);
  });
});
