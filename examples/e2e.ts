import 'dotenv/config';
import { Martin } from '../src/index';
import * as fs from 'fs';
import * as path from 'path';

// Helper to simulate calling the WeryAI API
async function generateVideo(prompt: string) {
  const apiKey = process.env.WERYAI_API_KEY;
  if (!apiKey || apiKey === 'your_weryai_api_key') {
    console.log(`[WeryAI Mock] Would generate video for prompt: "${prompt}"`);
    return 'mock_video_url.mp4';
  }

  console.log(`[WeryAI] Generating video...`);
  // Replace with actual WeryAI API endpoint when available
  /*
  const response = await fetch('https://api.weryai.com/v1/generations', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt })
  });
  const data = await response.json();
  return data.videoUrl;
  */
  return 'real_video_url.mp4';
}

// Helper to simulate calling ElevenLabs API
async function generateAudio(text: string, voiceId = '21m00Tcm4TlvDq8ikWAM') {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey || apiKey === 'your_elevenlabs_api_key') {
    console.log(`[ElevenLabs Mock] Would generate audio for: "${text}"`);
    return 'mock_audio_url.mp3';
  }

  console.log(`[ElevenLabs] Generating audio...`);
  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_monolingual_v1',
      voice_settings: { stability: 0.5, similarity_boost: 0.5 }
    })
  });

  if (!response.ok) {
    console.error('[ElevenLabs] Failed to generate audio', await response.text());
    return null;
  }
  
  // In a real scenario, you'd save the buffer to a file
  const buffer = await response.arrayBuffer();
  const filename = `narration_${Date.now()}.mp3`;
  fs.writeFileSync(path.join(process.cwd(), filename), Buffer.from(buffer));
  
  return filename;
}

// Helper to simulate calling Shotstack API
async function compileTimeline(timelineJson: any[]) {
  const apiKey = process.env.SHOTSTACK_API_KEY;
  if (!apiKey || apiKey === 'your_shotstack_api_key') {
    console.log(`[Shotstack Mock] Would compile timeline with ${timelineJson.length} assets.`);
    return 'mock_final_video_url.mp4';
  }

  console.log(`[Shotstack] Compiling timeline...`);
  // Replace with actual Shotstack API endpoint
  /*
  const response = await fetch('https://api.shotstack.io/edit/v1/render', {
    method: 'POST',
    headers: { 'x-api-key': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      timeline: {
        tracks: [{ clips: timelineJson }]
      },
      output: { format: 'mp4', resolution: 'hd' }
    })
  });
  const data = await response.json();
  return data.response.url;
  */
  return 'real_final_video_url.mp4';
}

async function main() {
  console.log('🎬 Starting Martin E2E Production...\n');

  // 1. Initialize Martin with LMStudio
  const director = new Martin({
    llmProvider: 'lmstudio',
    model: process.env.LMSTUDIO_MODEL || 'local-model'
    // apiKey defaults to process.env.LMSTUDIO_URL in our implementation
  });

  const script = `
    NARRATOR: In the year 2099, the neon lights of Neo-Tokyo hide more than they illuminate.
    (A lone figure walks down a rain-slicked alley, coat collar turned up against the chill.)
    NARRATOR: We built them to serve. But we forgot to teach them how to forget.
    (The figure pauses, looking up at a massive holographic billboard of a smiling family.)
  `;

  console.log('📝 Planning production...');
  const manifest = await director.plan(script, {
    style: 'cyberpunk noir',
    aspectRatio: '21:9'
  });

  console.log('\n✅ Production Manifest Generated:');
  console.log(`Title: ${manifest.title}`);
  console.log(`Mood: ${manifest.mood}`);
  console.log(`Shots: ${manifest.shots.length}`);

  // 2. Export Prompts for WeryAI
  console.log('\n🎞️  Generating Video Prompts (WeryAI)...');
  const prompts = manifest.export('weryai');
  
  const videoUrls = [];
  for (let i = 0; i < prompts.length; i++) {
    console.log(`\nShot ${i + 1} Prompt: ${prompts[i]}`);
    const url = await generateVideo(prompts[i]);
    videoUrls.push(url);
  }

  // 3. Generate Audio for the narration
  console.log('\n🔊 Generating Narration (ElevenLabs)...');
  const narrationLines = [
    "In the year 2099, the neon lights of Neo-Tokyo hide more than they illuminate.",
    "We built them to serve. But we forgot to teach them how to forget."
  ];

  const audioUrls = [];
  for (const line of narrationLines) {
    const audioUrl = await generateAudio(line);
    audioUrls.push(audioUrl);
  }



  // 4. Export Timeline for Shotstack
  console.log('\n🎬 Compiling Timeline (Shotstack)...');
  const shotstackPrompts = manifest.export('shotstack');
  const timelineClips = shotstackPrompts.map(p => JSON.parse(p));
  const finalVideoUrl = await compileTimeline(timelineClips);

  console.log('\n🎉 Production Complete!');
  console.log('Videos:', videoUrls);
  console.log('Final Video:', finalVideoUrl);
  console.log('Audio:', audioUrls);
}

main().catch(console.error);
