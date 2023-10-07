import { FastifyRequest, FastifyReply } from 'fastify';

export default async function (request: FastifyRequest, reply: FastifyReply) {
    const remoteAddress = request.ip;

    if (remoteAddress !== '127.0.0.1') {
        return reply.code(401)
            .send({
                error: {
                    message: 'You have not provided a valid API key. You need to specify your API key in the authorization header using Bearer auth (i.e. Authorization: Bearer YOUR_KEY), or as a password field (with an empty username) if you access the API from your browser and are prompted to enter a username and password. You can get the API key here https://discord.gg/7g57YAQRDF.',
                    type: 'invalid_request_error',
                    param: null,
                    code: 'invalid_api_key'
                }
            });
    };
};
