import * as prvd from '../../providers';

import { completionModel } from './base.completion';

const model: completionModel = {
    id: 'gpt-3.5-turbo-16k',
    createdAt: new Date().getTime(),
    owned_by: 'openai',
    limits: {
        perMinute: 10,
        perDay: 150
    },
    hide: false,
    providers: [
        {
            provider: prvd.CycloneGPT,
            timeout: 5 * 1000
        },
        {
            provider: prvd.DakuGPT,
            timeout: 5 * 1000
        },
        {
            provider: prvd.NovaAI,
            timeout: 5 * 1000
        }
    ]
};

export default model;