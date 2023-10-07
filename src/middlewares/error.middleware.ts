import { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';

export default async function (
    fastify: FastifyInstance
) {
    fastify.setNotFoundHandler({
        // preHandler: fastify.rateLimit({
        //     max: 4,
        //     timeWindow: 500
        // })
    }, (request: FastifyRequest, reply: FastifyReply) => {
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

        let code: any = error.code || null;
        let statusCode: number = error.statusCode || 500;
        let message: string = error.message;
        let type: string = 'invalid_request_error';

        if (code == 'FST_ERR_VALIDATION') code = null;
        if (statusCode == 500 || code == 'P2032') {
            message = 'Internal server error occurred during request handling.';
            code = null;
        };
        if (statusCode == 429) {
            message = 'Rate limit exceeded, retry in 1 minute.';
            type = 'too_many_requests_error';
            code = null;
        };

        return reply
            .code(statusCode)
            .type('application/json')
            .send({
                error: {
                    message,
                    type,
                    param: (request.params as any)['*'] || null,
                    code
                }
            });
    });
};
