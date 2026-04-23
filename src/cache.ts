import * as crypto from 'node:crypto';
import * as fs from 'node:fs';
import * as path from 'node:path';

export type AssetType = 'image' | 'video' | 'audio' | 'voice';

export interface CacheConfig {
  directory: string;
  defaultTTL: number;
  enabled: boolean;
}

export interface CacheEntry<T = unknown> {
  key: string;
  type: AssetType;
  value: T;
  inputs?: Record<string, unknown>;
  createdAt: number;
  ttl: number;
}

const DEFAULT_TTLS: Record<AssetType, number> = {
  image: 7 * 24 * 60 * 60 * 1000,
  video: 7 * 24 * 60 * 60 * 1000,
  audio: 30 * 24 * 60 * 60 * 1000,
  voice: 90 * 24 * 60 * 60 * 1000,
};

const MOCK_PATTERNS = ['shotstack-assets', 'mock-voice-', 'placeholder', 'fallback'];

export function isMockResult(value: unknown): boolean {
  if (value === undefined || value === null) return false;
  if (typeof value === 'string') {
    return MOCK_PATTERNS.some(p => value.includes(p));
  }
  if (typeof value === 'object' && 'url' in value) {
    return isMockResult((value as { url: string }).url);
  }
  return false;
}

export class AssetCache {
  private directory: string;
  private defaultTTL: number;
  private enabled: boolean;

  constructor(config?: Partial<CacheConfig>) {
    this.directory = config?.directory || '.martin-cache';
    this.defaultTTL = config?.defaultTTL || DEFAULT_TTLS.video;
    this.enabled = config?.enabled ?? true;
  }

  static hashKey(...parts: (string | number | undefined | null | object)[]): string {
    const h = crypto.createHash('sha256');
    for (const part of parts) {
      if (part === undefined || part === null) {
        h.update('\x00');
      } else if (typeof part === 'object') {
        h.update(stableStringify(part));
      } else {
        h.update(String(part));
      }
      h.update('\x1e');
    }
    return h.digest('hex').slice(0, 16);
  }

  get<T>(type: AssetType, key: string): T | undefined {
    if (!this.enabled) return undefined;

    const filePath = this.entryPath(type, key);
    try {
      const raw = fs.readFileSync(filePath, 'utf-8');
      const entry: CacheEntry<T> = JSON.parse(raw);

      if (Date.now() > entry.createdAt + entry.ttl) {
        fs.unlinkSync(filePath);
        return undefined;
      }

      if (type === 'audio' && typeof entry.value === 'string' && !entry.value.startsWith('http')) {
        if (!fs.existsSync(entry.value)) return undefined;
      }

      return entry.value;
    } catch {
      try { fs.unlinkSync(filePath); } catch { /* already gone */ }
      return undefined;
    }
  }

  set<T>(type: AssetType, key: string, value: T, inputs?: Record<string, unknown>): void {
    if (!this.enabled) return;
    if (value === undefined || value === null) return;
    if (isMockResult(value)) return;

    const entry: CacheEntry<T> = {
      key,
      type,
      value,
      inputs,
      createdAt: Date.now(),
      ttl: DEFAULT_TTLS[type] ?? this.defaultTTL,
    };

    const filePath = this.entryPath(type, key);
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const tmpPath = filePath + '.tmp';
    fs.writeFileSync(tmpPath, JSON.stringify(entry, null, 2));
    fs.renameSync(tmpPath, filePath);
  }

  has(type: AssetType, key: string): boolean {
    return this.get(type, key) !== undefined;
  }

  clear(type?: AssetType): void {
    if (type) {
      const dir = path.join(this.directory, type);
      if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
    } else {
      if (fs.existsSync(this.directory)) fs.rmSync(this.directory, { recursive: true, force: true });
    }
  }

  stats(): { entries: number; types: Record<string, number> } {
    const types: Record<string, number> = {};
    let entries = 0;

    for (const t of ['image', 'video', 'audio', 'voice'] as AssetType[]) {
      const dir = path.join(this.directory, t);
      if (!fs.existsSync(dir)) {
        types[t] = 0;
        continue;
      }
      const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
      types[t] = files.length;
      entries += files.length;
    }

    return { entries, types };
  }

  private entryPath(type: AssetType, key: string): string {
    return path.join(this.directory, type, `${key}.json`);
  }
}

function stableStringify(obj: object): string {
  return JSON.stringify(obj, (_, value) => {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return Object.keys(value).sort().reduce<Record<string, unknown>>((sorted, k) => {
        if (value[k] !== undefined) sorted[k] = value[k];
        return sorted;
      }, {});
    }
    return value;
  });
}
