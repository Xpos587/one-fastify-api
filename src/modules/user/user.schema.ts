import { buildJsonSchemas } from 'fastify-zod';
import { z as zod } from 'zod';

const create_user_schema = zod.object({
    telegramId: zod.number({
        description: 'The telegram id of the user',
        invalid_type_error: 'Telegram id must be a string',
        required_error: 'Telegram id is required'
    })
});

const response_create_user_schema = zod.object({
    id: zod.string(),
    object: zod.string(),
    createdAt: zod.number()
});

const response_get_user_schema = zod.object({
    id: zod.string(),
    object: zod.string(),
    createdAt: zod.number(),
    telegramId: zod.number()
});

export type CreateUserInput = zod.infer<typeof create_user_schema>;

export const userModels = {
    create_user_schema,
    response_create_user_schema,
    response_get_user_schema
};

export const { schemas: userSchemas, $ref } = buildJsonSchemas(userModels, { $id: 'userSchema' });