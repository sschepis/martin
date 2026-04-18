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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Martin = void 0;
exports.createDirector = createDirector;
const llm_1 = require("./llm");
const runway_gen3_1 = require("./adapters/runway-gen3");
const luma_1 = require("./adapters/luma");
const sora_1 = require("./adapters/sora");
const weryai_1 = require("./adapters/weryai");
__exportStar(require("./types"), exports);
class Martin {
    config;
    llmEngine;
    adapters;
    constructor(config = {}) {
        this.config = config;
        this.llmEngine = new llm_1.LLMEngine(config);
        // Register built-in adapters
        this.adapters = new Map();
        this.registerAdapter(new runway_gen3_1.RunwayGen3Adapter());
        this.registerAdapter(new luma_1.LumaDreamMachineAdapter());
        this.registerAdapter(new sora_1.SoraAdapter());
        this.registerAdapter(new weryai_1.WeryAIAdapter());
    }
    /**
     * Registers a new video generation adapter.
     */
    registerAdapter(adapter) {
        this.adapters.set(adapter.name.toLowerCase(), adapter);
    }
    /**
     * Plans the production by analyzing the script and generating a manifest.
     */
    async plan(script, options) {
        const manifest = await this.llmEngine.analyzeScript(script, options);
        // Attach an export method to the manifest for convenience
        return {
            ...manifest,
            export: (adapterName) => this.exportManifest(manifest, adapterName)
        };
    }
    /**
     * Exports the manifest using a specific adapter.
     */
    exportManifest(manifest, adapterName) {
        const adapter = this.adapters.get(adapterName.toLowerCase());
        if (!adapter) {
            throw new Error(`Adapter '${adapterName}' not found. Available adapters: ${Array.from(this.adapters.keys()).join(', ')}`);
        }
        return manifest.shots.map(shot => adapter.generatePrompt(manifest, shot));
    }
}
exports.Martin = Martin;
// Export a default instance creator for convenience
function createDirector(config) {
    return new Martin(config);
}
