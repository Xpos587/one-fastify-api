import { FastifyInstance } from 'fastify';

export type ResolveCreateResult = {
    content: string;
    isFinal: boolean;
    finish_reason?: string | null;
    tokens?: {
        prompt?: number | null,
        completion?: number | null,
        total?: number | null
    }
};

export type CreateResult = AsyncGenerator<ResolveCreateResult, void, void>;

export abstract class CompletionProvider {
    url: string = ''
    working: boolean = false
    hasStream: boolean = false
    fastify!: FastifyInstance

    abstract create_completion(
        fastify: FastifyInstance,
        model: string,
        messages: {
            role: string;
            content: string;
        }[],
        // plugins: Array<string>,
        options: {
            temperature: number,
            top_p: number,
            n: number,
            max_tokens: number,
            presence_penalty: number,
            frequency_penalty: number
        }
    ): CreateResult;
};

export abstract class SummarizeProvider {
    url: string = ''
    working: boolean = false
    hasStream: boolean = false
    fastify!: FastifyInstance

    abstract create_summarize(
        fastify: FastifyInstance,
        model: string,
        url: string
    ): CreateResult;
};

export type CompletionProviderConstructor = {
    new(): CompletionProvider;
};

export type SummarizeProviderConstructor = {
    new(): SummarizeProvider;
};