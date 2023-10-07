/** 
 * https://github.com/freeCodeCamp/freeCodeCamp/blob/2a349604159f689213e77d9604dd58921cbe3f83/api/src/utils/env.ts
 */

import assert from 'node:assert';
import path from 'node:path';

import { config } from 'dotenv';

const envPath = path.resolve(__dirname, '../../.env');
const { error } = config({ path: envPath });

if (error) {
    console.warn(`
    ----------------------------------------------------
    Warning: .env file not found.
    ----------------------------------------------------
    
    You can ignore this warning if using a different way
    to setup this environment.
    ----------------------------------------------------
    `);
};

assert.ok(process.env.NODE_ENV);

assert.ok(process.env.PORT);
assert.ok(process.env.TRUST_PROXY);

assert.ok(process.env.RATE_LIMIT_MAX);
assert.ok(process.env.RATE_LIMIT_TIME_WINDOW);

assert.ok(process.env.SSL_KEY);
assert.ok(process.env.SSL_CERT);

assert.ok(process.env.SWAGGER_ROUTE_PREFIX);

assert.ok(process.env.SWAGGER_TITLE);
assert.ok(process.env.SWAGGER_VERSION);

assert.ok(process.env.TWO_CAPTCHA_APIKEY);
assert.ok(process.env.DATABASE_URL);

export const NODE_ENV = process.env.NODE_ENV;

export const PORT = Number(process.env.PORT) || 80;
export const TRUST_PROXY = Boolean(process.env.TRUST_PROXY);

export const RATE_LIMIT_MAX = Number(process.env.RATE_LIMIT_MAX);
export const RATE_LIMIT_TIME_WINDOW = process.env.RATE_LIMIT_TIME_WINDOW;

export const SSL_KEY = process.env.SSL_KEY;
export const SSL_CERT = process.env.SSL_CERT;

export const SWAGGER_ROUTE_PREFIX = process.env.SWAGGER_ROUTE_PREFIX || '/docs';

export const SWAGGER_TITLE = process.env.SWAGGER_TITLE;
export const SWAGGER_VERSION = process.env.SWAGGER_VERSION;

export const TWO_CAPTCHA_APIKEY = process.env.TWO_CAPTCHA_APIKEY;
export const DATABASE_URL = process.env.DATABASE_URL || 'mongodb://localhost:27017/oneapi?directConnection=true';