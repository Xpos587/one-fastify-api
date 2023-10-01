import { FastifyInstance } from 'fastify';

import { CompletionProvider, CreateResult } from '..';
import * as base64 from '../../utils/base64.util';

import * as vm from 'vm';

import axios from 'axios';

import { v4 as uuid4 } from 'uuid';

export class Vercel extends CompletionProvider {
    url = 'https://sdk.vercel.ai';
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

        const models: Record<string, {
            id: string,
            default_params: Record<string, any>
        }> = {
            'claude-instant-v1': {
                'id': 'anthropic:claude-instant-v1',
                'default_params': {
                    'temperature': 1,
                    'maxTokens': 200,
                    'topP': 1,
                    'topK': 1,
                    'presencePenalty': 1,
                    'frequencyPenalty': 1,
                    'stopSequences': ['\n\nHuman:'],
                },
            },
            'claude-v1': {
                'id': 'anthropic:claude-v1',
                'default_params': {
                    'temperature': 1,
                    'maxTokens': 200,
                    'topP': 1,
                    'topK': 1,
                    'presencePenalty': 1,
                    'frequencyPenalty': 1,
                    'stopSequences': ['\n\nHuman:'],
                },
            },
            'claude-v2': {
                'id': 'anthropic:claude-v2',
                'default_params': {
                    'temperature': 1,
                    'maxTokens': 200,
                    'topP': 1,
                    'topK': 1,
                    'presencePenalty': 1,
                    'frequencyPenalty': 1,
                    'stopSequences': ['\n\nHuman:'],
                },
            },
            'a16z-infra/llama7b-v2-chat': {
                'id': 'replicate:a16z-infra/llama7b-v2-chat',
                'default_params': {
                    'temperature': 0.75,
                    'maxTokens': 500,
                    'topP': 1,
                    'repetitionPenalty': 1,
                },
            },
            'a16z-infra/llama13b-v2-chat': {
                'id': 'replicate:a16z-infra/llama13b-v2-chat',
                'default_params': {
                    'temperature': 0.75,
                    'maxTokens': 500,
                    'topP': 1,
                    'repetitionPenalty': 1,
                },
            },
            'replicate/llama-2-70b-chat': {
                'id': 'replicate:replicate/llama-2-70b-chat',
                'default_params': {
                    'temperature': 0.75,
                    'maxTokens': 1000,
                    'topP': 1,
                    'repetitionPenalty': 1,
                },
            },
            'huggingface:bigscience/bloom': {
                'id': 'huggingface:bigscience/bloom',
                'default_params': {
                    'temperature': 0.5,
                    'maxTokens': 200,
                    'topP': 0.95,
                    'topK': 4,
                    'repetitionPenalty': 1.03,
                },
            },
            'google/flan-t5-xxl': {
                'id': 'huggingface:google/flan-t5-xxl',
                'default_params': {
                    'temperature': 0.5,
                    'maxTokens': 200,
                    'topP': 0.95,
                    'topK': 4,
                    'repetitionPenalty': 1.03,
                },
            },
            'EleutherAI/gpt-neox-20b': {
                'id': 'huggingface:EleutherAI/gpt-neox-20b',
                'default_params': {
                    'temperature': 0.5,
                    'maxTokens': 200,
                    'topP': 0.95,
                    'topK': 4,
                    'repetitionPenalty': 1.03,
                    'stopSequences': [],
                },
            },
            'OpenAssistant/oasst-sft-4-pythia-12b-epoch-3.5': {
                'id': 'huggingface:OpenAssistant/oasst-sft-4-pythia-12b-epoch-3.5',
                'default_params': { 'maxTokens': 200, 'typicalP': 0.2, 'repetitionPenalty': 1 },
            },
            'OpenAssistant/oasst-sft-1-pythia-12b': {
                'id': 'huggingface:OpenAssistant/oasst-sft-1-pythia-12b',
                'default_params': { 'maxTokens': 200, 'typicalP': 0.2, 'repetitionPenalty': 1 },
            },
            'bigcode/santacoder': {
                'id': 'huggingface:bigcode/santacoder',
                'default_params': {
                    'temperature': 0.5,
                    'maxTokens': 200,
                    'topP': 0.95,
                    'topK': 4,
                    'repetitionPenalty': 1.03,
                },
            },
            'command-light-nightly': {
                'id': 'cohere:command-light-nightly',
                'default_params': {
                    'temperature': 0.9,
                    'maxTokens': 200,
                    'topP': 1,
                    'topK': 0,
                    'presencePenalty': 0,
                    'frequencyPenalty': 0,
                    'stopSequences': [],
                },
            },
            'command-nightly': {
                'id': 'cohere:command-nightly',
                'default_params': {
                    'temperature': 0.9,
                    'maxTokens': 200,
                    'topP': 1,
                    'topK': 0,
                    'presencePenalty': 0,
                    'frequencyPenalty': 0,
                    'stopSequences': [],
                },
            },
            'gpt-4': {
                'id': 'openai:gpt-4',
                'default_params': {
                    'temperature': 0.7,
                    'maxTokens': 500,
                    'topP': 1,
                    'presencePenalty': 0,
                    'frequencyPenalty': 0,
                    'stopSequences': [],
                },
            },
            'gpt-4-0613': {
                'id': 'openai:gpt-4-0613',
                'default_params': {
                    'temperature': 0.7,
                    'maxTokens': 500,
                    'topP': 1,
                    'presencePenalty': 0,
                    'frequencyPenalty': 0,
                    'stopSequences': [],
                },
            },
            'code-davinci-002': {
                'id': 'openai:code-davinci-002',
                'default_params': {
                    'temperature': 0.5,
                    'maxTokens': 200,
                    'topP': 1,
                    'presencePenalty': 0,
                    'frequencyPenalty': 0,
                    'stopSequences': [],
                },
            },
            'openai:gpt-3.5-turbo': {
                'id': 'openai:gpt-3.5-turbo',
                'default_params': {
                    'temperature': 0.7,
                    'maxTokens': 500,
                    'topP': 1,
                    'topK': 1,
                    'presencePenalty': 1,
                    'frequencyPenalty': 1,
                    'stopSequences': [],
                },
            },
            'gpt-3.5-turbo-16k': {
                'id': 'openai:gpt-3.5-turbo-16k',
                'default_params': {
                    'temperature': 0.7,
                    'maxTokens': 500,
                    'topP': 1,
                    'topK': 1,
                    'presencePenalty': 1,
                    'frequencyPenalty': 1,
                    'stopSequences': [],
                },
            },
            'gpt-3.5-turbo-16k-0613': {
                'id': 'openai:gpt-3.5-turbo-16k-0613',
                'default_params': {
                    'temperature': 0.7,
                    'maxTokens': 500,
                    'topP': 1,
                    'topK': 1,
                    'presencePenalty': 1,
                    'frequencyPenalty': 1,
                    'stopSequences': [],
                },
            },
            'text-ada-001': {
                'id': 'openai:text-ada-001',
                'default_params': {
                    'temperature': 0.5,
                    'maxTokens': 200,
                    'topP': 1,
                    'presencePenalty': 0,
                    'frequencyPenalty': 0,
                    'stopSequences': [],
                },
            },
            'text-babbage-001': {
                'id': 'openai:text-babbage-001',
                'default_params': {
                    'temperature': 0.5,
                    'maxTokens': 200,
                    'topP': 1,
                    'presencePenalty': 0,
                    'frequencyPenalty': 0,
                    'stopSequences': [],
                },
            },
            'text-curie-001': {
                'id': 'openai:text-curie-001',
                'default_params': {
                    'temperature': 0.5,
                    'maxTokens': 200,
                    'topP': 1,
                    'presencePenalty': 0,
                    'frequencyPenalty': 0,
                    'stopSequences': [],
                },
            },
            'text-davinci-002': {
                'id': 'openai:text-davinci-002',
                'default_params': {
                    'temperature': 0.5,
                    'maxTokens': 200,
                    'topP': 1,
                    'presencePenalty': 0,
                    'frequencyPenalty': 0,
                    'stopSequences': [],
                },
            },
            'text-davinci-003': {
                'id': 'openai:text-davinci-003',
                'default_params': {
                    'temperature': 0.5,
                    'maxTokens': 200,
                    'topP': 1,
                    'presencePenalty': 0,
                    'frequencyPenalty': 0,
                    'stopSequences': [],
                },
            },
        };

