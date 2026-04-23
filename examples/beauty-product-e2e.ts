import 'dotenv/config';
import { Martin } from '../src/index.ts';
import { ShotstackCompiler } from '../src/compiler.ts';

async function main() {
  console.log('🌸 Beauty Product E2E Demo\n');

  const director = new Martin({
    llmProvider: 'lmstudio',
    apiKey: process.env.LMSTUDIO_URL,
    model: process.env.LMSTUDIO_MODEL || 'local-model',
    promptCompactness: 'compact',
    shotstackApiKey: process.env.SHOTSTACK_API_KEY,
  });

  const script = `
    NARRATOR: Introducing Lumière — where science meets radiance.
    (A single drop of golden serum falls in slow motion against a soft white backdrop.)
    NARRATOR: Crafted with 24K gold micro-particles and hyaluronic acid, each drop transforms your skin.
    (Close-up of the elegant glass bottle rotating slowly, light refracting through the amber liquid.)
    NARRATOR: Wake up to skin that glows from within.
    (A woman gently touches her cheek, morning sunlight streaming across her face, skin luminous and dewy.)
    NARRATOR: Lumière. Your ritual of radiance.
    (The bottle rests on a marble surface with soft-focus botanicals in the background. The logo appears.)
  `;

  // Step 1: Plan the production
  console.log('📝 Step 1: Planning production with LLM...');
  const manifest = await director.plan(script, {
    style: 'luxury beauty commercial',
    aspectRatio: '16:9'
  });

  console.log(`\n✅ Manifest: "${manifest.title}" | Mood: ${manifest.mood} | ${manifest.shots.length} shots`);
  for (const shot of manifest.shots) {
    console.log(`  - [${shot.id}] ${shot.description} (${shot.duration || '5s'})`);
  }

  // Step 2: Generate video clips via WeryAI
  console.log('\n🎞️  Step 2: Generating video clips via WeryAI...');
  const weryaiAdapter = (director as any).adapters.get('weryai')!;
  const clips: { videoUrlOrPath: string; audioUrlOrPath?: string; duration: number }[] = [];

  for (let i = 0; i < manifest.shots.length; i++) {
    const shot = manifest.shots[i];
    const prompt = weryaiAdapter.generatePrompt(manifest, shot);
    console.log(`\n  Shot ${i + 1}/${manifest.shots.length}: ${prompt.substring(0, 120)}...`);

    const videoUrl = await generateWeryAIVideo(prompt);
    console.log(`  → Video: ${videoUrl}`);

    let audioUrl: string | undefined;
    if (shot.narration && shot.narration.trim().length > 0) {
      console.log(`  🔊 Generating narration: "${shot.narration.substring(0, 60)}..."`);
      audioUrl = await generateElevenLabsAudio(shot.narration);
      console.log(`  → Audio: ${audioUrl}`);
    }

    clips.push({
      videoUrlOrPath: videoUrl,
      audioUrlOrPath: audioUrl,
      duration: shot.duration ? parseFloat(shot.duration) : 5.0
    });
  }

  // Step 3: Generate Shotstack composition via LLM
  console.log('\n🎬 Step 3: Generating Shotstack composition via LLM...');
  const llmEngine = (director as any).llmEngine;
  const composition = await llmEngine.generateShotstackComposition(manifest, clips);
  console.log('\nComposition JSON:');
  console.log(JSON.stringify(composition, null, 2));

  // Step 4: Submit to Shotstack for rendering
  console.log('\n🚀 Step 4: Submitting to Shotstack for rendering...');
  const compiler = new ShotstackCompiler({ shotstackApiKey: process.env.SHOTSTACK_API_KEY });
  try {
    const finalUrl = await compiler.compile(composition);
    console.log(`\n🎉 DONE! Final video: ${finalUrl}`);
  } catch (err: any) {
    console.error(`\n❌ Shotstack render error: ${err.message}`);
    console.log('\nComposition was generated successfully — render may need valid public video URLs.');
  }
}

async function generateWeryAIVideo(prompt: string): Promise<string> {
  const apiKey = process.env.WERYAI_API_KEY;
  if (!apiKey) return 'https://shotstack-assets.s3-ap-southeast-2.amazonaws.com/footage/earth.mp4';

  try {
    const startResponse = await fetch('https://api.weryai.com/v1/generation/text-to-video', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'WERYAI_VIDEO_1_0',
        prompt: prompt.substring(0, 2000),
        aspect_ratio: '16:9',
        duration: 5
      })
    });

    const startData = await startResponse.json();
    if (!startData.success || !startData.data?.task_id) {
      console.error('  [WeryAI] Start failed:', JSON.stringify(startData).substring(0, 200));
      return 'https://shotstack-assets.s3-ap-southeast-2.amazonaws.com/footage/earth.mp4';
    }

    const taskId = startData.data.task_id;
    console.log(`  [WeryAI] Task ${taskId} started, polling...`);

    for (let attempt = 0; attempt < 60; attempt++) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      const statusResponse = await fetch(`https://api.weryai.com/v1/generation/${taskId}/status`, {
        headers: { 'Authorization': `Bearer ${apiKey}` }
      });
      const statusData = await statusResponse.json();
      const status = statusData.data?.task_status;

      if (status === 'succeed') {
        return statusData.data?.videos?.[0] || 'https://shotstack-assets.s3-ap-southeast-2.amazonaws.com/footage/earth.mp4';
      } else if (status === 'failed' || status === 'error') {
        console.error('  [WeryAI] Failed:', JSON.stringify(statusData).substring(0, 200));
        return 'https://shotstack-assets.s3-ap-southeast-2.amazonaws.com/footage/earth.mp4';
      }
      if (attempt % 6 === 5) console.log(`  [WeryAI] Still waiting... (${(attempt + 1) * 5}s)`);
    }
  } catch (error: any) {
    console.error('  [WeryAI] Error:', error.message);
  }
  return 'https://shotstack-assets.s3-ap-southeast-2.amazonaws.com/footage/earth.mp4';
}

async function generateElevenLabsAudio(text: string): Promise<string | undefined> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) return undefined;

  try {
    const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM', {
      method: 'POST',
      headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: { stability: 0.6, similarity_boost: 0.7 }
      })
    });

    if (!response.ok) {
      console.error('  [ElevenLabs] Failed:', response.status);
      return undefined;
    }

    const buffer = await response.arrayBuffer();
    const filename = `narration_${Date.now()}.mp3`;
    const { writeFileSync } = await import('node:fs');
    writeFileSync(filename, new Uint8Array(buffer));
    return filename;
  } catch (error: any) {
    console.error('  [ElevenLabs] Error:', error.message);
    return undefined;
  }
}

main().catch(console.error);
