export const SPM_JSON_SCHEMA = {
    type: 'object',
    properties: {
        title: { type: 'string', description: 'The title of the production' },
        mood: { type: 'string', description: 'Overall mood or atmosphere' },
        colorPalette: {
            type: 'array',
            items: { type: 'string' },
            description: 'List of dominant colors'
        },
        aspectRatio: { type: 'string', enum: ['16:9', '21:9', '9:16', '1:1'] },
        negativePrompt: { type: 'string', description: 'Global negative prompt applied to all shots to prevent AI artifacts (e.g. "no text, no watermarks, no morphing")' },
        styleGuards: {
            type: 'array',
            items: { type: 'string' },
            description: 'Quality and style anchor tokens applied to all shot prompts (e.g. "cinematic film grain", "photorealistic")'
        },
        characters: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    faceDescription: { type: 'string', description: 'Detailed face description for visual consistency' },
                    bodyType: { type: 'string' },
                    hair: { type: 'string' },
                    wardrobe: { type: 'string', description: 'Clothing and accessories' },
                    distinguishingFeatures: { type: 'string' }
                },
                required: ['id', 'faceDescription', 'wardrobe']
            },
            description: 'Character definitions for visual consistency across shots'
        },
        environments: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    spatialDescription: { type: 'string', description: 'Physical layout and spatial details' },
                    props: { type: 'array', items: { type: 'string' } },
                    atmosphere: { type: 'string' },
                    timeOfDay: { type: 'string' }
                },
                required: ['id', 'spatialDescription']
            },
            description: 'Environment/location definitions for spatial consistency across shots'
        },
        visualStyle: {
            type: 'object',
            properties: {
                contrastStyle: { type: 'string' },
                grainLevel: { type: 'string' },
                colorGradingNotes: { type: 'string' },
                blackLevel: { type: 'string' }
            },
            description: 'Global visual style lock for color grading consistency'
        },
        tempo: { type: 'string', enum: ['fast-cut', 'medium', 'slow-burn'], description: 'Overall pacing of the production' },
        shots: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    description: { type: 'string' },
                    subject: { type: 'string' },
                    environment: { type: 'string' },
                    camera: {
                        type: 'object',
                        properties: {
                            movement: { type: 'string' },
                            angle: { type: 'string' },
                            lens: { type: 'string' }
                        },
                        required: ['movement', 'angle']
                    },
                    lighting: {
                        type: 'object',
                        properties: {
                            style: { type: 'string' },
                            colorTemp: { type: 'string' },
                            contrast: { type: 'string' }
                        },
                        required: ['style']
                    },
                    duration: { type: 'string' },
                    narration: { type: 'string', description: 'The exact voiceover or dialogue text intended to play during this shot, if any. Leave empty if silent.' },
                    characterIds: { type: 'array', items: { type: 'string' }, description: 'IDs of characters appearing in this shot (references characters array)' },
                    environmentId: { type: 'string', description: 'ID of the environment for this shot (references environments array)' },
                    transition: {
                        type: 'object',
                        properties: {
                            type: { type: 'string', description: 'Transition type (e.g. fade, wipeLeft, slideRight, cut, dissolve)' },
                            duration: { type: 'number', description: 'Transition duration in seconds' }
                        },
                        description: 'Transition into this shot from the previous shot'
                    }
                },
                required: ['id', 'description', 'camera', 'lighting']
            }
        }
    },
    required: ['title', 'mood', 'colorPalette', 'aspectRatio', 'shots']
};
const SHOTSTACK_EFFECTS = [
    'zoomIn', 'zoomInSlow', 'zoomInFast',
    'zoomOut', 'zoomOutSlow', 'zoomOutFast',
    'slideLeft', 'slideLeftSlow', 'slideLeftFast',
    'slideRight', 'slideRightSlow', 'slideRightFast',
    'slideUp', 'slideUpSlow', 'slideUpFast',
    'slideDown', 'slideDownSlow', 'slideDownFast'
];
const SHOTSTACK_FILTERS = [
    'none', 'blur', 'boost', 'contrast', 'darken', 'greyscale', 'lighten', 'muted', 'negative'
];
const SHOTSTACK_TRANSITIONS = [
    'none', 'fade', 'fadeSlow', 'fadeFast',
    'reveal', 'revealSlow', 'revealFast',
    'wipeLeft', 'wipeLeftSlow', 'wipeLeftFast',
    'wipeRight', 'wipeRightSlow', 'wipeRightFast',
    'slideLeft', 'slideLeftSlow', 'slideLeftFast',
    'slideRight', 'slideRightSlow', 'slideRightFast',
    'slideUp', 'slideUpSlow', 'slideUpFast',
    'slideDown', 'slideDownSlow', 'slideDownFast',
    'carouselLeft', 'carouselLeftSlow', 'carouselLeftFast',
    'carouselRight', 'carouselRightSlow', 'carouselRightFast',
    'carouselUp', 'carouselUpSlow', 'carouselUpFast',
    'carouselDown', 'carouselDownSlow', 'carouselDownFast',
    'zoom'
];
const SHOTSTACK_RESOLUTIONS = ['preview', 'mobile', 'sd', 'hd', '1080', '4k'];
export { SHOTSTACK_EFFECTS, SHOTSTACK_FILTERS, SHOTSTACK_TRANSITIONS, SHOTSTACK_RESOLUTIONS };
export const SHOTSTACK_JSON_SCHEMA = {
    type: 'object',
    properties: {
        timeline: {
            type: 'object',
            properties: {
                tracks: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            clips: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        asset: {
                                            type: 'object',
                                            properties: {
                                                type: { type: 'string', enum: ['video', 'audio', 'image', 'title'] },
                                                src: { type: 'string' }
                                            },
                                            required: ['type', 'src']
                                        },
                                        start: { type: 'number' },
                                        length: { type: 'number' },
                                        effect: { type: 'string', enum: SHOTSTACK_EFFECTS },
                                        filter: { type: 'string', enum: SHOTSTACK_FILTERS },
                                        transition: {
                                            type: 'object',
                                            properties: {
                                                in: { type: 'string', enum: SHOTSTACK_TRANSITIONS },
                                                out: { type: 'string', enum: SHOTSTACK_TRANSITIONS }
                                            }
                                        }
                                    },
                                    required: ['asset', 'start', 'length']
                                }
                            }
                        },
                        required: ['clips']
                    }
                }
            },
            required: ['tracks']
        },
        output: {
            type: 'object',
            properties: {
                format: { type: 'string', enum: ['mp4', 'gif', 'mp3'] },
                resolution: { type: 'string', enum: SHOTSTACK_RESOLUTIONS }
            },
            required: ['format', 'resolution']
        }
    },
    required: ['timeline', 'output']
};
