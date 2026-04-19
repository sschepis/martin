export class WeryAIEngine {
    apiKey;
    constructor() {
        this.apiKey = process.env.WERYAI_API_KEY || '';
    }
    async generateImage(prompt, aspectRatio = '16:9') {
        if (!this.apiKey || this.apiKey === 'your_weryai_api_key') {
            console.log(`[WeryAI Mock] Would generate image for: "${prompt}"`);
            return 'mock_image_url.jpg';
        }
        console.log(`[WeryAI] Generating image...`);
        try {
            const startResponse = await fetch('https://api.weryai.com/v1/generation/text-to-image', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'WERYAI_IMAGE_2_0',
                    prompt: prompt.substring(0, 2000),
                    aspect_ratio: aspectRatio,
                    image_number: 1
                })
            });
            const startData = await startResponse.json();
            if (!startData.success || !startData.data?.task_id) {
                console.error('[WeryAI] Failed to start image task:', startData);
                throw new Error('Failed to start image task');
            }
            const taskId = startData.data.task_id;
            console.log(`[WeryAI] Image task started: ${taskId}. Waiting for completion...`);
            while (true) {
                await new Promise(r => setTimeout(r, 5000));
                const statusResponse = await fetch(`https://api.weryai.com/v1/generation/${taskId}/status`, {
                    headers: { 'Authorization': `Bearer ${this.apiKey}` }
                });
                const statusData = await statusResponse.json();
                const status = statusData.data?.task_status;
                if (status === 'succeed') {
                    const url = statusData.data.images[0];
                    console.log(`[WeryAI] Image generated: ${url}`);
                    return url;
                }
                else if (status === 'failed' || status === 'error') {
                    console.error('[WeryAI] Image generation failed:', statusData);
                    throw new Error('Image generation failed');
                }
                else {
                    console.log(`[WeryAI] Polling image task ${taskId}... status: ${status}`);
                }
            }
        }
        catch (error) {
            console.error('[WeryAI] Error generating image:', error);
            throw error;
        }
    }
    async generateVideo(prompt, aspectRatio = '16:9', imageUrl) {
        if (!this.apiKey || this.apiKey === 'your_weryai_api_key') {
            console.log(`[WeryAI Mock] Would generate video for: "${prompt}"`);
            return 'https://shotstack-assets.s3-ap-southeast-2.amazonaws.com/footage/earth.mp4';
        }
        console.log(`[WeryAI] Generating video...`);
        try {
            const endpoint = imageUrl
                ? 'https://api.weryai.com/v1/generation/image-to-video'
                : 'https://api.weryai.com/v1/generation/text-to-video';
            const body = {
                model: 'WERYAI_VIDEO_1_0',
                prompt: prompt.substring(0, 2000),
                aspect_ratio: aspectRatio,
                duration: 5
            };
            if (imageUrl) {
                body.image = imageUrl;
            }
            const startResponse = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const startData = await startResponse.json();
            if (!startData.success || !startData.data?.task_id) {
                console.error('[WeryAI] Failed to start video task:', startData);
                return 'https://shotstack-assets.s3-ap-southeast-2.amazonaws.com/footage/earth.mp4';
            }
            const taskId = startData.data.task_id;
            console.log(`[WeryAI] Video task started: ${taskId}. Waiting for completion...`);
            while (true) {
                await new Promise(r => setTimeout(r, 5000));
                const statusResponse = await fetch(`https://api.weryai.com/v1/generation/${taskId}/status`, {
                    headers: { 'Authorization': `Bearer ${this.apiKey}` }
                });
                const statusData = await statusResponse.json();
                const status = statusData.data?.task_status;
                if (status === 'succeed') {
                    const url = statusData.data.videos[0];
                    console.log(`[WeryAI] Video generated: ${url}`);
                    return url;
                }
                else if (status === 'failed' || status === 'error') {
                    console.error('[WeryAI] Video generation failed:', statusData);
                    return 'https://shotstack-assets.s3-ap-southeast-2.amazonaws.com/footage/earth.mp4';
                }
                else {
                    console.log(`[WeryAI] Polling video task ${taskId}... status: ${status}`);
                }
            }
        }
        catch (error) {
            console.error('[WeryAI] Error generating video:', error);
            return 'https://shotstack-assets.s3-ap-southeast-2.amazonaws.com/footage/earth.mp4';
        }
    }
}