        const vercel_model = models[model];

        const data = {
            model: vercel_model.id,
            messages: messages,
            playgroundId: uuid4(),
            chatIndex: 0
        } || vercel_model.default_params;

        for (let i = 0; i < 20; i++) {
            await axios.post(
                'https://sdk.vercel.ai/api/generate',
                data, {
                headers: {
                    'Content-Type': 'application/json',
                    'Custom-Encoding': await this.get_token(),
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 YaBrowser/23.7.0.2526 Yowser/2.5 Safari/537.36',
                },
                responseType: 'stream'
            }
            ).then((response) => {
                response.data.on('data', async (buff: Buffer) => {
                    console.log(buff.toString('utf-8'));
                });
            });
        };
    };

    async get_token(): Promise<string> {
        const response = await fetch('https://sdk.vercel.ai/openai.jpeg');
        const data = JSON.parse(atob(await response.text()));
        const ret = eval("(".concat(data.c, ")(data.a)"));
         
        // SyntaxError: Unexpected token  in JSON at position 1

        console.log(data);

        throw new Error();

        const regex = /"t":"(.+?)","c":"(.+?)","a":(.+?)}/g;

        // console.log(chunk.match(regex));

        // const rawData = JSON.parse(chunk);

        // const jsScript = `const globalThis={marker:"mark"};String.prototype.fontcolor=function(){return \`<font>\${this}</font>\`};
        // return (${rawData.c})(${rawData.a})`;

        // const context = vm.createContext({});
        // const script = new vm.Script(jsScript);

        // const result: any = script.runInContext(context);

        // const rawToken = JSON.stringify({ r: result, t: rawData.t });

        // const utf16leBuffer = Buffer.from(rawToken, 'utf-8').swap16();
        // const base64Token = utf16leBuffer.toString('base64');

        // return base64Token;
    };
};