import { localhostenticate } from '../middlewares/local.middleware';

import fp from 'fastify-plugin';

declare module 'fastify' {
    export interface FastifyInstance {
        localhostenticate: any;
    }
};

export default fp(async (fastify) => {
    fastify.decorate(
        'localhostenticate',
        localhostenticate
    )
});