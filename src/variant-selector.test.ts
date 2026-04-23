import { test, describe } from 'node:test';
import * as assert from 'node:assert';
import { toPromptRecord, PromptHistory } from './variant-selector.ts';
import type { PromptVariant } from './types.ts';

describe('toPromptRecord', () => {
  test('creates correct record', () => {
    const variant: PromptVariant = {
      id: 'shot-1-v0',
      prompt: 'Test prompt',
      strategy: 'original',
      validationScore: 0.95,
    };
    const record = toPromptRecord(variant, 'weryai', 'weryai');
    assert.strictEqual(record.engine, 'weryai');
    assert.strictEqual(record.adapter, 'weryai');
    assert.strictEqual(record.prompt, 'Test prompt');
    assert.strictEqual(record.strategy, 'original');
    assert.strictEqual(record.score, 0.95);
    assert.ok(record.timestamp > 0);
  });

  test('uses 0 for missing score', () => {
    const variant: PromptVariant = {
      id: 'shot-1-v0',
      prompt: 'Test prompt',
      strategy: 'rephrase',
    };
    const record = toPromptRecord(variant, 'luma', 'luma');
    assert.strictEqual(record.score, 0);
  });
});

describe('PromptHistory', () => {
  test('add and getRecords works', () => {
    const history = new PromptHistory();
    history.add({ engine: 'weryai', adapter: 'weryai', prompt: 'p1', strategy: 'original', score: 0.9, timestamp: 1 });
    history.add({ engine: 'luma', adapter: 'luma', prompt: 'p2', strategy: 'rephrase', score: 0.8, timestamp: 2 });
    assert.strictEqual(history.getRecords().length, 2);
  });

  test('getBestStrategyForEngine returns correct strategy', () => {
    const history = new PromptHistory();
    history.add({ engine: 'weryai', adapter: 'weryai', prompt: 'p1', strategy: 'original', score: 0.7, timestamp: 1 });
    history.add({ engine: 'weryai', adapter: 'weryai', prompt: 'p2', strategy: 'rephrase', score: 0.9, timestamp: 2 });
    history.add({ engine: 'weryai', adapter: 'weryai', prompt: 'p3', strategy: 'rephrase', score: 0.85, timestamp: 3 });
    const best = history.getBestStrategyForEngine('weryai');
    assert.strictEqual(best, 'rephrase');
  });

  test('getBestStrategyForEngine returns undefined for unknown engine', () => {
    const history = new PromptHistory();
    const best = history.getBestStrategyForEngine('nonexistent');
    assert.strictEqual(best, undefined);
  });

  test('toJSON/fromJSON round-trips correctly', () => {
    const history = new PromptHistory();
    history.add({ engine: 'weryai', adapter: 'weryai', prompt: 'p1', strategy: 'original', score: 0.9, timestamp: 100 });
    history.add({ engine: 'luma', adapter: 'luma', prompt: 'p2', strategy: 'vary-style', score: 0.7, timestamp: 200 });

    const json = history.toJSON();
    const restored = PromptHistory.fromJSON(json);
    assert.strictEqual(restored.getRecords().length, 2);
    assert.strictEqual(restored.getRecords()[0].engine, 'weryai');
    assert.strictEqual(restored.getRecords()[1].strategy, 'vary-style');
  });

  test('ignores zero-score records in getBestStrategyForEngine', () => {
    const history = new PromptHistory();
    history.add({ engine: 'weryai', adapter: 'weryai', prompt: 'p1', strategy: 'original', score: 0, timestamp: 1 });
    const best = history.getBestStrategyForEngine('weryai');
    assert.strictEqual(best, undefined);
  });
});
