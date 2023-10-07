import { FastifyInstance } from 'fastify';

import { CompletionProvider, CreateResult } from '..';

import axios from 'axios';

export class NyxAI extends CompletionProvider {
    url = 'https://api.geneplore.com/';
    working = false;
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

        const response = await axios.post(
            'https://api.geneplore.com/chat/openai',
            {
                model: model,
                conversation: messages,
                settings: {
                    temperature,
                    top_p,
                    n,
                    max_tokens,
                    presence_penalty,
                    frequency_penalty
                }
            }
        );
    };
};