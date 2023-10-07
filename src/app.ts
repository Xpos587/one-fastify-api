import Fastify, { type FastifyInstance } from 'fastify';

import { NODE_ENV, TRUST_PROXY, SSL_KEY, SSL_CERT } from './utils/env.util';

import errorHandler from './middlewares/error.middleware';

import plugins from './plugins';
import router from './router';

import { existsSync, readFileSync } from 'fs';

import path from 'node:path';

export default async function (): Promise<FastifyInstance> {
    /**
    * * SSL self-signed guide: https://youtu.be/r6gA1NCfvYA?si=zSbcx28RPsuo5pkG
    */
    const sslIsExist = existsSync(SSL_CERT) && existsSync(SSL_KEY);

    const fastify = Fastify({
        logger: {
            level: NODE_ENV.toLowerCase() !== 'production' ? 'info' : 'warn',
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
        bodyLimit: 5e6,
        maxParamLength: 0,
        connectionTimeout: 6e4,
        trustProxy: TRUST_PROXY == false ? false : TRUST_PROXY,
        ignoreTrailingSlash: true,
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
                key: readFileSync(SSL_KEY),
                cert: readFileSync(SSL_CERT),
            }
        })
    });

    // * Never try to install @fastify/env
    await fastify.register(plugins);

    await fastify.register(errorHandler);
        
    // await fastify.register(middie, { hook: 'preHandler' });
    await fastify.register(router);

    process
        .on('unhandledRejection', (reason, promise) => {
            fastify.log.fatal(reason, 'Unhandled Rejection at Promise', promise);
        })
        .on('uncaughtException', (err) => {
            fastify.log.fatal(err, 'Uncaught Exception thrown');
        });

    return fastify;
};