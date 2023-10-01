import { FastifyRequest, FastifyReply } from 'fastify';
import { CreateSummarizeInput } from './summarize.schema';

import { summarizeModels } from '../../models/summarize.models';

import { badRequest, BadRequestError } from '../../utils/badreq.util';

import { v4 } from 'uuid';
import md5 from 'md5';

export async function createSummarizeHandler(
    request: FastifyRequest<{
        Body: CreateSummarizeInput
    }>,
    reply: FastifyReply
) {
    await new Promise(async () => {
        try {
            const { model, url, stream } = request.body;

            const selectedModel = summarizeModels[model];
            badRequest(reply, !!model, `Model \'${model}\' doesn't exist.`);

            const providers = selectedModel.providers;

            const cmplId = 'chatcmpl-' + md5(v4());
            let answer = '';

            let foundWorkingProvider = false;

            while (!foundWorkingProvider) {
                try {
                    const provider = new providers[0];

                    const summarizeStream = provider.create_summarize(
                        request.server,
                        selectedModel.id,
                        url
                    );

                    if (stream) {
                        reply.raw.writeHead(200, { 'Content-Type': 'text/event-stream' });
                    };

                    for await (let response of summarizeStream) {
                        if (stream) {
                            reply.raw.write(`data: ${JSON.stringify({
                                id: cmplId,
                                object: 'chat.summarize.chunk',
                                model,
                                createdAt: Date.now(),
                                choices: [
                                    {
                                        index: 0,
                                        delta: {
                                            role: 'assistant',
                                            content: response.content
                                        },
                                        finish_reason: null
                                    }
                                ]
                            })}\n\n`);
                        };

                        if (response.isFinal) {
                            if (stream) {
                                reply.raw.write(`data: ${JSON.stringify({
                                    id: cmplId,
                                    object: 'chat.summarize.chunk',
                                    model,
                                    createdAt: Date.now(),
                                    choices: [{
                                        index: 0,
                                        delta: {},
                                        finish_reason: response.finish_reason
                                    }],
                                })}\n\n`)
                                return reply.raw.end('data: [DONE]\n\n');
                            } else {
                                return reply
                                    .code(200)
                                    .type('application/json')
                                    .send({
                                        id: cmplId,
                                        object: 'chat.summarize',
                                        createdAt: Date.now(),
                                        model,
                                        choices: [{
                                            index: 0,
                                            message: {
                                                role: 'assistant',
                                                content: answer
                                            },
                                            finish_reason: response.finish_reason
                                        }]
                                    });
                            };
                        };
                        answer += response.content;
                    };
                    foundWorkingProvider = true;
                } catch (err) {
                    providers.shift();
                };
            };
            if (!foundWorkingProvider) {
                reply.code(500).send({
                    error: {
                        message: 'No working providers found.',
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
                        message: 'Internal Server Error.',
                        type: 'internal_server_error',
                        param: null,
                        code: null
                    }
                });
            };
        };
    });
};