export class ShotstackAdapter {
    name = 'shotstack';
    generatePrompt(manifest, shot) {
        // Shotstack is primarily a video editing/compositing API rather than a generative AI.
        // However, if using it to generate assets or define a timeline, we can construct 
        // a JSON representation or a specific descriptive format.
        // For now, we return a structured description of the shot intended for a timeline.
        return JSON.stringify({
            asset: {
                type: 'video',
                description: shot.description,
                subject: shot.subject || 'none',
                environment: shot.environment || 'none'
            },
            length: shot.duration ? parseFloat(shot.duration) : 5.0,
            transition: {
                in: 'fade',
                out: 'fade'
            }
        }, null, 2);
    }
}
