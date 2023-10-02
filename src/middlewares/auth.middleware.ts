import { FastifyRequest, FastifyReply } from 'fastify';

import { verifyApiKey } from '../utils/hash.util';

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
    const hashApiKey = String(request.headers['authorization']).split(' ')[1];

    if (!hashApiKey) {
        return reply
            .code(401)
            .type('application/json')
            .send({
                error: {
                    message: 'You didn\'t provide an API key. You need to provide your API key in an Authorization header using Bearer auth (i.e. Authorization: Bearer YOUR_KEY), or as the password field (with blank username) if you\'re accessing the API from your browser and are prompted for a username and password. You can obtain an API key from https://platform.openai.com/account/api-keys.',
                    type: 'invalid_request_error',
                    param: null,
                    code: null
                }
            });
    };


    /* TODO.
    Вначале принимаем hash api ключа (в headers),
    затем по этому hash находим объект ApiKey в БД.
    От туда берём salt api ключа и находим владельца через
    объект User в объекте ApiKey.
    Проверяем hash ключа при помощи метода verifyApiKey,
    куда, в поле candidateApiKey, будут переданы данные
    пользователя (например: telegramId, _id),
    найденный salt и наш hash.
    Если verifyApiKey вернёт true, то пропускаем запрос
    Если hash не совпадает, то возвращаем 401 (Unauthorized)
    */

    async function findKeyByHash(hash: string) {
        return await request.server.prisma.apiKey.findFirst({
            where: {
                apiKeyHash: hash
            }
        });
    };

    async function findUserById(userId: string) {
        return await request.server.prisma.user.findFirst({
            where: {
                id: userId
            }
        });
    };

    const apiKey = await findKeyByHash(hashApiKey);

    if (!apiKey) {
        return reply
            .code(401)
            .type('application/json')
            .send({
                error: {
                    message: `Incorrect API key provided: ${hashApiKey}. You can find your API key at https://platform.openai.com/account/api-keys.`,
                    type: 'invalid_request_error',
                    param: null,
                    code: 'invalid_api_key'
                }
            });
    };

    const user = await findUserById(String(apiKey?.userId));

    // console.log('apiKey:', apiKey);
    // console.log('user:', user);

    // Проверяем введенный apiKey с использованием соли и хеша из базы данных
    const isApiKeyValid = verifyApiKey({
        candidateApiKey: `${user?.id}-${user?.createdAt}-${user?.telegramId}`,
        salt: String(apiKey?.salt),
        hash: hashApiKey
    });

    request.log.info('isApiKeyValid:', isApiKeyValid);
};
