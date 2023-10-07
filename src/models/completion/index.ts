import fastifyGlob from 'fast-glob';
import path from 'node:path';

import { completionModel } from './base.completion';

async function loadModels() {
    const modelFiles = await fastifyGlob(['*.completion.js'], {
        cwd: path.join(__dirname, './')
    });

    const models: Record<string, completionModel> = {};

    try {
        await Promise.all(
            modelFiles.map(async (file) => {
                const modelModule = await import(path.join(__dirname, './', file));
                
                if (modelModule.default) {
                    const modelId = modelModule.default.id;
                    models[modelId] = modelModule.default;
                };
            })
        );
    } catch (err) {
        console.error(err);
    };

    return models;
};

export default loadModels;