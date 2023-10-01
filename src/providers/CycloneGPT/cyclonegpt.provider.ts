import { FastifyInstance } from 'fastify';

import { CompletionProvider, CreateResult } from '..';

import OpenAI from 'openai';

export class CycloneGPT extends CompletionProvider {
    url = 'https://gpt.darkcoder15.tk/';
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

        const {
            temperature, top_p, n,
            max_tokens, presence_penalty,
            frequency_penalty
        } = options;

        /**
         * * CycloneGPT - использует IP LOCK, это
         * означает, что для каждого api ключа нужно
         * всегда использовать IP, с которого был отправлен
         * первый запрос с использованием этого ключа
         * 
         * Получение API ключа осуществляется в Telegram,
         * у бота https://t.me/cyclonegptbot, по
         * команде /key
         * 
         * Ссылка на дискорд: https://discord.gg/wFkebhFJ8j
        */

        const openai = new OpenAI({
            baseURL: 'https://gpt.darkcoder15.tk/v1',
            apiKey: 'sk-QHRlbGVncmFtXzYzNTIzNjMxMzE6bS5kYXJrY29kZXIxNS50ay1jNTNiNGJi'
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

            yield {
                content: choice.delta.content || '',
                isFinal: Boolean(choice.finish_reason),
                finish_reason: choice.finish_reason
            };
        };
    };
};