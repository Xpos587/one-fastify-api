import * as Captcha from '2captcha';

import config from '../config';

import fp from 'fastify-plugin';

declare module 'fastify' {
    export interface FastifyInstance {
        solver: Captcha.Solver;
    }
};

export default fp(async (fastify) => {
    fastify.decorate(
        'solver',
        new Captcha.Solver(config.TWO_CAPTCHA_APIKEY)
    );
});