"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = require("node:test");
const assert = __importStar(require("node:assert"));
const luma_1 = require("./luma");
(0, node_test_1.describe)('LumaDreamMachineAdapter', () => {
    const adapter = new luma_1.LumaDreamMachineAdapter();
    (0, node_test_1.test)('has correct name', () => {
        assert.strictEqual(adapter.name, 'luma');
    });
    (0, node_test_1.test)('generates expected prompt', () => {
        const manifest = {
            title: 'Test',
            mood: 'dreamy',
            colorPalette: ['blue', 'purple'],
            aspectRatio: '16:9',
            shots: []
        };
        const shot = {
            id: '1',
            description: 'The clouds are moving fast.',
            subject: 'A flying bird',
            environment: 'The sky',
            camera: { movement: 'tracking', angle: 'high', lens: 'wide' },
            lighting: { style: 'soft', colorTemp: 'warm', contrast: 'low' }
        };
        const prompt = adapter.generatePrompt(manifest, shot);
        const expected = 'A cinematic shot featuring A flying bird in The sky. The clouds are moving fast. The camera features a tracking from a high angle, shot on a wide. The lighting is soft with low contrast. Overall mood is dreamy with a color palette of blue, purple.';
        assert.strictEqual(prompt, expected);
    });
    (0, node_test_1.test)('handles missing optional fields gracefully', () => {
        const manifest = {
            title: 'Test',
            mood: 'dreamy',
            colorPalette: ['blue'],
            aspectRatio: '16:9',
            shots: []
        };
        const shot = {
            id: '1',
            description: 'A simple scene.',
            camera: { movement: 'static', angle: 'eye-level' },
            lighting: { style: 'flat' }
        };
        const prompt = adapter.generatePrompt(manifest, shot);
        const expected = 'A cinematic shot featuring the main subject in the scene. A simple scene. The camera features a static from a eye-level angle, shot on a standard lens. The lighting is flat with natural contrast. Overall mood is dreamy with a color palette of blue.';
        assert.strictEqual(prompt, expected);
    });
});
