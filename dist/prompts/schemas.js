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
                    narration: { type: 'string', description: 'The exact voiceover or dialogue text intended to play during this shot, if any. Leave empty if silent.' }
                },
                required: ['id', 'description', 'camera', 'lighting']
            }
        }
    },
    required: ['title', 'mood', 'colorPalette', 'aspectRatio', 'shots']
};
