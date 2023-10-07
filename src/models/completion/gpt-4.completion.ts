import * as prvd from '../../providers';

import { completionModel } from './base.completion';

const model: completionModel = {
    id: 'gpt-4',
    createdAt: new Date().getTime(),
    owned_by: 'openai',
    limits: {
        perMinute: 6,
        perDay: 90
    },
    hide: false,
    providers: [
        {
            provider: prvd.DakuGPT,
            timeout: 10 * 1000
        },
        {
            provider: prvd.Zuki,
            timeout: 10 * 1000
        },
        {
            provider: prvd.NovaAI,
            timeout: 10 * 1000
        }
    ]
};

export default model;