import { PrismaClient } from '@prisma/client';

import fp from 'fastify-plugin';

async function initDatabaseConnection(): Promise<PrismaClient> {
    const db = new PrismaClient();
    await db.$connect();
    return db;
};

// Use TypeScript module augmentation to declare the type of server.prisma to be PrismaClient
declare module 'fastify' {
    interface FastifyInstance {
        prisma: PrismaClient
    }
};

export default fp(async (fastify) => {
    const prisma = await initDatabaseConnection();
    fastify.log.info('📅 Connected to database.');

    // Make Prisma Client available through the fastify server instance: server.prisma
    fastify.decorate('prisma', prisma);
    fastify.addHook('onClose', async () => {
        await fastify.prisma.$disconnect();
    });
});
