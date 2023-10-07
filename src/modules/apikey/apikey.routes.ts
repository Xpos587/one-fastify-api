import { FastifyInstance } from 'fastify';

import { createApiKeyHandler } from './apikey.controller';
import { $ref } from './apikey.schema';

export default async function (
    fastify: FastifyInstance
) {
    // POST /api/v1/apikey/generate
    fastify.post(
        '/generate',
        {
            preHandler: fastify.localhostenticate,
            schema: {
                body: $ref('create_apikey_schema'),
                response: {
                    200: $ref('response_create_apikey_schema')
                }
            }
        },
        createApiKeyHandler
    );
};