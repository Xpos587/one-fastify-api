import { errorHandler } from '../middlewares/error.middleware';

import fp from 'fastify-plugin';

export default fp(async (fastify) => {
    // fastify.setSchemaErrorFormatter(function (errors, dataVar) {
    //     fastify.log.error({ err: errors }, 'Validation failed')

    //     return new Error('Validation failed')
    // });

    fastify.register(errorHandler);
});