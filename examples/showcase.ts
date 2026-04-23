import 'dotenv/config';

/**
 * "Echoes of Neon" — A showcase of Martin's full production pipeline.
 *
 * This example hand-crafts a production manifest for a short cyberpunk noir
 * film and then walks through every feature Martin provides: smart duration,
 * motion control, per-shot engine selection, audio landscape, storyboard
 * preview with cost estimation, prompt A/B testing, and full production.
 *
 * Run without API keys to see everything in mock mode:
 *   npx tsx examples/showcase.ts
 *
 * Set WERYAI_API_KEY / SHOTSTACK_API_KEY / ELEVENLABS_API_KEY for real output.
 */

import {
  Martin,
  estimateCost,
  renderStoryboardHtml,
  resolveMotionControl,
  applyTempoToMotion,
  buildMotionDescription,
  resolveSmartDuration,
  getTempoDefaults,
  resolveMusicUrl,
  resolveSfxUrl,
  extractSfxKeywords,
  resolveAudioMixLevels,
  DEFAULT_ENGINE_RATES,
  generatePromptVariants,
} from '../src/index.ts';
import type {
  ProductionManifest,
  ProduceOptions,
  Shot,
} from '../src/types.ts';
import * as fs from 'node:fs';

// ─────────────────────────────────────────────────────────────────────────────
// 1. THE MANIFEST — hand-crafted to show every schema field in action
// ─────────────────────────────────────────────────────────────────────────────

