import { FastifyInstance } from 'fastify';

import { createUserHandler, getUserByIdHandler } from './user.controller';
import { $ref } from './user.schema';

export default async function (
    fastify: FastifyInstance
) {
    // POST /api/v1/user/create
    fastify.post(
        '/create',
        {
            preHandler: fastify.localhostenticate,
            schema: {
                body: $ref('create_user_schema'),
                response: {
                    200: $ref('response_create_user_schema')
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
                    200: $ref('response_get_user_schema')
                }
            }
        },
        getUserByIdHandler
    );
};