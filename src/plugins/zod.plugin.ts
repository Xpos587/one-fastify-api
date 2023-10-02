import { buildJsonSchemas, register } from 'fastify-zod';

import fastifyGlob from 'fast-glob';
import path from 'path';

import fp from 'fastify-plugin';

export default fp(async (fastify) => {
    const schemaFiles = await fastifyGlob(['**/*.schema.js'], {
        cwd: path.join(__dirname, '../modules')
    });

    const schemaModules = await Promise.all(
        schemaFiles.map(async (file) => import(path.join(__dirname, '../modules', file)))
    );

    await Promise.all(
        schemaFiles.map(async (file) => {
            const schemaModule = await import(path.join(__dirname, '../modules', file));

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
                    title: 'OneAPI AI',
                    version: 'v1'
                },
                basePath: '/api/v1',
                securityDefinitions: {
                    bearerAuth: {
                        type: 'apiKey',
                        in: 'header',
                        name: 'Authorization'
                    }
                },
                security: [{ bearerAuth: [] }]
            }
        },
        swaggerUiOptions: {
            routePrefix: '/docs',
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
});