const manifest: ProductionManifest = {
  title: 'Echoes of Neon',
  mood: 'noir',
  aspectRatio: '16:9',
  colorPalette: ['#0a0a1a', '#e94560', '#00d4ff', '#1a1a2e'],

  negativePrompt: 'text, watermark, logo, blurry, out of focus, distorted face, extra limbs',
  styleGuards: [
    'Maintain consistent neo-noir color grading throughout',
    'All skin tones should look natural under neon lighting',
    'No anime or cartoon style — photorealistic only',
  ],

  visualStyle: {
    contrastStyle: 'high-contrast noir',
    grainLevel: 'subtle film grain',
    colorGradingNotes: 'Teal-and-orange push with crushed blacks, neon accents bleed into shadows',
    blackLevel: 'crushed',
    saturationRange: [0.3, 0.7],
    colorTemperatureRange: [3200, 5600],
  },

  tempo: 'slow-burn',

  audioLandscape: {
    musicMood: 'dark',
    sfxEnabled: true,
  },

  characters: [
    {
      id: 'kira',
      name: 'Kira Tanaka',
      faceDescription: 'Japanese woman, early 40s, sharp cheekbones, tired eyes that miss nothing',
      bodyType: 'lean, athletic',
      hair: 'asymmetric black bob with a single streak of electric blue',
      wardrobe: 'weathered tactical jacket over a dark turtleneck, holographic badge on lapel',
      distinguishingFeatures: 'thin scar across left eyebrow, cybernetic left hand with faint blue glow',
      voiceDescription: 'Middle-aged American female, low and gravelly, world-weary with quiet intensity, measured cadence like someone who chooses every word carefully',
      voiceSettings: { stability: 0.6, similarityBoost: 0.7 },
    },
    {
      id: 'echo',
      name: 'Echo',
      faceDescription: 'Androgynous holographic projection, translucent features, no fixed ethnicity',
      wardrobe: 'shimmering translucent form that shifts between humanoid shapes',
      distinguishingFeatures: 'body flickers with data streams, eyes are solid white light',
      voiceDescription: 'Young androgynous voice, ethereal and slightly reverberant, calm and precise, with an unnervingly even tone — not quite human',
      voiceSettings: { stability: 0.3, similarityBoost: 0.4 },
    },
  ],

  environments: [
    {
      id: 'rooftop',
      name: 'Rooftop Perch',
      spatialDescription: 'Rain-slicked rooftop 40 stories up, overlooking a neon-drenched cityscape',
      props: ['ventilation units', 'antenna array', 'puddles reflecting city lights'],
      atmosphere: 'rain, wind, distant thunder',
      timeOfDay: 'night, 2 AM',
    },
    {
      id: 'alley',
      name: 'The Crawl',
      spatialDescription: 'Narrow alley between mega-structures, steam vents, flickering neon signs in Kanji',
      props: ['dumpsters', 'neon signs', 'steam vents', 'stray cat'],
      atmosphere: 'humid, smoggy, rain dripping from fire escapes',
      timeOfDay: 'night',
    },
    {
      id: 'server-room',
      name: 'The Archive',
      spatialDescription: 'Vast underground server room with blue LED strips, rows of humming black monoliths',
      props: ['server racks', 'holographic terminals', 'cables snaking across floor'],
      atmosphere: 'cold, sterile, faint hum of electronics',
      timeOfDay: 'timeless underground',
    },
  ],

  shots: [
    // Shot 1: Establishing — wide, slow, lingering
    {
      id: 'establishing',
      description: 'Establishing wide shot of the cyberpunk city skyline at night, rain falling, neon signs reflecting in puddles on the rooftop edge',
      camera: { movement: 'crane-up', angle: 'high', lens: '16mm' },
      lighting: { style: 'neon-ambient', colorTemp: 'mixed', contrast: 'high-contrast' },
      environmentId: 'rooftop',
      narration: 'In the cracks between what the city remembers and what it chose to forget, she listens.',
      speakerId: 'kira',
      transition: { type: 'fade', duration: 2.0 },
    },

    // Shot 2: Character intro — medium, tracking
    {
      id: 'kira-intro',
      description: 'Kira Tanaka stands at the rooftop edge looking out over the city, rain dripping from her jacket, her cybernetic hand glowing faintly',
      subject: 'Kira Tanaka',
      camera: { movement: 'steadicam', angle: 'eye-level', lens: '50mm' },
      lighting: { style: 'neon-rim', colorTemp: 'cool', contrast: 'high-contrast' },
      characterIds: ['kira'],
      environmentId: 'rooftop',
      transition: { type: 'dissolve', duration: 1.0 },
    },

    // Shot 3: Close-up detail — short, static
    {
      id: 'hand-closeup',
      description: 'Extreme close-up of Kira\'s cybernetic left hand as data streams across its surface, rain drops landing on the metallic fingers',
      subject: 'Kira\'s cybernetic hand',
      camera: { movement: 'static', angle: 'eye-level', lens: '85mm' },
      lighting: { style: 'practical-neon', colorTemp: 'cool' },
      characterIds: ['kira'],
      duration: '3s',
      transition: { type: 'cut' },
    },

    // Shot 4: Action sequence — fast, handheld
    {
      id: 'alley-chase',
      description: 'Kira running through the narrow alley, dodging between steam vents and neon signs, pursued by drone shadows overhead',
      subject: 'Kira Tanaka',
      camera: { movement: 'handheld', angle: 'low-angle', lens: '24mm' },
      lighting: { style: 'strobing-neon', colorTemp: 'warm-cool-mix' },
      characterIds: ['kira'],
      environmentId: 'alley',
      narration: 'The signal came from below. Always below.',
      speakerId: 'kira',
      transition: { type: 'cut' },
    },

    // Shot 5: Contemplative — slow, orbit
    {
      id: 'server-room-arrival',
      description: 'Kira enters the vast server room, rows of black monoliths stretching into darkness, blue LED strips casting her shadow long',
      subject: 'Kira Tanaka',
      camera: { movement: 'slow orbit', angle: 'low-angle', lens: '35mm' },
      lighting: { style: 'practical-LED', colorTemp: 'cool', contrast: 'low' },
      characterIds: ['kira'],
      environmentId: 'server-room',
      transition: { type: 'dissolve', duration: 1.5 },
    },

    // Shot 6: VFX-heavy — hologram appears
    {
      id: 'echo-manifests',
      description: 'Echo materializes from a holographic terminal, data streams coalescing into a translucent humanoid form, filling the server room with white light',
      subject: 'Echo',
      camera: { movement: 'push-in', angle: 'eye-level', lens: '50mm' },
      lighting: { style: 'holographic-bloom', colorTemp: 'daylight' },
      characterIds: ['echo'],
      environmentId: 'server-room',
      narration: 'They called it a ghost in the machine. She called it the only honest thing left.',
      speakerId: 'echo',
      transition: { type: 'dissolve', duration: 1.0 },
    },

    // Shot 7: Final — wide pull-back
    {
      id: 'final-wide',
      description: 'Wide shot pulling back from Kira and Echo facing each other in the server room, the glow between them illuminating rows of servers fading into darkness',
      subject: 'Kira and Echo',
      camera: { movement: 'dolly-out', angle: 'eye-level', lens: '24mm' },
      lighting: { style: 'mixed-practical-holographic', colorTemp: 'cool' },
      characterIds: ['kira', 'echo'],
      environmentId: 'server-room',
      narration: 'Some signals you follow because you have to. Some, because they followed you first.',
      speakerId: 'kira',
      transition: { type: 'fade', duration: 3.0 },
    },
  ],
};


