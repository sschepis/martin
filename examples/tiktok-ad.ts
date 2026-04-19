import 'dotenv/config';
import { Martin, LocalSceneCompiler } from '../src/index';
import * as fs from 'fs';
import * as path from 'path';

// Re-use the WeryAI and ElevenLabs helpers
async function generateVideo(prompt: string) {
  const apiKey = process.env.WERYAI_API_KEY;
  if (!apiKey || apiKey === 'your_weryai_api_key') return 'mock_video.mp4';
  
  console.log(`[WeryAI] Generating video for ad...`);
  try {
    const startResponse = await fetch('https://api.weryai.com/v1/generation/text-to-video', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        model: 'WERYAI_VIDEO_1_0',
        prompt: prompt.substring(0, 2000),
        aspect_ratio: '9:16', // TikTok format!
        duration: 5
      })
    });
    
    const startData = await startResponse.json();
    if (!startData.success || !startData.data?.task_id) {
       console.error('[WeryAI] Failed to start:', startData);
       return 'https://shotstack-assets.s3-ap-southeast-2.amazonaws.com/footage/earth.mp4';
    }
    
    const taskId = startData.data.task_id;
    console.log(`[WeryAI] Task started: ${taskId}. Waiting for completion...`);
    
    while (true) {
      await new Promise(r => setTimeout(r, 5000));
      const statusResponse = await fetch(`https://api.weryai.com/v1/generation/${taskId}/status`, {
        headers: { 'Authorization': `Bearer ${apiKey}` }
      });
      
      const statusData = await statusResponse.json();
      const status = statusData.data?.task_status;
      
      if (status === 'succeed') {
        const url = statusData.data.videos[0];
        console.log(`[WeryAI] Video generated: ${url}`);
        return url;
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

async function generateAudio(text: string, voiceId = '21m00Tcm4TlvDq8ikWAM') {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey || apiKey === 'your_elevenlabs_api_key') return 'mock_audio.mp3';

  console.log(`[ElevenLabs] Generating audio: "${text.substring(0, 30)}..."`);
  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: { stability: 0.5, similarity_boost: 0.75 }
      })
    });

    if (!response.ok) {
      console.error('[ElevenLabs] Failed to generate audio.');
      return undefined;
    }

    const buffer = await response.arrayBuffer();
    const fileName = `ad_narration_${Date.now()}.mp3`;
    fs.writeFileSync(fileName, Buffer.from(buffer));
    return fileName;
  } catch (err) {
    console.error('[ElevenLabs] Error:', err);
    return undefined;
  }
}

async function main() {
  console.log('💄 Starting TikTok Ad Production for "Lumière Éternelle"...\n');

  const director = new Martin({
    llmProvider: 'lmstudio',
    promptCompactness: 'compact'
  });

  const script = `
    NARRATOR: Tired of dull, lifeless skin?
    (Close up of a glowing, elegant bottle of "Lumière Éternelle" serum resting on a marble pedestal, catching the light.)
    NARRATOR: Introducing Lumière Éternelle. The secret to a timeless glow.
    (A beautiful model gently applies the glowing serum to her cheek, her skin looking radiant and flawless.)
    NARRATOR: Get yours today and shine forever.
    (The bottle spins slowly in macro focus, with gold particles floating around it.)
  `;

  console.log('📝 Planning ad production...');
  const manifest = await director.plan(script, {
    style: 'luxury beauty commercial',
    aspectRatio: '9:16' // Vertical video for TikTok
  });

  console.log('\n✅ Ad Manifest Generated:');
  console.log(`Title: ${manifest.title}`);
  console.log(`Mood: ${manifest.mood}`);
  console.log(`Shots: ${manifest.shots.length}\n`);

  const prompts = manifest.export('weryai');
  const videoUrls = [];
  for (let i = 0; i < prompts.length; i++) {
    console.log(`\nShot ${i + 1} Prompt: ${prompts[i]}`);
    const url = await generateVideo(prompts[i]);
    videoUrls.push(url);
  }

  console.log('\n🔊 Generating Voiceover (ElevenLabs)...');
  const narrationLines = [
    "Tired of dull, lifeless skin?",
    "Introducing Lumière Éternelle. The secret to a timeless glow.",
    "Get yours today and shine forever."
  ];

  const audioUrls = [];
  for (const line of narrationLines) {
    // Using a more energetic/commercial voice ID if possible, but we'll stick to default for now
    const audioUrl = await generateAudio(line);
    audioUrls.push(audioUrl);
  }

  console.log('\n🎬 Compiling TikTok Ad with FFMPEG...');
  const compiler = new LocalSceneCompiler();
  const sceneClips = videoUrls.map((url, i) => ({
    videoUrlOrPath: url,
    audioUrlOrPath: audioUrls[i] || undefined,
    duration: 5.0
  }));
  
  // Compile with vertical TikTok dimensions
  const finalLocalVideo = await compiler.compile(sceneClips, path.join(process.cwd(), 'tiktok_ad.mp4'), {
    width: 1080,
    height: 1920
  });
  
  console.log('\n🎉 TikTok Ad Complete!');
  console.log('Final Video:', finalLocalVideo);
}

main().catch(console.error);
