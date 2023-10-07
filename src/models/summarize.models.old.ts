import { SummarizeProviderConstructor, YaGPT } from '../providers';

export interface summarizeModel {
    id: string;
    createdAt: number;
    owned_by: string;
    providers: SummarizeProviderConstructor[];
};

/**
 * Id в объекте используется при отправке запроса провайдеру,
 * В то время, как ключ используется для идентификации в текущем API.
 * Это нужно для того, чтобы можно было использовать одну и ту же модель,
 * Но у разных провайдеров.
 */

export const summarizeModels: Record<string, summarizeModel> = {
    'YaGPT-summarize': {
        id: 'YaGPT-summarize',
        createdAt: 1695657957402,
        owned_by: 'yandex',
        providers: [YaGPT]
    }
};