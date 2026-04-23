import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { AssetCache, isMockResult } from './cache.ts';

const TEST_DIR = path.join(process.cwd(), '.martin-cache-test-' + process.pid);

function makeCache(overrides?: Record<string, unknown>) {
  return new AssetCache({ directory: TEST_DIR, ...overrides });
}

describe('AssetCache', () => {
  afterEach(() => {
    if (fs.existsSync(TEST_DIR)) fs.rmSync(TEST_DIR, { recursive: true, force: true });
  });

  describe('hashKey', () => {
    it('produces deterministic keys', () => {
      const a = AssetCache.hashKey('prompt', '16:9');
      const b = AssetCache.hashKey('prompt', '16:9');
      assert.equal(a, b);
    });

    it('produces different keys for different inputs', () => {
      const a = AssetCache.hashKey('prompt A', '16:9');
      const b = AssetCache.hashKey('prompt B', '16:9');
      assert.notEqual(a, b);
    });

    it('is insensitive to object property order', () => {
      const a = AssetCache.hashKey({ aspectRatio: '16:9', duration: 5 });
      const b = AssetCache.hashKey({ duration: 5, aspectRatio: '16:9' });
      assert.equal(a, b);
    });

    it('handles undefined and null parts', () => {
      const a = AssetCache.hashKey('prompt', undefined, null);
      const b = AssetCache.hashKey('prompt', undefined, null);
      assert.equal(a, b);
      assert.equal(a.length, 16);
    });
  });

  describe('set + get round-trip', () => {
    it('stores and retrieves a string', () => {
      const cache = makeCache();
      cache.set('image', 'key1', 'https://example.com/img.jpg');
      assert.equal(cache.get('image', 'key1'), 'https://example.com/img.jpg');
    });

    it('stores and retrieves an object', () => {
      const cache = makeCache();
      const result = { url: 'https://example.com/video.mp4', duration: 5 };
      cache.set('video', 'key2', result);
      assert.deepEqual(cache.get('video', 'key2'), result);
    });

    it('returns undefined for missing keys', () => {
      const cache = makeCache();
      assert.equal(cache.get('image', 'nonexistent'), undefined);
    });
  });

  describe('TTL expiration', () => {
    it('expires entries after TTL', async () => {
      const cache = makeCache();
      const entry = {
        key: 'ttl-test',
        type: 'image' as const,
        value: 'https://example.com/img.jpg',
        createdAt: Date.now() - 10000,
        ttl: 1,
      };
      const filePath = path.join(TEST_DIR, 'image', 'ttl-test.json');
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, JSON.stringify(entry));

      assert.equal(cache.get('image', 'ttl-test'), undefined);
    });
  });

  describe('mock detection', () => {
    it('detects shotstack fallback URLs', () => {
      assert.equal(isMockResult('https://shotstack-assets.s3-ap-southeast-2.amazonaws.com/footage/earth.mp4'), true);
    });

    it('detects mock voice IDs', () => {
      assert.equal(isMockResult('mock-voice-kira-tanaka'), true);
    });

    it('detects VideoEngineResult with mock URL', () => {
      assert.equal(isMockResult({ url: 'https://shotstack-assets.s3.amazonaws.com/img.jpg' }), true);
    });

    it('returns false for real URLs', () => {
      assert.equal(isMockResult('https://cdn.weryai.com/real-video.mp4'), false);
    });

    it('returns false for undefined/null', () => {
      assert.equal(isMockResult(undefined), false);
      assert.equal(isMockResult(null), false);
    });
  });

  describe('mock results are not cached', () => {
    it('refuses to store mock URLs', () => {
      const cache = makeCache();
      cache.set('image', 'mock1', 'https://shotstack-assets.s3-ap-southeast-2.amazonaws.com/images/earth.jpg');
      assert.equal(cache.has('image', 'mock1'), false);
    });

    it('refuses to store undefined', () => {
      const cache = makeCache();
      cache.set('audio', 'undef1', undefined as unknown as string);
      assert.equal(cache.has('audio', 'undef1'), false);
    });
  });

  describe('clear', () => {
    it('clears all entries', () => {
      const cache = makeCache();
      cache.set('image', 'c1', 'https://example.com/a.jpg');
      cache.set('video', 'c2', { url: 'https://example.com/b.mp4' });
      cache.clear();
      assert.equal(cache.has('image', 'c1'), false);
      assert.equal(cache.has('video', 'c2'), false);
    });

    it('clears only the specified type', () => {
      const cache = makeCache();
      cache.set('image', 'c3', 'https://example.com/a.jpg');
      cache.set('video', 'c4', { url: 'https://example.com/b.mp4' });
      cache.clear('image');
      assert.equal(cache.has('image', 'c3'), false);
      assert.equal(cache.has('video', 'c4'), true);
    });
  });

  describe('stats', () => {
    it('returns correct counts', () => {
      const cache = makeCache();
      cache.set('image', 's1', 'https://example.com/a.jpg');
      cache.set('image', 's2', 'https://example.com/b.jpg');
      cache.set('video', 's3', { url: 'https://example.com/v.mp4' });
      const s = cache.stats();
      assert.equal(s.entries, 3);
      assert.equal(s.types['image'], 2);
      assert.equal(s.types['video'], 1);
      assert.equal(s.types['audio'], 0);
    });
  });

  describe('corrupt file handling', () => {
    it('returns undefined for corrupt JSON without throwing', () => {
      const cache = makeCache();
      const filePath = path.join(TEST_DIR, 'image', 'corrupt.json');
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, 'NOT VALID JSON{{{');
      assert.equal(cache.get('image', 'corrupt'), undefined);
    });
  });

  describe('persistence across instances', () => {
    it('survives process restart (new instance with same dir)', () => {
      const cache1 = makeCache();
      cache1.set('voice', 'persist1', 'voice-id-abc123');

      const cache2 = makeCache();
      assert.equal(cache2.get('voice', 'persist1'), 'voice-id-abc123');
    });
  });

  describe('atomic writes', () => {
    it('leaves no .tmp files after set', () => {
      const cache = makeCache();
      cache.set('image', 'atomic1', 'https://example.com/img.jpg');
      const dir = path.join(TEST_DIR, 'image');
      const files = fs.readdirSync(dir);
      assert.equal(files.filter(f => f.endsWith('.tmp')).length, 0);
    });
  });

  describe('disabled cache', () => {
    it('does not read or write when disabled', () => {
      const cache = makeCache({ enabled: false });
      cache.set('image', 'dis1', 'https://example.com/img.jpg');
      assert.equal(cache.get('image', 'dis1'), undefined);
      assert.equal(fs.existsSync(TEST_DIR), false);
    });
  });
});
