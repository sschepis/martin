import type { StoryboardResult, StoryboardFrame, CostEstimate } from './types.ts';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderFrameCard(frame: StoryboardFrame, index: number): string {
  const a = frame.annotations;
  const charLine = a.characters?.length
    ? `<dt>Characters</dt><dd>${a.characters.map(escapeHtml).join(', ')}</dd>` : '';
  const envLine = a.environment
    ? `<dt>Environment</dt><dd>${escapeHtml(a.environment)}</dd>` : '';
  const transLine = a.transition
    ? `<dt>Transition</dt><dd>${escapeHtml(a.transition)}</dd>` : '';
  const narrLine = a.narration
    ? `<dt>Narration</dt><dd><em>${escapeHtml(a.narration)}</em></dd>` : '';

  return `<article class="card">
  <div class="card-img">
    <img src="${escapeHtml(frame.imageUrl)}" alt="Shot ${index + 1}: ${escapeHtml(frame.shot.description)}" />
    <span class="badge">${escapeHtml(frame.shotId)}</span>
  </div>
  <div class="card-body">
    <h3>Shot ${index + 1}: ${escapeHtml(frame.shotId)}</h3>
    <p class="desc">${escapeHtml(frame.shot.description)}</p>
    <dl>
      <dt>Camera</dt><dd>${escapeHtml(a.cameraMovement)} / ${escapeHtml(a.cameraAngle)}${a.lens ? ` / ${escapeHtml(a.lens)}` : ''}</dd>
      <dt>Lighting</dt><dd>${escapeHtml(a.lightingStyle)}</dd>
      <dt>Duration</dt><dd>${escapeHtml(a.duration)}</dd>
      ${envLine}
      ${charLine}
      ${transLine}
      ${narrLine}
    </dl>
  </div>
</article>`;
}

function renderCostSection(estimate: CostEstimate): string {
  const rows = estimate.breakdown.map(item =>
    `<tr><td>${escapeHtml(item.shotId)}</td><td>${escapeHtml(item.category)}</td><td>${escapeHtml(item.engine)}</td><td>$${item.unitCost.toFixed(3)}</td><td>${item.quantity}</td><td>$${item.subtotal.toFixed(3)}</td></tr>`
  ).join('\n');

  const summaryRows = Object.entries(estimate.summary).map(([cat, total]) =>
    `<tr><td>${escapeHtml(cat)}</td><td>$${total.toFixed(3)}</td></tr>`
  ).join('\n');

  return `<section class="cost-estimate">
<h2>Cost Estimate</h2>
<table class="cost-table">
<thead><tr><th>Shot</th><th>Category</th><th>Engine</th><th>Unit Cost</th><th>Qty</th><th>Subtotal</th></tr></thead>
<tbody>${rows}</tbody>
<tfoot><tr><td colspan="5"><strong>Total</strong></td><td><strong>$${estimate.totalCost.toFixed(3)}</strong> ${escapeHtml(estimate.currency)}</td></tr></tfoot>
</table>
<h3>Summary by Category</h3>
<table class="summary-table"><thead><tr><th>Category</th><th>Total</th></tr></thead><tbody>${summaryRows}</tbody></table>
</section>`;
}

const CSS_STYLES = `* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: system-ui, -apple-system, sans-serif; background: #1a1a2e; color: #e0e0e0; padding: 2rem; }
header { text-align: center; margin-bottom: 2rem; }
h1 { color: #e94560; font-size: 2rem; }
.meta { color: #888; margin-top: 0.5rem; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); gap: 1.5rem; }
.card { background: #16213e; border-radius: 8px; overflow: hidden; border: 1px solid #0f3460; }
.card-img { position: relative; }
.card-img img { width: 100%; display: block; }
.badge { position: absolute; top: 8px; left: 8px; background: #e94560; color: white; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem; }
.card-body { padding: 1rem; }
.card-body h3 { color: #e94560; margin-bottom: 0.5rem; }
.desc { color: #ccc; margin-bottom: 0.75rem; font-size: 0.95rem; }
dl { display: grid; grid-template-columns: auto 1fr; gap: 0.25rem 0.75rem; font-size: 0.85rem; }
dt { font-weight: bold; color: #8899aa; }
dd { color: #bbb; }
.cost-estimate { margin-top: 2rem; background: #16213e; padding: 1.5rem; border-radius: 8px; }
.cost-estimate h2 { color: #e94560; margin-bottom: 1rem; }
.cost-estimate h3 { color: #e94560; margin-top: 1rem; margin-bottom: 0.5rem; }
table { width: 100%; border-collapse: collapse; margin-bottom: 1rem; }
th, td { padding: 0.5rem; text-align: left; border-bottom: 1px solid #0f3460; font-size: 0.85rem; }
th { color: #e94560; }
tfoot td { border-top: 2px solid #e94560; }
footer { text-align: center; color: #555; margin-top: 2rem; font-size: 0.8rem; }`;

export function renderStoryboardHtml(storyboard: StoryboardResult): string {
  const frameCards = storyboard.frames.map((frame, i) => renderFrameCard(frame, i)).join('\n');
  const costSection = storyboard.costEstimate ? renderCostSection(storyboard.costEstimate) : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Storyboard: ${escapeHtml(storyboard.title)}</title>
<style>
${CSS_STYLES}
</style>
</head>
<body>
<header>
  <h1>${escapeHtml(storyboard.title)}</h1>
  <p class="meta">Mood: ${escapeHtml(storyboard.mood)} | ${storyboard.frames.length} shots | Total: ${storyboard.totalDuration.toFixed(1)}s</p>
</header>
<main class="grid">
${frameCards}
</main>
${costSection}
<footer>Generated by Martin AI Video Production Framework</footer>
</body>
</html>`;
}
