import { FastifyRequest, FastifyReply } from 'fastify';
import { CreateCompletionInput } from './completion.schema';

import { getMessagesTokenCount } from '../../utils/tokenizer.util';
import { badRequest, BadRequestError } from '../../utils/badreq.util';

import { delay } from '../../utils/promise.util';

import loadCompletionModels from '../../models/completion';

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

            const models = await loadCompletionModels();

            const selectedModel = models[model];
            badRequest(reply, !!selectedModel, `Model \'${model}\' doesn't exist.`);

            const providers = selectedModel.providers;

            const cmplId = 'chatcmpl-' + md5(v4());

            let foundWorkingProvider = false;

            while (!foundWorkingProvider && providers.length > 0) {
                try {
                    let answer = '';

                    // TODO Разобраться из-за чего возникает "undefined Connection error."
                    const provider = new providers[0].provider;

                    request.server.log.debug(provider);

                    request.server.log.info('Creating completion for \'%s\' by \'%s\'', model, providers[0].provider.name);

                    if (!provider.working) {
                        request.server.log.warn(providers[0].provider.name + ' is not working.');
                        providers.shift();
                        continue;
                    };

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
                            /**
                             * ! WARNING
                             * Проблема связанная с Timeout
                             * Если Timeout сработал, то код провайдера
                             * продолжает работать и из-за этого
                             * может начаться completionStream, даже, если
                             * сработал timeout, а затем это может вызвать ошибку
                             * StatusCode 500: reply was alredy sent из-за
                             * того, что другой провайдер пытается отправить ответ или
                             * провайдеры закончились и пытается отправиться сообщение
                             * 500 Internal Provider Error.
                            */
                            for await (let completion of completionStream) {
                                if (completion) resolve(false);
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
                            request.server.log.warn((err as any).message);
                            resolve(true);
                        };
                    });
                    const timeout = await Promise.race([promiseCompletionStream, delay(providers[0].timeout)]);

                    if (timeout) {
                        request.server.log.warn(providers[0].provider.name + ', timeout.');
                        providers.shift();
                        continue;
                    } else foundWorkingProvider = true;
                } catch (err) {
                    request.server.log.warn(err);
                    providers.shift();
                    continue;
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
                        message: 'Internal server error occurred during request handling.',
                        type: 'internal_server_error',
                        param: null,
                        code: null
                    }
                });
            };
        };
    });
};

export async function modelsCompletionHandler(
    request: FastifyRequest,
    reply: FastifyReply
) {
    await new Promise(async () => {
        const completionModels = await loadCompletionModels();

        const data = Object.entries(completionModels)
            .filter(([id, model]) => !model.hide)
            .map(([id, model]) => ({
                id,
                object: 'model',
                createdAt: model.createdAt,
                owned_by: model.owned_by,
                // status: new model.provider().working ? 'working' : 'maintenance'
            }));

        return reply
            .code(200)
            .type('application/json')
            .send({
                object: 'list',
                data
            });
    });
};