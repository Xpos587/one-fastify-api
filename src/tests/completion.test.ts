import { test } from 'tap';
import buildApp from '../app';

test('requests the `/healthcheck` route', async (t) => {
    const fastify = await buildApp();

    t.teardown(() => {
        fastify.close();
    });

    const response = await fastify.inject({
        method: 'POST',
        url: '/healthcheck',
        headers: {
            authorization: 'Bearer a848db02ef5902ea98b50c2d83541a6b8bb8993c77ff9c1cf5d0772e63197748f796af6d3336b1819b3ddbe7cb7da7f5ccebc1a5584f89b732785708e9e42f1a'
        },
    });

    t.equal(response.statusCode, 200);
    t.same(response.json().status, 'ok');
    t.ok(response.json().memoryUsage);
    t.ok(response.json().cpuUsage);
    t.ok(response.json().uptime);
});