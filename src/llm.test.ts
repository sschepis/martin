import { test, describe } from 'node:test';
import * as assert from 'node:assert';
import { LLMEngine } from './llm.ts';

describe('LLMEngine', () => {
  test('generateSystemPrompt with full compactness', () => {
    const engine = new LLMEngine({ promptCompactness: 'full' });
    const prompt = engine.generateSystemPrompt();
    
    assert.ok(prompt.includes('Here is the Scene Design System (SDS) you must follow:'));
    assert.ok(prompt.includes('Here is the Film Shot & Technique (FST) Cheat Sheet you must use'));
    assert.ok(prompt.includes('You must output valid JSON strictly adhering to the following JSON Schema:'));
  });

  test('generateSystemPrompt with compact compactness', () => {
    const engine = new LLMEngine({ promptCompactness: 'compact' });
    const prompt = engine.generateSystemPrompt();
    
    assert.ok(prompt.includes('Here is the condensed Scene Design System (SDS) you must follow:'));
    assert.ok(prompt.includes('Here is the condensed Film Shot & Technique (FST) vocabulary you must use:'));
  });

  test('generateSystemPrompt with minimal compactness', () => {
    const engine = new LLMEngine({ promptCompactness: 'minimal' });
    const prompt = engine.generateSystemPrompt();
    
    assert.ok(prompt.includes('Apply expert cinematic scene design principles'));
    assert.ok(prompt.includes('Use standard professional filmmaking terminology'));
    assert.ok(!prompt.includes('Here is the Scene Design System'));
  });

  test('analyzeScript returns mock manifest', async () => {
    const engine = new LLMEngine({});
    const manifest = await engine.analyzeScript('A script about something', { aspectRatio: '16:9' });
    
    assert.strictEqual(manifest.title, 'Generated Production');
    assert.strictEqual(manifest.aspectRatio, '16:9');
    assert.strictEqual(manifest.shots.length, 2);
    assert.strictEqual(manifest.shots[0].id, 'shot-1');
  });
});
