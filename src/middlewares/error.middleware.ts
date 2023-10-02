import { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';

export async function errorHandler(
    fastify: FastifyInstance
) {
    fastify.setNotFoundHandler((request: FastifyRequest, reply: FastifyReply) => {
        return reply
            .code(404)
            .type('application/json')
            .send({
                error: {
                    message: 'Not found',
                    type: 'invalid_request_error',
                    param: (request.params as any)['*'] || null,
                    code: null
                }
            });
    });

    fastify.setErrorHandler((
        error,
        request: FastifyRequest,
        reply: FastifyReply
    ) => {
        fastify.log.error(error);

        let code: any = error.code;
        let statusCode: number = error.statusCode || 500;
        let message: string = error.message;

        if (code == 'FST_ERR_VALIDATION') code = null;
        if (statusCode == 500 || code == 'P2032') {
            message = 'Internal server error';
            code = null;
        };

        return reply
            .code(statusCode)
            .type('application/json')
            .send({
                error: {
                    message,
                    type: 'invalid_request_error',
                    param: (request.params as any)['*'] || null,
                    code: code || null
                }
            });
    });
};
