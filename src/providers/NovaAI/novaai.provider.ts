import { FastifyInstance } from 'fastify';

import { CompletionProvider, CreateResult } from '..';

import OpenAI from 'openai';

export class NovaAI extends CompletionProvider {
    url = 'https://api.nova-oss.com/';
    working = true;
    hasStream = true;

    async *create_completion(
        fastify: FastifyInstance,
        model: string,
        messages: {
            role: 'system' | 'assistant' | 'user' | 'function';
            content: string;
        }[],
        options: {
            temperature: number,
            top_p: number,
            n: number,
            max_tokens: number,
            presence_penalty: number,
            frequency_penalty: number
        }
    ): CreateResult {
        this.fastify = fastify;

        const { temperature, top_p, n, max_tokens, presence_penalty, frequency_penalty } = options;

        const openai = new OpenAI({
            baseURL: 'https://api.nova-oss.com/v1',
            apiKey: 'nv-RFn9U2SI5Cf0G4dxTWL7N0V4x0SS4bPqkWlXj0AOwsLzTC55'
        });

        const completionStream = await openai.chat.completions.create({
            messages: messages,
            model: model,
            stream: true,
            temperature,
            top_p,
            n,
            max_tokens,
            presence_penalty,
            frequency_penalty
        });
        for await (const completion of completionStream) {
            const choice = completion.choices[0];

            // fastify.log.info({
            //     content: String(choice.delta.content),
            //     isFinal: Boolean(choice.finish_reason),
            //     finish_reason: choice.finish_reason
            // });
            yield {
                content: choice.delta.content || '',
                isFinal: Boolean(choice.finish_reason),
                finish_reason: choice.finish_reason
            };
        };
    };
};