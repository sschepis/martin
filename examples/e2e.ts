import 'dotenv/config';
import { Martin } from '../src/index.ts';
import * as fs from 'node:fs';
import * as path from 'node:path';

// Helper to simulate calling the WeryAI API
async function generateVideo(prompt: string) {
  const apiKey = process.env.WERYAI_API_KEY;
  if (!apiKey || apiKey === 'your_weryai_api_key') {
    return 'mock_video_url.mp4';
  }

  console.log(`[WeryAI] Generating video...`);
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
      console.error('[WeryAI] Start failed:', startData);
      return 'https://shotstack-assets.s3-ap-southeast-2.amazonaws.com/footage/earth.mp4';
    }
    
    const taskId = startData.data.task_id;
    console.log(`[WeryAI] Task started: ${taskId}. Waiting for completion...`);
    
    // Poll for status
    while (true) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      const statusResponse = await fetch(`https://api.weryai.com/v1/generation/${taskId}/status`, {
        headers: { 'Authorization': `Bearer ${apiKey}` }
      });
      const statusData = await statusResponse.json();
      
      const status = statusData.data?.task_status;
      if (status === 'succeed') {
        const videoUrl = statusData.data?.videos?.[0];
        console.log(`[WeryAI] Video generated: ${videoUrl}`);
        return videoUrl || 'https://shotstack-assets.s3-ap-southeast-2.amazonaws.com/footage/earth.mp4';
      } else if (status === 'failed' || status === 'error') {
        console.error('[WeryAI] Generation failed:', statusData);
        return 'https://shotstack-assets.s3-ap-southeast-2.amazonaws.com/footage/earth.mp4';
      } else {
        console.log(`[WeryAI] Polling task ${taskId}... status: ${status}`);
      }
    }
  } catch (error) {
    console.error('[WeryAI] Error generating video:', error);
    return 'https://shotstack-assets.s3-ap-southeast-2.amazonaws.com/footage/earth.mp4';
  }
}

// Helper to simulate calling ElevenLabs API
async function generateAudio(text: string, voiceId = '21m00Tcm4TlvDq8ikWAM') {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey || apiKey === 'your_elevenlabs_api_key') {
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
    console.log('[ElevenLabs] Failed to generate audio.');
    return null;
  }
  
  const buffer = await response.arrayBuffer();
  const filename = `narration_${Date.now()}.mp3`;
  fs.writeFileSync(path.join(process.cwd(), filename), new Uint8Array(buffer));
  
  return filename;
}

// Helper to simulate calling Shotstack API
async function compileTimeline(timelineClips: any[]) {
  const apiKey = process.env.SHOTSTACK_API_KEY;
  if (!apiKey || apiKey === 'your_shotstack_api_key') {
    return 'mock_final_video_url.mp4';
  }

  console.log(`[Shotstack] Compiling timeline...`);
  
  const url = process.env.SHOTSTACK_API_URL || 'https://api.shotstack.io/edit/stage/render';
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'x-api-key': apiKey, 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({
      timeline: {
        tracks: [{ clips: timelineClips }]
      },
      output: { format: 'mp4', resolution: 'hd' }
    })
  });
  const data = await response.json();
  if (!response.ok) {
    console.log('[Shotstack] Failed to compile timeline', JSON.stringify(data, null, 2));
    return 'fallback_final_video_url.mp4';
  }
  return data.response?.url || data.response?.id || 'real_final_video_url.mp4';
}

async function main() {
  console.log('🎬 Starting Martin E2E Production...\n');

  const director = new Martin({
    llmProvider: 'lmstudio',
    promptCompactness: 'compact',
    model: process.env.LMSTUDIO_MODEL || 'local-model'
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

  console.log('\n🎞️  Generating Video Prompts (WeryAI)...');
  const prompts = manifest.export('weryai');
  
  const videoUrls = [];
  for (let i = 0; i < prompts.length; i++) {
    console.log(`\nShot ${i + 1} Prompt: ${prompts[i]}`);
    const url = await generateVideo(prompts[i]);
    videoUrls.push(url);
  }

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

  console.log('\n🎬 Compiling Timeline (Shotstack)...');
  const shotstackPrompts = manifest.export('shotstack');
  const timelineClips = shotstackPrompts.map((p, i) => {
    const clip = JSON.parse(p);
    return {
      asset: {
        type: 'video',
        src: videoUrls[i] || 'https://shotstack-assets.s3-ap-southeast-2.amazonaws.com/footage/earth.mp4'
      },
      start: i * 5.0,
      length: clip.length || 5.0
    };
  });
  
  const finalVideoUrl = await compileTimeline(timelineClips);


  console.log('\n🎉 Production Complete!');
  console.log('Videos:', videoUrls);
  console.log('Final Video Render ID:', finalVideoUrl);
  console.log('Audio:', audioUrls);
}

main().catch(console.error);
