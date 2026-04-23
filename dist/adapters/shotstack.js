import { resolveSubject, resolveEnvironmentDesc } from "./prompt-utils.js";
export class ShotstackAdapter {
    name = 'shotstack';
    generatePrompt(manifest, shot, _context) {
        const output = {
            asset: {
                type: 'video',
                description: shot.description,
                subject: resolveSubject(manifest, shot),
                environment: resolveEnvironmentDesc(manifest, shot)
            },
            length: shot.duration ? parseFloat(shot.duration) : 5.0,
            transition: {
                in: 'fade',
                out: 'fade'
            }
        };
        if (manifest.negativePrompt)
            output.negativePrompt = manifest.negativePrompt;
        if (manifest.styleGuards?.length)
            output.styleGuards = manifest.styleGuards;
        if (manifest.visualStyle)
            output.visualStyle = manifest.visualStyle;
        return JSON.stringify(output, null, 2);
    }
}
