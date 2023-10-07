import { CompletionProviderConstructor } from '../../providers';

export interface completionModel {
    id: string;
    createdAt: number;
    owned_by: string;
    limits: {
        perMinute: number,
        perDay: number
    }
    hide: boolean;
    providers: {
        provider: CompletionProviderConstructor;
        id?: string;
        timeout: number;
        messages?: {
            role: 'user' | 'assistant' | 'system' | 'function';
            content: string;
        }[];
    }[];
};