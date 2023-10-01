import { FastifyInstance } from 'fastify';

import { CompletionProvider, CreateResult, ResolveCreateResult } from '..';

import axios from 'axios';

export class FastGPT extends CompletionProvider {
    url = 'https://origin.eqing.tech/';
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

        let answer = '';
        let captchaToken = await this.resolve_captcha();

        let resolveResponse: ((value: ResolveCreateResult) => void) | undefined;

        axios.post('https://origin.eqing.tech/api/openai/v1/chat/completions', {
            messages: messages,
            stream: true,
            model: model,
            temperature: options.temperature,
            presence_penalty: options.presence_penalty,
            frequency_penalty: options.frequency_penalty,
            top_p: options.top_p,
            chat_token: options.max_tokens,
            captchaToken
        }, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36',
                'Content-Type': 'application/json'
            },
            responseType: 'stream'
        }).then(async (response) => {
            // if (response.status == 401)
            //     return captchaToken = await this.resolve_captcha();

            response.data.on('data', async (buff: Buffer) => {
                const chunk = Buffer.from(buff).toString('utf-8');
                fastify.log.info(`CHUNK OF FASTGPT:\n"""${chunk}"""`);

                const lines = chunk.replace('\n', '').split('data:')

                fastify.log.info(`LINES:\n"""${lines}"""`);

                let data = '';

                for (const line of lines) {
                    data = line.trim();
                    if (data.startsWith('data:')) data = data.replace('data:', '').trim();
                    if (!data) continue;

                    fastify.log.info(`DATA:\n"""${data}"""`);

                    if (data.includes('DONE')) {
                        if (resolveResponse) {
                            resolveResponse({
                                content: '',
                                isFinal: true,
                                finish_reason: 'stop'
                            });
                        };
                    };

                    try {
                        let packet = JSON.parse(data);

                        if (packet.choices[0]?.finish_reason == null) {
                            if (resolveResponse) {
                                resolveResponse({
                                    content: packet.choices[0].delta?.content,
                                    isFinal: false,
                                    finish_reason: packet.choices[0]?.finish_reason
                                });
                            };
                            answer += packet?.choices[0].delta?.content;
                        } else {
                            if (resolveResponse) {
                                resolveResponse({
                                    content: '',
                                    isFinal: true,
                                    finish_reason: packet.choices[0]?.finish_reason
                                });
                            };
                            return response.data.destroy();
                        };
                    } catch (error) {
                        console.error('Error while parsing SSE message:', error);
                        console.error('SSE message:', data);
                    };
                };
            });
        });
        while (true) {
            yield await new Promise<ResolveCreateResult>((resolve) => {
                resolveResponse = resolve;
            });
        };
    };

    async get_sitekey(): Promise<string> {
        const { data } = await axios.get('https://origin.eqing.tech/_next/static/chunks/9424.140b703c785c4d72.js');

        const siteKeyMatch = String(data || '').match(/sitekey:\"(.*?)\"/);
        let siteKey: string = '';

        if (siteKeyMatch && siteKeyMatch.length >= 2) {
            siteKey = siteKeyMatch[1];
        } else console.log('Sitekey not found in the file.');

        return siteKey;
    };

    async resolve_captcha(): Promise<string> {
        const siteKey = await this.get_sitekey();
        return (await this.fastify.solver.hcaptcha(siteKey, 'https://origin.eqing.tech')).data;
    };
};