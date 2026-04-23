import { test, describe } from 'node:test';
import * as assert from 'node:assert';
import { renderStoryboardHtml } from './storyboard-html.ts';
import type { StoryboardResult } from './types.ts';

function makeStoryboard(overrides: Partial<StoryboardResult> = {}): StoryboardResult {
  return {
    title: 'Test Production',
    mood: 'dark',
    totalDuration: 10,
    frames: [
      {
        shotId: 'shot-1',
        imageUrl: 'https://example.com/img1.jpg',
        shot: {
          id: 'shot-1',
          description: 'A dark <alley> scene',
          camera: { movement: 'pan-left', angle: 'low' },
          lighting: { style: 'neon' },
        },
        annotations: {
          cameraMovement: 'pan-left',
          cameraAngle: 'low',
          lightingStyle: 'neon',
          duration: '5s',
          environment: 'Neo-Tokyo',
        },
      },
    ],
    ...overrides,
  };
}

describe('renderStoryboardHtml', () => {
  test('produces valid HTML structure', () => {
    const html = renderStoryboardHtml(makeStoryboard());
    assert.ok(html.includes('<!DOCTYPE html>'));
    assert.ok(html.includes('<html'));
    assert.ok(html.includes('</html>'));
    assert.ok(html.includes('<head>'));
    assert.ok(html.includes('<body>'));
  });

  test('includes title and mood', () => {
    const html = renderStoryboardHtml(makeStoryboard());
    assert.ok(html.includes('Test Production'));
    assert.ok(html.includes('dark'));
  });

  test('includes shot data', () => {
    const html = renderStoryboardHtml(makeStoryboard());
    assert.ok(html.includes('shot-1'));
    assert.ok(html.includes('pan-left'));
    assert.ok(html.includes('neon'));
    assert.ok(html.includes('Neo-Tokyo'));
  });

  test('escapes HTML entities', () => {
    const html = renderStoryboardHtml(makeStoryboard());
    assert.ok(html.includes('&lt;alley&gt;'));
    assert.ok(!html.includes('<alley>'));
  });

  test('includes image URL', () => {
    const html = renderStoryboardHtml(makeStoryboard());
    assert.ok(html.includes('https://example.com/img1.jpg'));
  });

  test('includes cost section when estimate provided', () => {
    const storyboard = makeStoryboard({
      costEstimate: {
        totalCost: 0.15,
        currency: 'USD',
        breakdown: [
          { shotId: 'shot-1', category: 'video', engine: 'weryai', unitCost: 0.05, quantity: 1, subtotal: 0.05 },
        ],
        summary: { video: 0.05 },
      },
    });
    const html = renderStoryboardHtml(storyboard);
    assert.ok(html.includes('Cost Estimate'));
    assert.ok(html.includes('$0.050'));
    assert.ok(html.includes('USD'));
  });

  test('omits cost section when no estimate', () => {
    const html = renderStoryboardHtml(makeStoryboard());
    assert.ok(!html.includes('Cost Estimate'));
  });

  test('includes total duration', () => {
    const html = renderStoryboardHtml(makeStoryboard());
    assert.ok(html.includes('10.0s'));
  });
});
