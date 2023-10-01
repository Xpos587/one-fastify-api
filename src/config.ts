import dotenv from 'dotenv';

dotenv.config();

export default {
    NODE_ENV: String(process.env.NODE_ENV),
    FASTIFY_PORT: Number(process.env.FASTIFY_PORT),
    FASTIFY_HOST: String(process.env.FASTIFY_HOST),
    BODY_LIMIT: Number(process.env.BODY_LIMIT),
    TWO_CAPTCHA_APIKEY: String(process.env.TWO_CAPTCHA_APIKEY)
};