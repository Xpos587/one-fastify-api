import { FastifyInstance } from 'fastify';

import * as ctrl from './completion.controller';
import { $ref } from './completion.schema';

export default async function (
    fastify: FastifyInstance
) {
    // POST /api/v1/chat/completions
    fastify.post(
        '/',
        {
            preHandler: fastify.authenticate,
            schema: {
                body: $ref('create_completion_schema'),
                response: {
                    200: $ref('response_completion_schema'),
                }
            }
        },
        ctrl.createCompletionHandler
    );

    // GET /api/v1/chat/completions/models
    fastify.get(
        '/models',
        {
            preHandler: fastify.authenticate,
            schema: {
                response: {
                    200: $ref('response_models_completion_schema'),
                }
            }
        },
        ctrl.modelsCompletionHandler
    );
};