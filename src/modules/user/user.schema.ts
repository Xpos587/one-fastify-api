import { buildJsonSchemas } from 'fastify-zod';
import { z as zod } from 'zod';

const createUserSchema = zod.object({
    telegramId: zod.number({
        description: 'The telegram id of the user',
        invalid_type_error: 'Telegram id must be a string',
        required_error: 'Telegram id is required'
    })
});

const responseCreateUserSchema = zod.object({
    id: zod.string(),
    object: zod.string(),
    createdAt: zod.number()
});

const responseGetUserSchema = zod.object({
    id: zod.string(),
    object: zod.string(),
    createdAt: zod.number(),
    telegramId: zod.number()
});

export type CreateUserInput = zod.infer<typeof createUserSchema>;

export const userModels = {
    createUserSchema,
    responseCreateUserSchema,
    responseGetUserSchema
};

export const { schemas: userSchemas, $ref } = buildJsonSchemas(userModels, { $id: 'userSchema' });