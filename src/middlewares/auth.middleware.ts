import { FastifyRequest, FastifyReply } from 'fastify';
import { verifyApiKey } from '../utils/hash.util';

export default async function (request: FastifyRequest, reply: FastifyReply) {
    // Extract the API key hash from the Authorization header
    const authorizationHeader = request.headers['authorization'] || '';
    const hashApiKey = authorizationHeader.split(' ')[1];

    if (!hashApiKey) {
        return reply
            .code(401)
            .type('application/json')
            .send({
                error: {
                    message: 'You didn\'t provide an API key. Please provide your API key in the Authorization header using Bearer auth (i.e., Authorization: Bearer YOUR_KEY) or as the password field (with blank username) if prompted for credentials in your browser. You can obtain an API key from https://platform.openai.com/account/api-keys.',
                    type: 'invalid_request_error',
                    param: null,
                    code: null
                }
            });
    }

    const apiKey = await request.server.prisma.apiKey.findFirst({
        where: {
            apiKeyHash: hashApiKey
        }
    });

    if (!apiKey) {
        return reply
            .code(401)
            .type('application/json')
            .send({
                error: {
                    message: `Incorrect API key provided: ${hashApiKey}. You can find your API key at https://platform.openai.com/account/api-keys.`,
                    type: 'invalid_request_error',
                    param: null,
                    code: 'invalid_api_key'
                }
            });
    }

    const user = await request.server.prisma.user.findFirst({
        where: {
            id: apiKey?.userId
        }
    });

    const isApiKeyValid = verifyApiKey({
        candidateApiKey: `${user?.id}-${user?.createdAt}-${user?.telegramId}`,
        salt: String(apiKey?.salt),
        hash: hashApiKey
    });

    if (!isApiKeyValid) {
        return reply
            .code(401)
            .type('application/json')
            .send({
                error: {
                    message: 'Invalid API key provided.',
                    type: 'invalid_request_error',
                    param: null,
                    code: 'invalid_api_key'
                }
            });
    };

    request.log.debug('API key is valid.');
};
