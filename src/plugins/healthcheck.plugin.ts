import fp from 'fastify-plugin';

export default fp(async (fastify) => {
    fastify.get('/healthcheck', async (request, reply) => {
        const usedMemory = process.memoryUsage().rss / (1024 * 1024); // RAM usage in MB
        const cpuUsage = process.cpuUsage().system / (1024 * 1024); // CPU usage in seconds

        const uptime = process.uptime(); // Server uptime in seconds

        reply
            .code(200)
            .type('application/json')
            .send({
                status: 'ok',
                memoryUsage: `${usedMemory.toFixed(2)} MB`,
                cpuUsage: `${cpuUsage.toFixed(2)} seconds`,
                uptime: `${uptime.toFixed(2)} seconds`
            });
    });
});
