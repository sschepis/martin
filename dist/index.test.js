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
const index_1 = require("./index");
(0, node_test_1.describe)('Martin', () => {
    (0, node_test_1.test)('initializes with built-in adapters', () => {
        const director = new index_1.Martin();
        // Test if exportManifest throws or works for built-in adapters (using an empty manifest)
        const manifest = {
            title: 'Test', mood: 'dark', colorPalette: [], aspectRatio: '16:9', shots: []
        };
        const runwayPrompts = director.exportManifest(manifest, 'runway-gen3');
        assert.deepStrictEqual(runwayPrompts, []);
        const lumaPrompts = director.exportManifest(manifest, 'luma');
        assert.deepStrictEqual(lumaPrompts, []);
        const soraPrompts = director.exportManifest(manifest, 'sora');
        assert.deepStrictEqual(soraPrompts, []);
    });
    (0, node_test_1.test)('registerAdapter allows adding custom adapters', () => {
        const director = new index_1.Martin();
        class CustomAdapter {
            name = 'custom';
            generatePrompt(manifest, shot) {
                return `Custom: ${shot.description}`;
            }
        }
        director.registerAdapter(new CustomAdapter());
        const manifest = {
            title: 'Test', mood: 'dark', colorPalette: [], aspectRatio: '16:9',
            shots: [{
                    id: '1', description: 'A test shot',
                    camera: { movement: 'static', angle: 'eye' },
                    lighting: { style: 'flat' }
                }]
        };
        const prompts = director.exportManifest(manifest, 'custom');
        assert.deepStrictEqual(prompts, ['Custom: A test shot']);
    });
    (0, node_test_1.test)('exportManifest throws for unknown adapter', () => {
        const director = new index_1.Martin();
        const manifest = {
            title: 'Test', mood: 'dark', colorPalette: [], aspectRatio: '16:9', shots: []
        };
        assert.throws(() => {
            director.exportManifest(manifest, 'unknown');
        }, /Adapter 'unknown' not found/);
    });
    (0, node_test_1.test)('createDirector creates a new instance', () => {
        const director = (0, index_1.createDirector)();
        assert.ok(director instanceof index_1.Martin);
    });
    (0, node_test_1.test)('plan returns a manifest with an export function', async () => {
        const director = new index_1.Martin();
        const production = await director.plan('Test script');
        assert.strictEqual(production.title, 'Generated Production');
        assert.strictEqual(typeof production.export, 'function');
        const prompts = production.export('sora');
        assert.strictEqual(prompts.length, 2);
        assert.ok(prompts[0].includes('Establishing shot'));
    });
});
