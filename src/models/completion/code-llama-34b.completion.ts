import * as prvd from '../../providers';

import { completionModel } from './base.completion';

const model: completionModel = {
    id: 'code-llama-34b',
    createdAt: new Date().getTime(),
    owned_by: 'meta',
    limits: {
        perMinute: 6,
        perDay: 90
    },
    hide: false,
    providers: [
        {
            provider: prvd.DakuGPT,
            id: 'codellama-34b',
            timeout: 5 * 1000
        },
        {
            provider: prvd.CycloneGPT,
            id: 'codellama-34b',
            timeout: 5 * 1000
        }
    ]
};

export default model;