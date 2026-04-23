import { resolveStyleGuards, appendNegative, resolveSubject, resolveEnvironmentDesc, resolveColorGrading, buildContextPrefix, resolveCameraMovement } from "./prompt-utils.js";
export class WeryAIAdapter {
    name = 'weryai';
    generatePrompt(manifest, shot, context) {
        const movement = resolveCameraMovement(shot, context);
        const cameraDesc = `${movement} movement from a ${shot.camera.angle} angle`;
        const lensDesc = shot.camera.lens ? `shot on a ${shot.camera.lens} lens` : 'cinematic framing';
        const lightingDesc = `${shot.lighting.style} lighting${shot.lighting.colorTemp ? ` at ${shot.lighting.colorTemp}` : ''}${shot.lighting.contrast ? `, ${shot.lighting.contrast}` : ''}`;
        const subject = resolveSubject(manifest, shot);
        const environment = resolveEnvironmentDesc(manifest, shot);
        const colorGrading = resolveColorGrading(manifest);
        const contextPrefix = buildContextPrefix(manifest, shot, context);
        const guards = resolveStyleGuards(manifest);
        const guardsStr = guards.length > 0 ? ` ${guards.join(', ')},` : '';
        let prompt = `${contextPrefix}Photorealistic, high-quality cinematic video. ${shot.description} ` +
            `The scene features ${subject} in ${environment}. ` +
            `Visually, the camera uses a ${cameraDesc}, ${lensDesc}. ` +
            `The atmosphere is defined by ${lightingDesc}, creating a deeply ${manifest.mood} mood. ` +
            `Color grading highlights ${colorGrading}.` +
            `${guardsStr} Masterpiece, 8k resolution, highly detailed, professional cinematography.`;
        prompt = appendNegative(prompt, manifest, 'narrative');
        return prompt;
    }
    generateImagePrompt(manifest, shot, context) {
        const lensDesc = shot.camera.lens ? `shot on a ${shot.camera.lens} lens` : 'cinematic framing';
        const lightingDesc = `${shot.lighting.style} lighting${shot.lighting.colorTemp ? ` at ${shot.lighting.colorTemp}` : ''}${shot.lighting.contrast ? `, ${shot.lighting.contrast}` : ''}`;
        const subject = resolveSubject(manifest, shot);
        const environment = resolveEnvironmentDesc(manifest, shot);
        const colorGrading = resolveColorGrading(manifest);
        const contextPrefix = buildContextPrefix(manifest, shot, context);
        const guards = resolveStyleGuards(manifest);
        const guardsStr = guards.length > 0 ? ` ${guards.join(', ')},` : '';
        let prompt = `${contextPrefix}Photorealistic, high-quality cinematic photograph. ${shot.description} ` +
            `The scene features ${subject} in ${environment}. ` +
            `Visually, the composition is from a ${shot.camera.angle} angle, ${lensDesc}. ` +
            `The atmosphere is defined by ${lightingDesc}, creating a deeply ${manifest.mood} mood. ` +
            `Color grading highlights ${colorGrading}.` +
            `${guardsStr} Masterpiece, 8k resolution, highly detailed, professional photography.`;
        prompt = appendNegative(prompt, manifest, 'narrative');
        return prompt;
    }
}
