import { FastifyInstance } from 'fastify';

import { SummarizeProvider, CreateResult, ResolveCreateResult } from '..';

import axios from 'axios';

export class YaGPT extends SummarizeProvider {
    url = 'foswly-sa.toiloff.ru';
    working = true;
    hasStream = true;
    headers = {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 YaBrowser/23.7.0.2526 Yowser/2.5 Safari/537.36',
        'Referer': 'https://300.ya.ru',
        'Origin': 'https://300.ya.ru',
        'pragma': 'no-cache',
        'cache-control': 'no-cache'
    };

    async *create_summarize(
        fastify: FastifyInstance,
        model: string,
        url: string
    ): CreateResult {
        this.fastify = fastify;

        let answer = '';
        let authorization = '';

        let resolveResponse: ((value: ResolveCreateResult) => void) | undefined;

        // await this.authorize();

        // const response = await this.summarize(url);

        // const session_id = response.data.session_id;
        // const status_code = response.data.status_code;

        // if (status_code === '1') {

        // }
    };

    async yandex_request(endpoint: string, body: object, headers: object) {
        return await axios.post(
            'https://300.ya.ru/api/' + endpoint,
            body, {
            headers: headers
        });
    };

    
}