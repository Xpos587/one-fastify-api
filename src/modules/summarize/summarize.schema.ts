import { buildJsonSchemas } from 'fastify-zod';
import { z as zod } from 'zod';

const createSummarizeSchema = zod.object({
    model: zod.string(),
    stream: zod.boolean(),
    url: zod.string().url()
});

const responseSummarizeSchema = zod.object({
    id: zod.string(),
    object: zod.string(),
    createdAt: zod.number(),
    model: zod.string(),
    choices: zod.array(zod.object({
        index: zod.number().default(0),
        message: zod.object({
            role: zod.string().optional(),
            content: zod.string().optional()
        }).optional(),
        delta: zod.object({
            role: zod.string().optional(),
            content: zod.string().optional()
        }).optional(),
        finish_reason: zod.string().nullable()
    }))
});

export type CreateSummarizeInput = zod.infer<typeof createSummarizeSchema>;

export const summarizeModels = {
    createSummarizeSchema,
    responseSummarizeSchema
};

export const { schemas: summarizeSchemas, $ref } = buildJsonSchemas(summarizeModels, { $id: 'summarizeSchema' });