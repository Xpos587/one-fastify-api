import { FastifyRequest, FastifyReply } from 'fastify';

import { completionModels } from '../../models/completion.models';

export async function modelListCompletionHandler(
    request: FastifyRequest,
    reply: FastifyReply
) {
    await new Promise(async () => {
        const data = Object.entries(completionModels)
            .filter(([id, model]) => !model.hide)
            .map(([id, model]) => ({
                id,
                object: 'model',
                createdAt: model.createdAt,
                owned_by: model.owned_by,
                // status: new model.provider().working ? 'working' : 'maintenance'
            }));

        return reply
            .code(200)
            .type('application/json')
            .send({
                object: 'list',
                data
            });
    });
};