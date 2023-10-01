import { FastifyInstance } from 'fastify';

import { createCompletionHandler } from './completion.controller';
import { $ref } from './completion.schema';

export async function completionRoutes(
    fastify: FastifyInstance
) {
    // POST /api/v1/chat/completions
    fastify.post(
        '/',
        {
            preHandler: fastify.authenticate,
            schema: {
                body: $ref('createCompletionSchema'),
                response: {
                    200: $ref('responseCompletionSchema'),
                }
            }
        },
        createCompletionHandler
    );
};