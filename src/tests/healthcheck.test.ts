import { test } from 'tap';
import buildApp from '../app';

test('requests the `/healthcheck` route', async (t) => {
    const fastify = await buildApp();

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