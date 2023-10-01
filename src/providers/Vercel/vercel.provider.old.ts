import { FastifyInstance } from 'fastify';

import { CompletionProvider, CreateResult } from '..';
import * as base64 from '../../utils/base64.util';

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
            'anthropic:claude-instant-v1': {
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
            'anthropic:claude-v1': {
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
            'anthropic:claude-v2': {
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
            'replicate:a16z-infra/llama7b-v2-chat': {
                'id': 'replicate:a16z-infra/llama7b-v2-chat',
                'default_params': {
                    'temperature': 0.75,
                    'maxTokens': 500,
                    'topP': 1,
                    'repetitionPenalty': 1,
                },
            },
            'replicate:a16z-infra/llama13b-v2-chat': {
                'id': 'replicate:a16z-infra/llama13b-v2-chat',
                'default_params': {
                    'temperature': 0.75,
                    'maxTokens': 500,
                    'topP': 1,
                    'repetitionPenalty': 1,
                },
            },
            'replicate:replicate/llama-2-70b-chat': {
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
            'huggingface:google/flan-t5-xxl': {
                'id': 'huggingface:google/flan-t5-xxl',
                'default_params': {
                    'temperature': 0.5,
                    'maxTokens': 200,
                    'topP': 0.95,
                    'topK': 4,
                    'repetitionPenalty': 1.03,
                },
            },
            'huggingface:EleutherAI/gpt-neox-20b': {
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
            'huggingface:OpenAssistant/oasst-sft-4-pythia-12b-epoch-3.5': {
                'id': 'huggingface:OpenAssistant/oasst-sft-4-pythia-12b-epoch-3.5',
                'default_params': { 'maxTokens': 200, 'typicalP': 0.2, 'repetitionPenalty': 1 },
            },
            'huggingface:OpenAssistant/oasst-sft-1-pythia-12b': {
                'id': 'huggingface:OpenAssistant/oasst-sft-1-pythia-12b',
                'default_params': { 'maxTokens': 200, 'typicalP': 0.2, 'repetitionPenalty': 1 },
            },
            'huggingface:bigcode/santacoder': {
                'id': 'huggingface:bigcode/santacoder',
                'default_params': {
                    'temperature': 0.5,
                    'maxTokens': 200,
                    'topP': 0.95,
                    'topK': 4,
                    'repetitionPenalty': 1.03,
                },
            },
            'cohere:command-light-nightly': {
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
            'cohere:command-nightly': {
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
            'openai:gpt-4': {
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
            'openai:gpt-4-0613': {
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
            'openai:code-davinci-002': {
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
            'openai:gpt-3.5-turbo-16k': {
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
            'openai:gpt-3.5-turbo-16k-0613': {
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
            'openai:text-ada-001': {
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
            'openai:text-babbage-001': {
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
            'openai:text-curie-001': {
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
            'openai:text-davinci-002': {
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
            'openai:text-davinci-003': {
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

        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'en-US,en;q=0.5',
            'TE': 'trailers'
        };

        const response = await axios.get(
            'https://sdk.vercel.ai/openai.jpeg',
            { headers }
        );

        const data = Buffer.from(response.data, 'base64').toString('utf-8');

        console.log(data);

        console.log(JSON.parse(data));

        // await axios.post(
        //     'https://sdk.vercel.ai/api/generate',
        //     {
        //         messages: messages,
        //         playgroundId: uuid4(),
        //         chatIndex: 0,
        //         model: model
        //     } || vercel_model.default_params, {
        //     headers: {
        //         ...headers,
        //         'Content-Type': 'application/json',
        //         'Custom-Encoding': custom_encoding
        //     }
        // });
    };
};