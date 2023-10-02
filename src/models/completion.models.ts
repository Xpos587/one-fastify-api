import {
    CompletionProviderConstructor, DakuGPT,
    NovaAI, Yuanmu, Zuki, Pawan, CycloneGPT,
    AI4ALL
} from '../providers';

export interface completionModel {
    createdAt: number;
    owned_by: string;
    providers: {
        id?: string,
        timeout?: number,
        provider: CompletionProviderConstructor,
        messages?: {
            role: 'user' | 'assistant' | 'system' | 'function',
            content: string
        }[]
    }[];
    limits: {
        perMinute: number,
        perDay: number
    }
    hide: boolean;
};

/**
 * Id в объекте используется при отправке запроса провайдеру,
 * В то время, как ключ используется для идентификации в текущем API.
 * Это нужно для того, чтобы можно было использовать одну и ту же модель,
 * Но у разных провайдеров.
 */

export const completionModels: Record<string, completionModel> = {
    'gpt-3.5-turbo': {
        createdAt: new Date().getTime(),
        owned_by: 'openai',
        providers: [
            { provider: Yuanmu },
            { provider: CycloneGPT },
            { provider: DakuGPT },
            { provider: AI4ALL },
            { provider: Zuki },
            { provider: NovaAI }
        ],
        limits: {
            perMinute: 16,
            perDay: 300
        },
        hide: false
    },
    'gpt-3.5-turbo-16k': {
        createdAt: new Date().getTime(),
        owned_by: 'openai',
        providers: [
            { provider: DakuGPT },
            { provider: CycloneGPT },
            { provider: Yuanmu },
            { provider: NovaAI },
            { provider: AI4ALL }
        ],
        limits: {
            perMinute: 10,
            perDay: 150
        },
        hide: false
    },
    'gpt-4': {
        createdAt: new Date().getTime(),
        owned_by: 'openai',
        providers: [
            { provider: Yuanmu },
            { provider: AI4ALL },
            { provider: DakuGPT },
            { provider: CycloneGPT },
            { provider: Zuki },
            { provider: NovaAI }
        ],
        limits: {
            perMinute: 6,
            perDay: 90
        },
        hide: false
    },
    'gpt-4-32k': {
        createdAt: new Date().getTime(),
        owned_by: 'openai',
        providers: [{ provider: AI4ALL }, { provider: CycloneGPT }],
        limits: {
            perMinute: 3,
            perDay: 30
        },
        hide: false
    },
    'claude-instant': {
        createdAt: new Date().getTime(),
        owned_by: 'anthropic',
        providers: [
            { provider: DakuGPT },
            { provider: CycloneGPT }
        ],
        limits: {
            perMinute: 6,
            perDay: 90
        },
        hide: false
    },
    'claude-2': {
        createdAt: new Date().getTime(),
        owned_by: 'anthropic',
        providers: [
            { provider: AI4ALL },
            { provider: DakuGPT },
            { provider: CycloneGPT },
            { provider: Zuki }
        ],
        limits: {
            perMinute: 6,
            perDay: 90
        },
        hide: false
    },
    'claude-100k': {
        createdAt: new Date().getTime(),
        owned_by: 'openai',
        providers: [
            { provider: DakuGPT },
            { provider: CycloneGPT }
        ],
        limits: {
            perMinute: 6,
            perDay: 90
        },
        hide: false
    },
    'llama-2-70b': {
        createdAt: new Date().getTime(),
        owned_by: 'meta',
        providers: [
            { provider: DakuGPT },
            { provider: CycloneGPT }
        ],
        limits: {
            perMinute: 6,
            perDay: 90
        },
        hide: false
    },
    'code-llama-34b': {
        createdAt: new Date().getTime(),
        owned_by: 'meta',
        providers: [
            {
                id: 'codellama-34b',
                provider: DakuGPT
            },
            {
                id: 'codellama-34b',
                provider: CycloneGPT
            }
        ],
        limits: {
            perMinute: 6,
            perDay: 90
        },
        hide: false
    },
    'oasst-sft-6-llama-30b': {
        createdAt: new Date().getTime(),
        owned_by: 'meta',
        providers: [{ provider: CycloneGPT }],
        limits: {
            perMinute: 6,
            perDay: 90
        },
        hide: false
    },
    'pai-001-light-beta': {
        createdAt: new Date().getTime(),
        owned_by: 'pawan',
        providers: [{ provider: Pawan }],
        limits: {
            perMinute: 6,
            perDay: 90
        },
        hide: true
    },
    'pai-001-beta': {
        createdAt: new Date().getTime(),
        owned_by: 'pawan',
        providers: [{ provider: Pawan }],
        limits: {
            perMinute: 6,
            perDay: 90
        },
        hide: true
    },
    /*
    Идея создать модель HeadlineGenius или Summarize,
    это обычная модель gpt-3.5-turbo, которой
    подаётся запрос от пользователя для которого,
    будет генерироваться краткий заголовок, для
    названия чата/беседы с ботом.
    
    промпт для создания заголовка чата/беседы:
    "Пожалуйста, создайте заголовок от 2 до 6 слов, который кратко описывает нашу беседу, без введения, знаков пунктуации, кавычек, точек, символов или дополнительного текста. Удалите кавычки."
    */
    'headline-summarize-001': {
        createdAt: new Date().getTime(),
        owned_by: 'oneapi',
        providers: [
            {
                id: 'gpt-3.5-turbo',
                provider: Yuanmu,
                messages: [{
                    role: 'system',
                    content: 'Please create a 2 to 6 word title that briefly describes our conversation, without introduction, punctuation, quotation marks, periods, symbols, or additional text. Remove the quotes.'
                }]
            },
            {
                id: 'gpt-3.5-turbo',
                provider: Zuki,
                messages: [{
                    role: 'system',
                    content: 'Please create a 2 to 6 word title that briefly describes our conversation, without introduction, punctuation, quotation marks, periods, symbols, or additional text. Remove the quotes.'
                }]
            }
        ],
        limits: {
            perMinute: 16,
            perDay: 300
        },
        hide: false
    }
};