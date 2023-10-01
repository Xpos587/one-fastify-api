import { FastifyInstance } from 'fastify';

import { CompletionProvider, CreateResult, ResolveCreateResult } from '..';

import WebSocket from 'ws';
import md5 from 'md5';
import { v4 as uuid4 } from 'uuid';

export class MyShell extends CompletionProvider {
    url = 'https://app.myshell.ai';
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

        const modelToBotUidMapping: Record<string, string> = {
            'gpt-4': '01c8de4fbfc548df903712b0922a4e01',
            'samantha': '1e3be7fe89e94a809408b1154a2ee3e1',
            'chatty-ms': '016890537066435ba2befbce559cb776',
            'gpt-3.5-turbo': '8077335db7cd47e29f7de486612cc7fd'
        };
        const botUid = modelToBotUidMapping[model];

        const socket = new WebSocket('wss://api.myshell.ai/ws/?EIO=4&transport=websocket');

        const text = messages.map(message => `\n${message.role}: ${message.content}`).join('');

        let resolveResponse: ((value: ResolveCreateResult) => void) | undefined;

        socket.on('open', async () => {
            socket.on('message', async (data: any) => {
                data = data.toString();
                try {
                    const cmd = data.split(',')[0];
                    let args: any;

                    console.log('DATA: ' + String(data.trim()));
                    console.log('DATA SPLIT ",": ' + String(data.split(',')));

                    if (data[0] == '0') {
                        socket.send(`40/chat,${JSON.stringify({
                            token: null,
                            visitorId: md5(uuid4())
                        })}`);
                    } else if (data == '2') socket.send('3'); else {
                        args = JSON.parse(data.split(',').slice(1).join(',').trim());
                        // console.log('ARGS: ' + String(args));
                    };

                    if (cmd == '42/chat' && args[0] == 'text_stream') {
                        if (args[1].data.text) {
                            if (resolveResponse) resolveResponse({
                                content: args[1].data.text,
                                isFinal: false,
                                finish_reason: null
                            });
                        } else {
                            if (resolveResponse) resolveResponse({
                                content: args[1].data.text,
                                isFinal: true,
                                finish_reason: 'stop'
                            });
                            socket.close();
                        };
                    } else if (cmd == '40/chat' && args['sid']) {
                        socket.send(`42/chat,${JSON.stringify([
                            'text_chat',
                            {
                                botUid,
                                reqId: uuid4(),
                                signature: '',
                                sourceFrom: 'myshellWebsite',
                                text,
                                timestamp: Date.now().toString(),
                                version: 'v1.0.0'
                            }
                        ])}`);
                        console.log(cmd, args);
                    } else if (cmd == '42/chat' && args[0] == 'exception') {
                        socket.close();
                        return;

                    } else if (cmd == '42/chat' && args[0] == 'message_replied') {
                        socket.close();
                        return;
                    };
                } catch (err) {
                    console.error(err);
                };
            });
        });

        while (true) {
            yield await new Promise<ResolveCreateResult>((resolve) => {
                resolveResponse = resolve;
            });
        };
    };
};