// ─────────────────────────────────────────────────────────────────────────────
// 2. DEMO: Smart Duration — content analysis determines how long each shot lives
// ─────────────────────────────────────────────────────────────────────────────

function demoDuration() {
  console.log('\n' + '='.repeat(72));
  console.log('  SMART DURATION — Content-aware shot timing');
  console.log('='.repeat(72));

  const tempo = getTempoDefaults(manifest.tempo);
  console.log(`\n  Tempo preset: "${manifest.tempo}" -> default ${tempo.defaultShotDuration}s, camera speed: ${tempo.cameraSpeedModifier}`);

  console.log('\n  Shot                  | Content Signal       | Smart Duration | Why');
  console.log('  ' + '-'.repeat(68));

  for (const shot of manifest.shots) {
    const duration = resolveSmartDuration(shot, tempo, shot.narration);
    const signals: string[] = [];
    if (/establishing|wide shot|panoramic/i.test(shot.description)) signals.push('establishing');
    if (/close-?up|detail|insert|macro/i.test(shot.description)) signals.push('close-up');
    if (/chase|fight|action|run/i.test(shot.description)) signals.push('action');
    if (/contemplat|peaceful|serene/i.test(shot.description)) signals.push('contemplative');
    if (/tracking|steadicam|orbit/i.test(`${shot.description} ${shot.camera.movement}`)) signals.push('tracking');
    if (shot.duration) signals.push(`explicit: ${shot.duration}`);
    if (shot.narration) signals.push('has narration');

    const padId = shot.id.padEnd(20);
    const padSignal = (signals.join(', ') || 'baseline').padEnd(20);
    const padDur = `${duration.toFixed(1)}s`.padEnd(14);

    let why = '';
    if (shot.duration) why = 'Explicit duration wins';
    else if (shot.narration && duration > tempo.defaultShotDuration) why = 'Extended for narration';
    else if (signals.includes('establishing')) why = 'Establishing -> x1.3';
    else if (signals.includes('close-up')) why = 'Close-up -> x0.7';
    else if (signals.includes('action')) why = 'Action -> x0.6';
    else if (signals.includes('tracking')) why = 'Tracking -> x1.2';
    else why = 'Tempo default';

    console.log(`  ${padId} | ${padSignal} | ${padDur} | ${why}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. DEMO: Motion Control — camera movements resolved to structured trajectories
// ─────────────────────────────────────────────────────────────────────────────

function demoMotion() {
  console.log('\n' + '='.repeat(72));
  console.log('  MOTION CONTROL — Camera trajectories from manifest vocabulary');
  console.log('='.repeat(72));

  const tempo = getTempoDefaults(manifest.tempo);

  console.log(`\n  Tempo modifier: "${tempo.cameraSpeedModifier}" overrides trajectory speed\n`);

  for (const shot of manifest.shots) {
    const raw = resolveMotionControl(shot);
    const adjusted = applyTempoToMotion(raw, tempo);
    const desc = buildMotionDescription(adjusted);

    console.log(`  [${shot.id}]`);
    console.log(`    Input:      "${shot.camera.movement}" (${shot.camera.angle}, ${shot.camera.lens || 'default'})`);
    console.log(`    Resolved:   type=${adjusted.trajectory?.type}, dir=${adjusted.trajectory?.direction || '-'}, speed=${adjusted.trajectory?.speed}`);
    console.log(`    For prompt:  "${desc}"`);
    console.log();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. DEMO: Audio Landscape — mood music + environment-matched SFX
// ─────────────────────────────────────────────────────────────────────────────

function demoAudio() {
  console.log('='.repeat(72));
  console.log('  AUDIO LANDSCAPE — Mood music + environment SFX matching');
  console.log('='.repeat(72));

  const musicUrl = resolveMusicUrl(manifest);
  const mixLevels = resolveAudioMixLevels();

  console.log(`\n  Mood: "${manifest.mood}" -> Music: ${musicUrl}`);
  console.log(`  Mix: narration ${(mixLevels.narrationVolume * 100).toFixed(0)}% (-3dB), music ${(mixLevels.musicVolume * 100).toFixed(0)}% (-12dB), SFX ${(mixLevels.sfxVolume * 100).toFixed(0)}% (-6dB)`);
  console.log();

  for (const shot of manifest.shots) {
    const keywords = extractSfxKeywords(shot, manifest);
    const sfxUrl = resolveSfxUrl(shot, manifest);

    const env = manifest.environments?.find(e => e.id === shot.environmentId);
    const envName = env?.name || shot.environment || '(none)';

    console.log(`  [${shot.id}] env="${envName}"`);
    console.log(`    Keywords: ${keywords.length > 0 ? keywords.join(', ') : '(none matched)'}`);
    console.log(`    SFX URL:  ${sfxUrl || '(no SFX for this shot)'}`);
    console.log();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. DEMO: Cost Estimation — know what you'll spend before generating
// ─────────────────────────────────────────────────────────────────────────────

function demoCost() {
  console.log('='.repeat(72));
  console.log('  COST ESTIMATION — Budget before you spend');
  console.log('='.repeat(72));

  const configs: Array<{ label: string; options: ProduceOptions }> = [
    {
      label: 'Budget: all fal.ai, no audio',
      options: { videoEngine: 'fal' },
    },
    {
      label: 'Standard: WeryAI + per-shot overrides',
      options: { videoEngine: 'weryai', audioEngine: 'elevenlabs' },
    },
    {
      label: 'Premium: per-shot engines + reference images + narration',
      options: {
        videoEngine: 'weryai',
        audioEngine: 'elevenlabs',
        useReferenceImages: true,
        useImageToVideo: true,
      },
    },
  ];

  console.log();
  for (const { label, options } of configs) {
    const cost = estimateCost(manifest, options);
    const parts = Object.entries(cost.summary)
      .map(([cat, total]) => `${cat}: $${total.toFixed(2)}`)
      .join(', ');
    console.log(`  ${label}`);
    console.log(`    Total: $${cost.totalCost.toFixed(2)} USD (${parts})`);
    console.log(`    Shots with per-shot engine overrides: ${manifest.shots.filter(s => s.videoEngine).map(s => `${s.id}->${s.videoEngine}`).join(', ')}`);
    console.log();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. DEMO: Per-Shot Engine Selection — right tool for each shot
// ─────────────────────────────────────────────────────────────────────────────

function demoEngineSelection() {
  console.log('='.repeat(72));
  console.log('  ENGINE SELECTION — Per-shot engine routing');
  console.log('='.repeat(72));

  const defaultEngine = 'weryai';
  console.log(`\n  Default engine: ${defaultEngine}`);
  console.log(`  Per-shot overrides:\n`);

  for (const shot of manifest.shots) {
    const engine = shot.videoEngine || defaultEngine;
    const why = shot.videoEngine
      ? `explicitly set — ${shot.videoEngine === 'runway' ? 'Runway for character fidelity' : 'Kling for fast action'}`
      : 'using default';
    const rate = DEFAULT_ENGINE_RATES.video[engine] || 0;
    console.log(`  [${shot.id.padEnd(20)}] -> ${engine.padEnd(8)} ($${rate.toFixed(2)}/gen) — ${why}`);
  }
  console.log();
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. DEMO: Prompt Variants — A/B testing for quality
// ─────────────────────────────────────────────────────────────────────────────

function demoVariants() {
  console.log('='.repeat(72));
  console.log('  PROMPT VARIANTS — A/B testing prompt strategies');
  console.log('='.repeat(72));

  const director = new Martin();
  const adapter = (director as any).adapters.get('weryai')!;
  const shot = manifest.shots[0]; // establishing shot
  const context = { shotIndex: 0, totalShots: manifest.shots.length, tempo: getTempoDefaults(manifest.tempo) };

  const variants = generatePromptVariants(manifest, shot, adapter, context, 4);

  console.log(`\n  Shot: "${shot.id}" — generating ${variants.length} prompt variants\n`);

  for (const v of variants) {
    const preview = v.prompt.length > 120 ? v.prompt.slice(0, 120) + '...' : v.prompt;
    console.log(`  [${v.id}] strategy: ${v.strategy}`);
    console.log(`    "${preview}"`);
    console.log();
  }

  console.log('  In production with variantsPerShot=3, Martin generates all variants,');
  console.log('  scores each via quality validation, and picks the best one automatically.');
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. DEMO: Adapter Comparison — same manifest, different engine prompts
// ─────────────────────────────────────────────────────────────────────────────

function demoAdapters() {
  console.log('\n' + '='.repeat(72));
  console.log('  ADAPTER COMPARISON — Same shot, different engine prompts');
  console.log('='.repeat(72));

  const director = new Martin();
  const shot = manifest.shots[5]; // echo-manifests — the VFX-heavy shot

  console.log(`\n  Shot: "${shot.id}" — ${shot.description.slice(0, 80)}...`);

  for (const adapterName of ['weryai', 'runway-gen3', 'luma', 'sora']) {
    const prompts = director.exportManifest(manifest, adapterName);
    const idx = manifest.shots.indexOf(shot);
    const prompt = prompts[idx];
    const preview = prompt.length > 150 ? prompt.slice(0, 150) + '...' : prompt;
    console.log(`\n  [${adapterName}]:`);
    console.log(`    "${preview}"`);
  }
  console.log();
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. DEMO: Storyboard + HTML Export — preview before committing
// ─────────────────────────────────────────────────────────────────────────────

async function demoStoryboard() {
  console.log('='.repeat(72));
  console.log('  STORYBOARD PREVIEW — Visual pre-production review');
  console.log('='.repeat(72));

  const director = new Martin();
  console.log('\n  Generating storyboard frames (one image per shot)...');

  try {
    const storyboard = await director.storyboard(manifest, {
      videoEngine: 'weryai',
      audioEngine: 'elevenlabs',
      useReferenceImages: true,
    });

    console.log(`\n  Storyboard: "${storyboard.title}" | ${storyboard.frames.length} frames | ${storyboard.totalDuration.toFixed(1)}s total`);

    for (const frame of storyboard.frames) {
      const a = frame.annotations;
      console.log(`\n  [${frame.shotId}]`);
      console.log(`    Camera: ${a.cameraMovement} / ${a.cameraAngle}${a.lens ? ` / ${a.lens}` : ''}`);
      console.log(`    Lighting: ${a.lightingStyle} | Duration: ${a.duration}`);
      if (a.characters?.length) console.log(`    Characters: ${a.characters.join(', ')}`);
      if (a.environment) console.log(`    Environment: ${a.environment}`);
      if (a.transition) console.log(`    Transition: ${a.transition}`);
      if (a.narration) console.log(`    Narration: "${a.narration.slice(0, 60)}..."`);
    }

    if (storyboard.costEstimate) {
      const cost = storyboard.costEstimate;
      console.log(`\n  Estimated cost: $${cost.totalCost.toFixed(2)} USD`);
      for (const [cat, total] of Object.entries(cost.summary)) {
        console.log(`    ${cat}: $${total.toFixed(2)}`);
      }
    }

    const html = renderStoryboardHtml(storyboard);
    const outPath = 'storyboard-echoes-of-neon.html';
    fs.writeFileSync(outPath, html, 'utf-8');
    console.log(`\n  HTML storyboard exported to: ${outPath}`);
    console.log(`  Open it in a browser to review before spending on video generation.`);
  } catch (err: any) {
    console.log(`\n  Storyboard generation failed: ${err.message}`);
    console.log('  Skipping storyboard — continuing to full production...');
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. FULL PRODUCTION — everything integrated
// ─────────────────────────────────────────────────────────────────────────────

async function demoFullProduction() {
  console.log('\n' + '='.repeat(72));
  console.log('  FULL PRODUCTION — All features integrated');
  console.log('='.repeat(72));

  const director = new Martin({
    shotstackApiKey: process.env.SHOTSTACK_API_KEY,
    defaultNegativePrompt: manifest.negativePrompt,
    defaultStyleGuards: manifest.styleGuards,
  });

  const options: ProduceOptions = {
    videoEngine: 'weryai',
    audioEngine: 'elevenlabs',
    useReferenceImages: true,
    useImageToVideo: true,
    qualityValidation: true,
    maxRetries: 1,
    variantsPerShot: 1,
    variantSelection: 'auto',
    sfxEnabled: true,
    resolution: { width: 1920, height: 1080 },
    audioMixLevels: {
      narrationVolume: 0.8,
      musicVolume: 0.2,
      sfxVolume: 0.4,
    },
  };

  console.log('\n  Production options:');
  console.log(`    Video engine:       ${options.videoEngine} (with per-shot overrides)`);
  console.log(`    Audio engine:       ${options.audioEngine}`);
  console.log(`    Reference images:   ${options.useReferenceImages}`);
  console.log(`    Image-to-video:     ${options.useImageToVideo}`);
  console.log(`    Quality validation: ${options.qualityValidation} (max ${options.maxRetries} retries)`);
  console.log(`    Variants per shot:  ${options.variantsPerShot} (selection: ${options.variantSelection})`);
  console.log(`    SFX:                ${options.sfxEnabled}`);
  console.log(`    Resolution:         ${options.resolution!.width}x${options.resolution!.height}`);
  console.log(`    Audio mix:          narration ${(options.audioMixLevels!.narrationVolume! * 100).toFixed(0)}%, music ${(options.audioMixLevels!.musicVolume! * 100).toFixed(0)}%, SFX ${(options.audioMixLevels!.sfxVolume! * 100).toFixed(0)}%`);

  const preflightCost = estimateCost(manifest, options);
  console.log(`\n  Pre-flight cost estimate: $${preflightCost.totalCost.toFixed(2)} USD`);

  console.log('\n  Starting production...\n');
  let finalUrl: string;
  try {
    finalUrl = await director.produce(manifest, options);
  } catch (err: any) {
    console.log(`\n  [Expected in mock mode] ${err.message}`);
    console.log('  With SHOTSTACK_API_KEY set, this would return the rendered video URL.');
    finalUrl = '(mock — set SHOTSTACK_API_KEY for real output)';
  }

  console.log('\n  ' + '-'.repeat(50));
  console.log(`  Final output: ${finalUrl}`);

  const history = director.getPromptHistory();
  if (history.length > 0) {
    console.log(`\n  Prompt history: ${history.length} records`);
    const strategies = new Map<string, number[]>();
    for (const record of history) {
      const scores = strategies.get(record.strategy) || [];
      scores.push(record.score);
      strategies.set(record.strategy, scores);
    }
    for (const [strategy, scores] of strategies) {
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      console.log(`    ${strategy}: avg score ${avg.toFixed(2)} (${scores.length} attempts)`);
    }

    const exported = director.exportPromptHistory();
    fs.writeFileSync('prompt-history.json', exported, 'utf-8');
    console.log(`\n  Prompt history exported to prompt-history.json`);
    console.log(`  Import in future sessions to build on learned prompt patterns.`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n' + '#'.repeat(72));
  console.log('#  MARTIN SHOWCASE: "Echoes of Neon"');
  console.log('#  A cyberpunk noir mini-film demonstrating every production feature');
  console.log('#'.repeat(72));

  console.log(`\n  Manifest: "${manifest.title}"`);
  console.log(`  ${manifest.shots.length} shots | ${manifest.characters?.length} characters | ${manifest.environments?.length} environments`);
  console.log(`  Mood: ${manifest.mood} | Aspect: ${manifest.aspectRatio} | Tempo: ${manifest.tempo}`);
  console.log(`  Style guards: ${manifest.styleGuards?.length} rules`);
  console.log(`  Negative prompt: "${manifest.negativePrompt?.slice(0, 60)}..."`);

  // Synchronous demos — pure computation, no API calls
  demoDuration();
  demoMotion();
  demoAudio();
  demoCost();
  demoEngineSelection();
  demoVariants();
  demoAdapters();

  // Async demos — may call APIs (mock if no keys)
  await demoStoryboard();
  await demoFullProduction();

  console.log('\n' + '#'.repeat(72));
  console.log('#  SHOWCASE COMPLETE');
  console.log('#'.repeat(72) + '\n');
}

main().catch(console.error);
