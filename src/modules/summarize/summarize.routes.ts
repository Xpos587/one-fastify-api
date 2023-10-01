import { FastifyInstance } from 'fastify';

import { createSummarizeHandler } from './summarize.controller';
import { $ref } from './summarize.schema';

export async function summarizeRoutes(
    fastify: FastifyInstance
) {
    // POST /api/v1/chat/summarize
    fastify.post(
        '/',
        {
            preHandler: fastify.authenticate,
            schema: {
                body: $ref('createSummarizeSchema'),
                response: {
                    200: $ref('responseSummarizeSchema')
                }
            }
        },
        createSummarizeHandler
    );
};