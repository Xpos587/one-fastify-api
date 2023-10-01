import { buildJsonSchemas } from 'fastify-zod';
import { z as zod } from 'zod';

const createApiKeySchema = zod.object({
    telegramId: zod.number({
        description: 'The telegram id of the user',
        invalid_type_error: 'Telegram id must be a string',
        required_error: 'Telegram id is required'
    })
});

const responseCreateApiKeySchema = zod.object({
    apiKey: zod.string(),
    object: zod.string(),
    createdAt: zod.number()
});

export type CreateApiKeyInput = zod.infer<typeof createApiKeySchema>;

export const userModels = {
    createApiKeySchema,
    responseCreateApiKeySchema
};

export const { schemas: apiKeySchemas, $ref } = buildJsonSchemas(userModels, { $id: 'apiKeySchema' });