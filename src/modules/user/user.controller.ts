import { FastifyRequest, FastifyReply } from 'fastify';
import { CreateUserInput } from './user.schema';

import { badRequest, BadRequestError } from '../../utils/badreq.util';

export async function createUserHandler(
    request: FastifyRequest<{
        Body: CreateUserInput
    }>,
    reply: FastifyReply
) {
    await new Promise(async () => {
        try {
            const { telegramId } = request.body;

            badRequest(reply, telegramId, 'You have not provided a telegramId.');

            async function doesUserExist(telegramId: number) {
                const user = await request.server.prisma.user.findUnique({
                    where: {
                        telegramId: telegramId,
                    },
                });

                return !!user;
            };

            const isUserExist = await doesUserExist(telegramId);

            badRequest(reply, !isUserExist, `User with telegramId ${telegramId} already exist.`);

            const user = await request.server.prisma.user.create({
                data: {
                    telegramId,
                    createdAt: new Date(Date.now()).toISOString(),
                }
            });

            return reply.code(200)
                .type('application/json')
                .send({
                    id: user.id,
                    object: 'user.create',
                    createdAt: user.createdAt
                });
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
    });
};

export async function getUserByIdHandler(
    request: FastifyRequest<{
        Params: {
            telegramId: number
        }
    }>,
    reply: FastifyReply
) {
    await new Promise(async () => {
        try {

            const { telegramId } = request.params;

            async function getUserById(telegramId: number) {
                return await request.server.prisma.user.findUnique({
                    where: {
                        telegramId: Number(telegramId),
                    },
                });
            };

            const user = await getUserById(telegramId);

            badRequest(reply, user, `User with telegramId ${telegramId} doesn\'t exist.`);
            return reply.code(200)
                .type('application/json')
                .send({
                    id: user?.id,
                    object: 'user.information',
                    createdAt: user?.createdAt,
                    balance: user?.balance,
                    telegramId: user?.telegramId
                });
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
    });
};