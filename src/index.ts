import { buildApp } from './app';

import config from './config';

const start = async () => {
    const fastify = await buildApp();

    fastify.listen({
        port: config.FASTIFY_PORT,
        host: config.FASTIFY_HOST,
    }, async (err, address) => {
        fastify.log.info(`🛩️  NODE_ENV: ${config.NODE_ENV}`);
        fastify.log.info(`🚀 Fastify server running on ${address}/docs`);
        if (err) {
            fastify.log.fatal(err);
            await fastify.prisma.$disconnect();
            process.exit(1);
        };
    });
};

start();