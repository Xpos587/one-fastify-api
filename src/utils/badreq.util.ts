import { FastifyReply } from 'fastify';

export class BadRequestError extends Error {
    constructor(message: string) {
        super(message);
    }
};

export function badRequest(reply: FastifyReply, variable: any, message: string) {
    if (!variable) {
        throw new BadRequestError(message);
    }
};