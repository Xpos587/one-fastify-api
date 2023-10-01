import { buildApp, AppOptions } from './app';

import * as FileStreamRotator from 'file-stream-rotator';

import config from './config';
import router from './router';

import fastifyAutoload from '@fastify/autoload';

import path from 'path';

const options: AppOptions = {
    disableRequestLogging: true,
    bodyLimit: config.BODY_LIMIT ?? 15e6,
    maxParamLength: 5000,
    trustProxy: true,
    logger: {
        level: config.NODE_ENV !== 'production' ? 'info' : 'warn',
        // file: path.join(__dirname, '..', 'logs', 'server.log'),
        transport: {
            target: 'pino-pretty',
            options: {
                colorize: true,
                colorizeObjects: true,
                translateTime: true
            }
        },
        stream: FileStreamRotator.getStream({
            filename: path.join(__dirname, '..', 'logs', 'chibisafe-%DATE%'),
            extension: '.log',
            date_format: 'YYYY-MM-DD',
            frequency: 'daily',
            audit_file: path.join(__dirname, '..', 'logs', 'chibisafe-audit.json')
        })
    },
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
    }
};

const start = async () => {
    const app = await buildApp(options);

    await app.register(fastifyAutoload, {
        dir: path.join(__dirname, 'plugins')
    });

    app.register(router);

    app.listen({
        port: config.FASTIFY_PORT,
        host: config.FASTIFY_HOST,
    }, (err) => {
        if (err) {
            app.log.error(err);
            app.prisma.$disconnect();
            process.exit(1);
        };
        app.log.info(`🛩️  NODE_ENV: ${config.NODE_ENV}`);
        app.log.info(`🚀 Fastify server running on http://${config.FASTIFY_HOST}:${config.FASTIFY_PORT}/docs`);
    });
};

start();