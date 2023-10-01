import { FastifyInstance } from 'fastify';

import { createUserHandler, getUserByIdHandler } from './user.controller';
import { $ref } from './user.schema';

export async function userRoutes(
    fastify: FastifyInstance
) {
    // POST /api/v1/user/create
    fastify.post(
        '/create',
        {
            preHandler: fastify.localhostenticate,
            schema: {
                body: $ref('createUserSchema'),
                response: {
                    200: $ref('responseCreateUserSchema')
                }
            }
        },
        createUserHandler
    );

    // GET /api/v1/user/:telegramId
    fastify.get(
        '/:telegramId',
        {
            preHandler: fastify.localhostenticate,
            schema: {
                response: {
                    200: $ref('responseGetUserSchema'),
                    // 401: $ref('errorUserSchema')
                }
            }
        },
        getUserByIdHandler
    );
};