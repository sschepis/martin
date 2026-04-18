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
const sora_1 = require("./sora");
(0, node_test_1.describe)('SoraAdapter', () => {
    const adapter = new sora_1.SoraAdapter();
    (0, node_test_1.test)('has correct name', () => {
        assert.strictEqual(adapter.name, 'sora');
    });
    (0, node_test_1.test)('generates expected prompt', () => {
        const manifest = {
            title: 'Test',
            mood: 'Epic',
            colorPalette: ['Gold', 'Silver'],
            aspectRatio: '16:9',
            shots: []
        };
        const shot = {
            id: '1',
            description: 'A knight riding a horse',
            subject: 'A brave knight',
            environment: 'A medieval battlefield',
            camera: { movement: 'PAN', angle: 'HIGH', lens: '50mm prime' },
            lighting: { style: 'Dramatic', colorTemp: 'warm', contrast: 'High Contrast' }
        };
        const prompt = adapter.generatePrompt(manifest, shot);
        const expected = 'A highly detailed, photorealistic video of A knight riding a horse. The subject is A brave knight, situated in A medieval battlefield. The camera executes a pan from a high angle, simulating a 50mm prime. The lighting is dramatic with high contrast, creating a epic atmosphere. The dominant colors are Gold, Silver.';
        assert.strictEqual(prompt, expected);
    });
    (0, node_test_1.test)('handles missing optional fields gracefully', () => {
        const manifest = {
            title: 'Test',
            mood: 'Calm',
            colorPalette: ['Green'],
            aspectRatio: '16:9',
            shots: []
        };
        const shot = {
            id: '1',
            description: 'A quiet forest',
            camera: { movement: 'Static', angle: 'Eye-level' },
            lighting: { style: 'Soft' }
        };
        const prompt = adapter.generatePrompt(manifest, shot);
        const expected = 'A highly detailed, photorealistic video of A quiet forest. The subject is not explicitly defined, situated in an undefined environment. The camera executes a static from a eye-level angle, simulating a standard cinematic lens. The lighting is soft, creating a calm atmosphere. The dominant colors are Green.';
        assert.strictEqual(prompt, expected);
    });
});
