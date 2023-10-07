import * as prvd from '../../providers';

import { completionModel } from './base.completion';

const model: completionModel = {
    id: 'gpt-4-32k',
    createdAt: new Date().getTime(),
    owned_by: 'openai',
    limits: {
        perMinute: 3,
        perDay: 30
    },
    hide: false,
    providers: [
        {
            provider: prvd.CycloneGPT,
            timeout: 15 * 1000
        }
    ]
};

export default model;