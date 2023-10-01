import { FastifyInstance } from 'fastify';

import { SummarizeProvider, CreateResult, ResolveCreateResult } from '..';

import axios from 'axios';

export class YaGPT extends SummarizeProvider {
    url = 'https://300.ya.ru';
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

    private axiosInstance = axios.create({
        withCredentials: true, // Включает поддержку cookies
    });

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
        return await this.axiosInstance.post(
            'https://300.ya.ru/api/' + endpoint,
            body, {
            headers: headers
        });
    };

    async get_sharing_url(data: object) {
        return await this.yandex_request('sharing-url', data, { ...this.headers, 'Authorization': 'OAuth y0_AgAAAABxBrhNAAqMuwAAAADtjbL8SAanU7ttS6WPRFFePJbBkXcOpgc' });
    };

    async get_sharing_data(data: object) {
        return await this.yandex_request('sharing', data, { ...this.headers, 'Cookie': '' });
    };

    async generation(data: object) {
        return await this.yandex_request('generation', data, { ...this.headers, 'Cookie': '' });
    };

    // async summarize(url: string, session_id: string | null): Promise<any> {
    //     if (session_id) {
    //         return await this.axiosInstance.post(
    //             'https://300.ya.ru/api/generation',
    //             {
    //                 session_id
    //             },
    //             {
    //                 headers: {
    //                     'Cookie': 'i=DbVEVZSPj2xE302JH5jAXh+IVy7idb3jCcVmVZVoNOflucPsewzQJ23TBZqNKBTsguCmcrDDvN3xTAu/SZJxAvJUEDA=; yandexuid=7985955761695660820; yabs-sid=2675182901695660821; yuidss=7985955761695660820; ymex=2011020821.yrts.1695660821; gdpr=0; _ym_uid=1695660823290923021; _ym_d=1695660823; _ym_visorc=b; _ym_isad=1; Session_id=3:1695662527.5.0.1695662527631:qINCsg:c2.1.2:1|1896265805.0.2.3:1695662527|3:10276279.139101.htc7VUdzYQGCg_bfMOV_ERfBiTg; sessar=1.1182.CiCF1UxdK0uLdMof_UVTWlUGpdHmwVec2bzWCIaL71UNww.mZlZ8yEcfX8t4rlFu_rDXnrT85AIsfh09JqW-fj2Gvk; sessionid2=3:1695662527.5.0.1695662527631:qINCsg:c2.1.2:1|1896265805.0.2.3:1695662527|3:10276279.139101.fakesign0000000000000000000; yp=2011022527.udn.cDptaWhhaWxhYm9ydG5pa292; yandex_login=mihailabortnikov; ys=udn.cDptaWhhaWxhYm9ydG5pa292#c_chck.2020778321; bh=Ej8iQ2hyb21pdW0iO3Y9IjExNiIsIk5vdClBO0JyYW5kIjt2PSIyNCIsIkdvb2dsZSBDaHJvbWUiO3Y9IjExNiIaBSJ4ODYiIhAiMTE2LjAuNTg0NS4xODgiKgI/MDoJIldpbmRvd3MiQggiMTUuMC4wIkoEIjY0IlJcIkNocm9taXVtIjt2PSIxMTYuMC41ODQ1LjE4OCIsIk5vdClBO0JyYW5kIjt2PSIyNC4wLjAuMCIsIkdvb2dsZSBDaHJvbWUiO3Y9IjExNi4wLjU4NDUuMTg4IiI=',
    //                     'Content-Type': 'application/json',
    //                 }
    //             }
    //         );
    //     }

    //     return await this.axiosInstance.post(
    //         'https://300.ya.ru/api/generation',
    //         {
    //             article_url: url,
    //             text: ''
    //         },
    //         {
    //             headers: {
    //                 'Cookie': 'i=DbVEVZSPj2xE302JH5jAXh+IVy7idb3jCcVmVZVoNOflucPsewzQJ23TBZqNKBTsguCmcrDDvN3xTAu/SZJxAvJUEDA=; yandexuid=7985955761695660820; yabs-sid=2675182901695660821; yuidss=7985955761695660820; ymex=2011020821.yrts.1695660821; gdpr=0; _ym_uid=1695660823290923021; _ym_d=1695660823; _ym_visorc=b; _ym_isad=1; Session_id=3:1695662527.5.0.1695662527631:qINCsg:c2.1.2:1|1896265805.0.2.3:1695662527|3:10276279.139101.htc7VUdzYQGCg_bfMOV_ERfBiTg; sessar=1.1182.CiCF1UxdK0uLdMof_UVTWlUGpdHmwVec2bzWCIaL71UNww.mZlZ8yEcfX8t4rlFu_rDXnrT85AIsfh09JqW-fj2Gvk; sessionid2=3:1695662527.5.0.1695662527631:qINCsg:c2.1.2:1|1896265805.0.2.3:1695662527|3:10276279.139101.fakesign0000000000000000000; yp=2011022527.udn.cDptaWhhaWxhYm9ydG5pa292; yandex_login=mihailabortnikov; ys=udn.cDptaWhhaWxhYm9ydG5pa292#c_chck.2020778321; bh=Ej8iQ2hyb21pdW0iO3Y9IjExNiIsIk5vdClBO0JyYW5kIjt2PSIyNCIsIkdvb2dsZSBDaHJvbWUiO3Y9IjExNiIaBSJ4ODYiIhAiMTE2LjAuNTg0NS4xODgiKgI/MDoJIldpbmRvd3MiQggiMTUuMC4wIkoEIjY0IlJcIkNocm9taXVtIjt2PSIxMTYuMC41ODQ1LjE4OCIsIk5vdClBO0JyYW5kIjt2PSIyNC4wLjAuMCIsIkdvb2dsZSBDaHJvbWUiO3Y9IjExNi4wLjU4NDUuMTg4IiI=',
    //                 'Content-Type': 'application/json',
    //             }
    //         }
    //     );
    // };

    // async authorize(): Promise<string[]> {
    //     /**
    //      * https://gist.github.com/1234ru/142fcc7edeb5038d49f35356a27e15ec
    //      * https://randomus.ru/password
    //      */

    //     const cookies: string[] = [];

    //     await this.axiosInstance.get('https://passport.yandex.ru/auth').then(async (response) => {
    //         const csrf_token = response.data.match(/"csrf":"([^"]+)"/)[1];
    //         const retpath = response.data.match(/"retpath":"([^"]+)"/)[1];
    //         const process_uuid = response.data.match(/"process_uuid":"([^"]+)"/)[1];

    //         for (const cookie of Array(response.headers['set-cookie'])) {
    //             if (cookie) cookies.push(String(cookie));
    //         };

    //         await this.axiosInstance.post(
    //             'https://passport.yandex.ru/registration-validations/auth/multi_step/start',
    //             new URLSearchParams({
    //                 csrf_token,
    //                 login: 'mihailabortnikov',
    //                 process_uuid,
    //                 retpath
    //             }),
    //             {
    //                 headers: {
    //                     'Content-Type': 'application/json'
    //                 }
    //             }
    //         ).then(async (response) => {
    //             const track_id = response.data.track_id;

    //             await this.axiosInstance.post(
    //                 'https://passport.yandex.ru/registration-validations/auth/multi_step/commit_password',
    //                 new URLSearchParams({
    //                     csrf_token,
    //                     track_id,
    //                     password: '6-gf_kOMuE',
    //                     retpath,
    //                     lang: 'ru'
    //                 })
    //             ).then((response) => {
    //                 console.log('Authorization Headers:\n', response.headers);
    //             })
    //         });
    //     });

    //     return cookies
    // }
}