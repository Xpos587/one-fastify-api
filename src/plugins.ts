import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import {
    TWO_CAPTCHA_APIKEY,
    RATE_LIMIT_MAX,
    RATE_LIMIT_TIME_WINDOW,
    SWAGGER_ROUTE_PREFIX,
    SWAGGER_TITLE,
    SWAGGER_VERSION
} from './utils/env.util';

import { buildJsonSchemas, register } from 'fastify-zod';

import { PrismaClient } from '@prisma/client';
import * as Captcha from '2captcha';

import authenticate from './middlewares/auth.middleware';
import localhostenticate from './middlewares/local.middleware';

import glob from 'fast-glob';
import compress from '@fastify/compress';
import limiter from '@fastify/rate-limit';

import fp from 'fastify-plugin';

import path from 'node:path';

declare module 'fastify' {
    export interface FastifyInstance {
        authenticate: any;
        localhostenticate: any;
        solver: Captcha.Solver;
        prisma: PrismaClient;
    }
};

export default fp(async (fastify: FastifyInstance) => {
    fastify.decorate('authenticate', authenticate);
    fastify.decorate('solver', new Captcha.Solver(TWO_CAPTCHA_APIKEY));
    fastify.decorate('localhostenticate', localhostenticate);

    void fastify.register(compress, { global: true });

    await initZod(fastify, './modules');
    void initHealthcheck(fastify);
    void initRatelimit(fastify);

    const prisma = await initPrisma(fastify);
    fastify.decorate('prisma', prisma);
});

async function initDatabaseConnection(): Promise<PrismaClient> {
    const db = new PrismaClient();
    await db.$connect();
    return db;
};

async function initPrisma(fastify: FastifyInstance): Promise<PrismaClient> {
    const prisma = await initDatabaseConnection();
    fastify.log.info('📅 Connected to database.');

    fastify.addHook('onClose', async () => {
        void fastify.prisma.$disconnect();
    });

    return prisma;
};

async function initRatelimit(fastify: FastifyInstance): Promise<void> {
    void fastify.register(limiter, {
        global: true,
        max: RATE_LIMIT_MAX,
        timeWindow: RATE_LIMIT_TIME_WINDOW,
        hook: 'onRequest',
        errorResponseBuilder(req, res) {
            return {
                message: 'Rate limit exceeded, retry in 1 minute.',
                type: 'too_many_requests_error',
                param: (req.params as any)['*'] || null,
                code: null
            };
        }
    });
};

async function initHealthcheck(fastify: FastifyInstance): Promise<void> {
    void fastify.get('/api/v1/healthcheck', async (
        request: FastifyRequest,
        reply: FastifyReply
    ) => {
        const usedMemory = process.memoryUsage().rss / (1024 * 1024); // RAM usage in MB
        const cpuUsage = process.cpuUsage().system / (1024 * 1024); // CPU usage in percent

        const uptime = process.uptime(); // Server uptime in seconds

        return reply
            .code(200)
            .type('application/json')
            .send({
                status: 'ok',
                memoryUsage: `${usedMemory.toFixed(2)} MB`,
                cpuUsage: `${cpuUsage.toFixed(2)} seconds`,
                uptime: `${uptime.toFixed(2)} seconds`
            });
    });
};

async function initZod(fastify: FastifyInstance, dir: string): Promise<void> {
    dir = path.join(__dirname, dir);

    const schemaFiles = await glob(['**/*.schema.js'], {
        cwd: dir
    });

    const schemaModules = await Promise.all(
        schemaFiles.map(async (file) => import(path.join(dir, file)))
    );

    await Promise.all(
        schemaFiles.map(async (file) => {
            const schemaModule = await import(path.join(dir, file));

            const schemaKeys = Object.keys(schemaModule);
            const schemaVariables = schemaKeys.filter((key) => key.endsWith('Schemas'));

            schemaVariables.forEach((schemasName) => {
                const schemas = schemaModule[schemasName];
                if (Array.isArray(schemas)) {
                    schemas.forEach((schema) => {
                        fastify.addSchema(schema);
                    });
                };
            });
        })
    );

    const models = schemaModules.reduce((acc, schemaModule) => {
        return { ...acc, ...schemaModule };
    }, {});

    await register(fastify, {
        jsonSchemas: buildJsonSchemas(models),
        swaggerOptions: {
            swagger: {
                info: {
                    title: SWAGGER_TITLE,
                    version: SWAGGER_VERSION
                },
                basePath: '/api/v1',
                securityDefinitions: {
                    bearerAuth: {
                        type: 'apiKey',
                        name: 'Authorization',
                        in: 'header'
                    }
                },
                security: [{ bearerAuth: [] }]
            }
        },
        swaggerUiOptions: {
            routePrefix: SWAGGER_ROUTE_PREFIX,
            uiConfig: {
                docExpansion: 'full',
                deepLinking: false
            },
            uiHooks: {
                onRequest: (request, reply, next) => next(),
                preHandler: (request, reply, next) => next()
            },
            staticCSP: true,
            transformStaticCSP: (header) => header,
            transformSpecification: (swaggerObject, request, reply) => swaggerObject,
            transformSpecificationClone: true
        },
    });
};