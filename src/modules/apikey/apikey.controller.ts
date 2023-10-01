import { FastifyRequest, FastifyReply } from 'fastify';
import { CreateApiKeyInput } from './apikey.schema';
import { hashApiKey } from '../../utils/hash.util';
import { badRequest, BadRequestError } from '../../utils/badreq.util';


export async function createApiKeyHandler(
    request: FastifyRequest<{
        Body: CreateApiKeyInput
    }>,
    reply: FastifyReply
) {
    try {
        const { telegramId } = request.body;

        badRequest(reply, telegramId, 'You have not provided a telegramId.');

        const user = await request.server.prisma.user.findUnique({
            where: {
                telegramId
            }
        });

        badRequest(reply, !!user, `User with telegramId ${telegramId} doesn't exist.`);

        const existingApiKey = await request.server.prisma.apiKey.findFirst({
            where: {
                userId: user?.id
            }
        });

        if (existingApiKey) {
            // Если API ключ уже существует, обновляем его
            const { hash, salt } = hashApiKey(`${user?.id}-${user?.createdAt}-${user?.telegramId}`);

            const updatedApiKey = await request.server.prisma.apiKey.update({
                where: {
                    id: existingApiKey.id,
                },
                data: {
                    updateAt: new Date(Date.now()).toISOString(),
                    apiKeyHash: hash,
                    salt: salt
                },
            });

            return reply.code(200)
                .type('application/json')
                .send({
                    id: user?.id,
                    object: 'apikey.update',
                    apiKey: updatedApiKey.apiKeyHash,
                    createdAt: user?.createdAt,
                });
        } else {
            // Если API ключ не существует, создаем его
            const { hash, salt } = hashApiKey(`${user?.id}-${user?.createdAt}-${user?.telegramId}`);

            const apiKey = await request.server.prisma.apiKey.create({
                data: {
                    userId: String(user?.id),
                    createdAt: new Date(Date.now()).toISOString(),
                    apiKeyHash: hash,
                    salt: salt
                },
            });

            return reply.code(200)
                .type('application/json')
                .send({
                    id: user?.id,
                    object: 'apikey.create',
                    apiKey: apiKey.apiKeyHash,
                    createdAt: user?.createdAt,
                });
        };
    } catch (err) {
        if (err instanceof BadRequestError) {
            return reply.code(400).send({
                error: {
                    message: err.message,
                    type: 'invalid_request_error',
                    param: null,
                    code: null
                }
            });
        } else {
            reply.code(500).send({
                error: {
                    message: 'Internal Server Error',
                    type: 'internal_server_error',
                    param: null,
                    code: null
                }
            });
        };
    };
};
