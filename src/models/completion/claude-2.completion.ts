import * as prvd from '../../providers';

import { completionModel } from './base.completion';

const model: completionModel = {
    id: 'claude-2',
    createdAt: new Date().getTime(),
    owned_by: 'anthropic',
    limits: {
        perMinute: 6,
        perDay: 90
    },
    hide: false,
    providers: [
        {
            provider: prvd.DakuGPT,
            timeout: 5 * 1000
        },
        {
            provider: prvd.Zuki,
            timeout: 5 * 1000
        },
        {
            provider: prvd.CycloneGPT,
            timeout: 5 * 1000
        }
    ]
};

export default model;