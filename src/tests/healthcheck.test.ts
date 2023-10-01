import { test } from 'tap';
import { buildApp } from '../app';

import fastifyAutoload from '@fastify/autoload';

import path from 'path';

test('requests the `/healthcheck` route', async (t) => {
    const fastify = await buildApp();

    await fastify.register(fastifyAutoload, {
        dir: path.join(__dirname, '../plugins')
    });

    t.teardown(() => {
        fastify.close();
    });

    const response = await fastify.inject({
        method: 'GET',
        url: '/healthcheck',
    });

    t.equal(response.statusCode, 200);
    t.same(response.json().status, 'ok');
    t.ok(response.json().memoryUsage);
    t.ok(response.json().cpuUsage);
    t.ok(response.json().uptime);
});