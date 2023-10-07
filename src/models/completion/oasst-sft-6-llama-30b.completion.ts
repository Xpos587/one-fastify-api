import * as prvd from '../../providers';

import { completionModel } from './base.completion';

const model: completionModel = {
    id: 'oasst-sft-6-llama-30b',
    createdAt: new Date().getTime(),
    owned_by: 'meta',
    limits: {
        perMinute: 6,
        perDay: 90
    },
    hide: false,
    providers: [
        {
            provider: prvd.CycloneGPT,
            timeout: 5 * 1000
        }
    ]
};

export default model;