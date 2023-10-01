import { FastifyInstance } from 'fastify';

import { createApiKeyHandler } from './apikey.controller';
import { $ref } from './apikey.schema';

export async function apiKeyRoutes(
    fastify: FastifyInstance
) {
    // POST /api/v1/apikey/generate
    fastify.post(
        '/generate',
        {
            preHandler: fastify.localhostenticate,
            schema: {
                body: $ref('createApiKeySchema'),
                response: {
                    200: $ref('responseCreateApiKeySchema')
                }
            }
        },
        createApiKeyHandler
    );
};