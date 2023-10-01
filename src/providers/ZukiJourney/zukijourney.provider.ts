import { FastifyInstance } from 'fastify';

import { CompletionProvider, CreateResult } from '..';

import OpenAI from 'openai';

export class Zuki extends CompletionProvider {
    url = 'https://zukijourney.xyzbot.net/';
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

        /**
         * * ZukiJourney - использует IP LOCK, это
         * означает, что для каждого api ключа нужно
         * всегда использовать IP, с которого был отправлен
         * первый запрос с использованием этого ключа
         * 
         * * Примечание: в дискорд сервере zukijourney
         * можно ресетнуть IP по команде /resetip
         * 
         * Ссылка на дискорд: https://discord.gg/mqPbeACXGx
        */

        const openai = new OpenAI({
            baseURL: 'https://zukijourney.xyzbot.net/v1',
            apiKey: 'zu-4254eae016c2312be50a7d0499a732c3'
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