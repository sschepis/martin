"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeryAIAdapter = void 0;
class WeryAIAdapter {
    name = 'weryai';
    generatePrompt(manifest, shot) {
        // WeryAI specific prompt formatting
        return `Create a cinematic video. Subject: ${shot.subject || 'none'}. ` +
            `Environment: ${shot.environment || 'none'}. ` +
            `Action: ${shot.description}. ` +
            `Camera: ${shot.camera.movement}, ${shot.camera.angle}, ${shot.camera.lens || 'standard'}. ` +
            `Lighting: ${shot.lighting.style}. ` +
            `Mood: ${manifest.mood}. Colors: ${manifest.colorPalette.join(', ')}.`;
    }
}
exports.WeryAIAdapter = WeryAIAdapter;
