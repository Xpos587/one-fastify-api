import { buildJsonSchemas } from 'fastify-zod';
import { z as zod } from 'zod';

const create_apikey_schema = zod.object({
    telegramId: zod.number({
        description: 'The telegram id of the user',
        invalid_type_error: 'Telegram id must be a string',
        required_error: 'Telegram id is required'
    })
});

const response_create_apikey_schema = zod.object({
    apiKey: zod.string(),
    object: zod.string(),
    createdAt: zod.number()
});

export type CreateApiKeyInput = zod.infer<typeof create_apikey_schema>;

export const userModels = {
    create_apikey_schema,
    response_create_apikey_schema
};

export const { schemas: apiKeySchemas, $ref } = buildJsonSchemas(userModels, { $id: 'apiKeySchema' });