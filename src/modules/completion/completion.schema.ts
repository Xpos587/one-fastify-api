import { buildJsonSchemas } from 'fastify-zod';
import { z as zod } from 'zod';

const create_completion_schema = zod.object({
    model: zod.string(),
    messages: zod.array(zod.object({
        role: zod.enum(['user', 'assistant', 'system', 'function']),
        content: zod.string(),
    })),
    temperature: zod.number(),
    top_p: zod.number(),
    n: zod.number(),
    stream: zod.boolean(),
    max_tokens: zod.number(),
    presence_penalty: zod.number(),
    frequency_penalty: zod.number()
});

const response_completion_schema = zod.object({
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
    })),
    usage: zod.object({
        prompt_tokens: zod.number().nullable(),
        completion_tokens: zod.number().nullable(),
        total_tokens: zod.number().nullable(),
    }).optional(),
});

const response_models_completion_schema = zod.object({
    object: zod.string(),
    data: zod.array(zod.object({
        id: zod.string(),
        object: zod.string(),
        createdAt: zod.number(),
        owned_by: zod.string(),
        // status: zod.enum(['working', 'maintenance'])
    }))
});

export type CreateCompletionInput = zod.infer<typeof create_completion_schema>;

export const completionModels = {
    create_completion_schema,
    response_completion_schema,
    response_models_completion_schema
};

export const { schemas: completionSchemas, $ref } = buildJsonSchemas(completionModels, { $id: 'completionSchema' });