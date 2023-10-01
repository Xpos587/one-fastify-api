import { authenticate } from '../middlewares/auth.middleware';

import fp from 'fastify-plugin';

declare module 'fastify' {
    export interface FastifyInstance {
        authenticate: any;
    }
};

export default fp(async (fastify) => {
    fastify.decorate(
        'authenticate',
        authenticate
    );
});