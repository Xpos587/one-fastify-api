import { buildJsonSchemas } from 'fastify-zod';
import { z as zod } from 'zod';

const responseModelSchema = zod.object({
    object: zod.string(),
    data: zod.array(zod.object({
        id: zod.string(),
        object: zod.string(),
        createdAt: zod.number(),
        owned_by: zod.string(),
        // status: zod.enum(['working', 'maintenance'])
    }))
});

export const modelModels = {
    responseModelSchema
};

export const { schemas: modelSchemas, $ref } = buildJsonSchemas(modelModels, { $id: 'modelSchema' });