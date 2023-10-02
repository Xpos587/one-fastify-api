import Fastify, { type FastifyInstance } from 'fastify';
// import * as Sentry from '@sentry/node';

import fastifyAutoload from '@fastify/autoload';

import config from './config';
import router from './router';

import { existsSync, readFileSync } from 'fs';

import path from 'path';

async function buildApp(): Promise<FastifyInstance> {
    /**
    * * SSL self-signed guide: https://youtu.be/r6gA1NCfvYA?si=zSbcx28RPsuo5pkG
    */
    const key = 'certs/server.key';
    const cert = 'certs/server.crt';

    const sslIsExist = existsSync(cert) && existsSync(key);

    const fastify = Fastify({
        logger: {
            level: config.NODE_ENV.toLowerCase() !== 'production' ? 'info' : 'warn',
            file: path.join(__dirname, '..', 'logs', `server.log`),
            redact: ['req.headers.authorization'],
            transport: {
                target: 'pino-pretty',
                options: {
                    colorize: true,
                    colorizeObjects: true,
                    translateTime: 'dd.mm.yyyy HH:MM:s'
                }
            },
            serializers: {
                res: (res) => ({
                    statusCode: res.statusCode
                }),
                req: (req) => ({
                    method: req.method,
                    url: req.url,
                    parameters: req.params,
                    headers: req.headers,
                    hostname: req.hostname,
                    remoteAddress: req.ip,
                    remotePort: req.connection.remotePort
                })
            }
        },
        disableRequestLogging: true,
        bodyLimit: config.BODY_LIMIT ?? 15e6,
        maxParamLength: 500,
        trustProxy: true,
        ajv: {
            customOptions: {
                removeAdditional: false,
                useDefaults: true,
                coerceTypes: true,
                allErrors: true,
                strictTypes: true,
                strictRequired: true,
            },
            plugins: [],
        },
        ...(sslIsExist && {
            https: {
                key: readFileSync(key),
                cert: readFileSync(cert),
            }
        })
    });

    await fastify.register(fastifyAutoload, {
        dir: path.join(__dirname, 'plugins')
    });

    fastify.register(router);

    fastify.addHook('onClose', async () => {
        await fastify.prisma.$disconnect();
    });

    process
        .on('unhandledRejection', (reason, promise) => {
            // Sentry.captureException(reason);
            fastify.log.error(reason, 'Unhandled Rejection at Promise', promise);
        })
        .on('uncaughtException', (err) => {
            // Sentry.captureException(err);
            fastify.log.error(err, 'Uncaught Exception thrown');
        })

    return fastify;
};

export { buildApp };