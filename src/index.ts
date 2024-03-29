import buildApp from './app';

import { PORT, NODE_ENV, SWAGGER_ROUTE_PREFIX } from './utils/env.util';

(async () => {
    const fastify = await buildApp();

    fastify.listen({
        port: PORT,
        host: '0.0.0.0'
    }, async (err, address) => {
        fastify.log.info(`🛩️  NODE_ENV: ${NODE_ENV}`);
        fastify.log.info(`🚀 Fastify server running on ${address}${SWAGGER_ROUTE_PREFIX}`);

        if (err) {
            fastify.log.fatal(err);
            await fastify.prisma.$disconnect();
            process.exit(1);
        };
    });
})();