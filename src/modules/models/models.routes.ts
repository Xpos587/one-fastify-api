import { FastifyInstance } from 'fastify';

import { modelListCompletionHandler } from './models.controller';
import { $ref } from './models.schema';

export async function modelsRoutes(
    fastify: FastifyInstance
) {
    // GET /api/v1/models
    fastify.get(
        '/',
        {
            // preHandler: fastify.authenticate,
            schema: {
                response: {
                    200: $ref('responseModelSchema')
                }
            }
        },
        modelListCompletionHandler
    );
};