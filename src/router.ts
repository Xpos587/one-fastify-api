import { FastifyInstance } from 'fastify';
import cors from '@fastify/cors'

import { completionRoutes } from './modules/completion/completion.routes';
import { summarizeRoutes } from './modules/summarize/summarize.routes';
import { userRoutes } from './modules/user/user.routes';
import { apiKeyRoutes } from './modules/apikey/apikey.routes';
import { modelsRoutes } from './modules/models/models.routes';

export default async function router(fastify: FastifyInstance) {
    fastify.register(cors, {
        origin: false
    });

    fastify.register(userRoutes, { prefix: '/api/v1/user' });
    fastify.register(apiKeyRoutes, { prefix: '/api/v1/apikey' });
    fastify.register(completionRoutes, { prefix: '/api/v1/chat/completions' });
    // fastify.register(summarizeRoutes, { prefix: '/api/v1/chat/summarize' });
    fastify.register(modelsRoutes, { prefix: '/api/v1/models' });
};