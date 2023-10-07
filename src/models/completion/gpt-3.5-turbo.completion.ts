import * as prvd from '../../providers';

import { completionModel } from './base.completion';

const model: completionModel = {
    id: 'gpt-3.5-turbo',
    createdAt: new Date().getTime(),
    owned_by: 'openai',
    limits: {
        perMinute: 16,
        perDay: 300
    },
    hide: false,
    providers: [
        {
            provider: prvd.Yuanmu,
            timeout: 8 * 1000
        },
        {
            provider: prvd.CycloneGPT,
            timeout: 5 * 1000
        },
        {
            provider: prvd.DakuGPT,
            timeout: 5 * 1000
        },
        {
            provider: prvd.Zuki,
            timeout: 5 * 1000
        },
        {
            provider: prvd.NovaAI,
            timeout: 5 * 1000
        }
    ]
};

export default model;