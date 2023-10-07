import { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';

// import middlewares from './middlewares';

import userRoutes from './modules/user/user.routes';
import apikeyRoutes from './modules/apikey/apikey.routes';
import completionRoutes from './modules/completion/completion.routes';

export default async function (fastify: FastifyInstance) {
    // void fastify.use(middlewares);

    // Enable CORS with default configuration
    // Allow requests from all origins (any source can access the resources)
    await fastify.register(cors, {
        origin: true
    });

    // Define API routes with proper prefixes
    await fastify.register(userRoutes, { prefix: '/api/v1/user' });
    await fastify.register(apikeyRoutes, { prefix: '/api/v1/apikey' });
    await fastify.register(completionRoutes, { prefix: '/api/v1/chat/completions' });
};