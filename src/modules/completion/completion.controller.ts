import { FastifyRequest, FastifyReply } from 'fastify';
import { CreateCompletionInput } from './completion.schema';

import { getMessagesTokenCount } from '../../utils/tokenizer.util';
import { badRequest, BadRequestError } from '../../utils/badreq.util';

import { completionModels } from '../../models/completion.models';

import { v4 } from 'uuid';
import md5 from 'md5';

export async function createCompletionHandler(
    request: FastifyRequest<{
        Body: CreateCompletionInput
    }>,
    reply: FastifyReply
) {
    await new Promise(async () => {
        try {
            const {
                model, messages, temperature,
                top_p, n, max_tokens,
                presence_penalty, frequency_penalty
            } = request.body;

            async function delay(ms: number): Promise<boolean> {
                return new Promise(resolve => {
                    setTimeout(() => resolve(true), ms);
                });
            };

            const selectedModel = completionModels[model];
            badRequest(reply, !!selectedModel, `Model \'${model}\' doesn't exist.`);

            const hashApiKey = String(request.headers['authorization']).split(' ')[1];


            const apiKey = await request.server.prisma.apiKey.findFirst({
                where: {
                    apiKeyHash: hashApiKey
                }
            });

            const user = await request.server.prisma.user.findUnique({
                where: {
                    id: apiKey?.userId,
                }
            });

            const today: Date = new Date();
            const year: number = today.getFullYear();
            const month: number = today.getMonth() + 1; // добавляем 1, так как месяцы начинаются с 0
            const day: number = today.getDate();

            // Форматируем месяц и день, чтобы добавить ведущий ноль, если число меньше 10
            const formattedMonth: string = month < 10 ? `0${month}` : `${month}`;
            const formattedDay: string = day < 10 ? `0${day}` : `${day}`;

            const formattedDate: string = `${year}-${formattedMonth}-${formattedDay}`;

            if ((((user?.dailyRequestCounts as any)[model][formattedDate] || 0) >= selectedModel.limits.perDay) || (((user?.minuteRequestCounts as any)[model][formattedDate] || 0) >= selectedModel.limits.perMinute)) {
                return reply
                    .code(429)
                    .type('application/json')
                    .send({
                        error: {
                            message: 'Internal provider error occurred during request handling.',
                            type: 'internal_server_error',
                            param: null,
                            code: null
                        }
                    })
            };

            const providers = selectedModel.providers;

            const cmplId = 'chatcmpl-' + md5(v4());
            let answer = '';

            let foundWorkingProvider = false;

            while (!foundWorkingProvider && providers.length > 0) {
                try {
                    const provider = new providers[0].provider;

                    request.log.info('Creating completion for \'%s\' by \'%s\'', model, providers[0].provider.name);

                    if (!provider.working)
                        throw new Error(providers[0].provider.name + ' is not working.').message;

                    const id = providers[0].id;
                    const prompt = providers[0].messages;

                    const completionStream = provider.create_completion(
                        request.server,
                        id || model,
                        prompt ? [...prompt, ...messages] : messages,
                        {
                            temperature,
                            top_p,
                            n,
                            max_tokens,
                            presence_penalty,
                            frequency_penalty
                        }
                    );

                    const promiseCompletionStream = new Promise(async (resolve) => {
                        try {
                            for await (let completion of completionStream) {
                                resolve(false);
                                if (request.body.stream) {
                                    reply.raw.writeHead(200, { 'Content-Type': 'text/event-stream' });
                                };

                                if (request.body.stream) {
                                    reply.raw.write(`data: ${JSON.stringify({
                                        id: cmplId,
                                        object: 'chat.completion.chunk',
                                        model,
                                        createdAt: Date.now(),
                                        choices: [
                                            {
                                                index: 0,
                                                delta: {
                                                    role: 'assistant',
                                                    content: completion?.content
                                                },
                                                finish_reason: null
                                            }
                                        ]
                                    })}\n\n`);
                                };
                                if (completion.isFinal) {
                                    const prompt_tokens = completion.tokens?.prompt || getMessagesTokenCount(messages);
                                    const completion_tokens = completion.tokens?.completion || getMessagesTokenCount([{ role: 'assistant', content: answer }]);
                                    const total_tokens = completion.tokens?.total || prompt_tokens + completion_tokens;

                                    if (request.body.stream) {
                                        reply.raw.write(`data: ${JSON.stringify({
                                            id: cmplId,
                                            object: 'chat.completion.chunk',
                                            model,
                                            createdAt: Date.now(),
                                            choices: [{
                                                index: 0,
                                                delta: {},
                                                finish_reason: completion.finish_reason
                                            }],
                                            usage: {
                                                prompt_tokens,
                                                completion_tokens,
                                                total_tokens
                                            }
                                        })}\n\n`)
                                        return reply.raw.end('data: [DONE]\n\n');
                                    } else {
                                        return reply
                                            .code(200)
                                            .type('application/json')
                                            .send({
                                                id: cmplId,
                                                object: 'chat.completion',
                                                createdAt: Date.now(),
                                                model,
                                                choices: [{
                                                    index: 0,
                                                    message: {
                                                        role: 'assistant',
                                                        content: answer
                                                    },
                                                    finish_reason: completion.finish_reason
                                                }],
                                                usage: {
                                                    prompt_tokens,
                                                    completion_tokens,
                                                    total_tokens
                                                }
                                            });
                                    };
                                };
                                answer += completion.content;
                            };
                        } catch (err) {
                            request.log.error((err as any).message);
                            resolve(true);
                        }
                    });
                    const timeout = await Promise.race([promiseCompletionStream, delay(providers[0].timeout || 5500)]);

                    if (timeout) throw new Error(providers[0].provider.name + ', timeout.').message;
                    else foundWorkingProvider = true;
                } catch (err) {
                    request.log.error(err);
                    providers.shift();
                };
            };
            if (!foundWorkingProvider) {
                return reply
                    .code(500)
                    .type('application/json')
                    .send({
                        error: {
                            message: 'Internal provider error occurred during request handling.',
                            type: 'internal_server_error',
                            param: null,
                            code: null
                        }
                    });
            } else {
                await request.server.prisma.user.update({
                    where: {
                        id: apiKey?.userId
                    },
                    data: {
                        requestCounts: {
                            model: ((user?.requestCounts as any)[model][formattedDate] || 0) + 1
                        },
                        dailyRequestCounts: {
                            model: ((user?.requestCounts as any)[model][formattedDate] || 0) + 1
                        },
                        minuteRequestCounts: {
                            model: ((user?.requestCounts as any)[model][formattedDate] || 0) + 1
                        }
                    }
                });
            };
        } catch (err) {
            if (err instanceof BadRequestError) {
                return reply
                    .code(400)
                    .type('application/json')
                    .send({
                        error: {
                            message: err.message,
                            type: 'invalid_request_error',
                            param: null,
                            code: null
                        }
                    });
            } else {
                return reply
                    .code(500)
                    .type('application/json')
                    .send({
                        error: {
                            message: 'Internal error occurred during request handling.',
                            type: 'internal_server_error',
                            param: null,
                            code: null
                        }
                    });
            };
        };
    });
};