import { FastifyInstance } from 'fastify';

import { CompletionProvider, CreateResult, ResolveCreateResult } from '..';

import axios from 'axios';

import { v4 as uuid4 } from 'uuid';

export class Yuanmu extends CompletionProvider {
    url = 'https://chat.yuanmu.tech/';
    working = false;
    hasStream = true;
    // plugins = {
    //     browser_op: {
    //         'name': 'BrowserOp',
    //         'pluginKey': 'BrowserOp',
    //         'description': 'Browse dozens of webpages in one query. Fetch information more efficiently.',
    //         'icon': 'https://openapi-af.op-mobile.opera.com/openapi/testplugin/.well-known/logo.png',
    //         'authConfig': []
    //     },
    //     ai_pdf: {
    //         'name': 'Ai PDF',
    //         'pluginKey': 'Ai_PDF',
    //         'description': 'Super-fast, interactive chats with PDFs of any size, complete with page references for fact checking.',
    //         'icon': 'https://plugin-3c56b9d4c8a6465998395f28b6a445b2-jexkai4vea-uc.a.run.app/logo.png',
    //         'authConfig': []
    //     },
    //     diagrams: {
    //         'name': 'Diagrams',
    //         'pluginKey': 'Diagrams',
    //         'description': 'Create and display diagrams from kroki.io or using networkx and matplotlib.',
    //         'icon': 'https://diagrams.herokuapp.com/static/logo.png',
    //         'authConfig': []
    //     },
    //     dr_thoths_tarot: {
    //         'name': 'Dr. Thoth\'s Tarot',
    //         'pluginKey': 'Dr_Thoths_Tarot',
    //         'description': 'Tarot card novelty entertainment & analysis, by Mnemosyne Labs.',
    //         'icon': 'https://dr-thoth-tarot.herokuapp.com/logo.png',
    //         'authConfig': []
    //     },
    //     dream_interpreter: {
    //         'name': 'Dream Interpreter',
    //         'pluginKey': 'DreamInterpreter',
    //         'description': 'Interprets your dreams using advanced techniques.',
    //         'icon': 'https://dreamplugin.bgnetmobile.com/.well-known/logo.png',
    //         'authConfig': []
    //     },
    //     ai_tool_hunt: {
    //         'name': 'Ai Tool Hunt',
    //         'pluginKey': 'aitoolhunt',
    //         'description': 'Find the perfect AI tools for all your needs, drawn from the most comprehensive global database of AI tools.',
    //         'icon': 'https://www.aitoolhunt.com/images/aitoolhunt_logo.png',
    //         'authConfig': []
    //     },
    //     vox_script: {
    //         'name': 'VoxScript',
    //         'pluginKey': 'VoxScript',
    //         'description': 'Enables searching of YouTube transcripts, financial data sources Google Search results, and more!',
    //         'icon': 'https://voxscript.awt.icu/images/VoxScript_logo_32x32.png',
    //         'authConfig': []
    //     },
    //     ask_your_pdf: {
    //         'name': 'AskYourPDF',
    //         'pluginKey': 'askyourpdf',
    //         'description': 'Unlock the power of your PDFs!, dive into your documents, find answers, and bring information to your fingertips.',
    //         'icon': 'https://plugin.askyourpdf.com/.well-known/logo.png',
    //         'authConfig': []
    //     },
    //     drink_maestro: {
    //         'name': 'Drink Maestro',
    //         'pluginKey': 'drink_maestro',
    //         'description': 'Learn to mix any drink you can imagine (real or made-up), and discover new ones. Includes drink images.',
    //         'icon': 'https://i.imgur.com/6q8HWdz.png',
    //         'authConfig': []
    //     },
    //     image_prompt_enhancer: {
    //         'name': 'Image Prompt Enhancer',
    //         'pluginKey': 'image_prompt_enhancer',
    //         'description': 'Transform your ideas into complex, personalized image generation prompts.',
    //         'icon': 'https://image-prompt-enhancer.gafo.tech/logo.png',
    //         'authConfig': []
    //     },
    //     earth: {
    //         'name': 'Earth',
    //         'pluginKey': 'earthImagesAndVisualizations',
    //         'description': 'Generates a map image based on provided location, tilt and style.',
    //         'icon': 'https://api.earth-plugin.com/logo.png',
    //         'authConfig': []
    //     },
    //     qr_codes: {
    //         'name': 'QR Codes',
    //         'pluginKey': 'qrCodes',
    //         'description': 'Create QR codes.',
    //         'icon': 'https://chatgpt-qrcode-46d7d4ebefc8.herokuapp.com/logo.png',
    //         'authConfig': []
    //     },
    //     rephrase: {
    //         'name': 'Prompt Perfect',
    //         'pluginKey': 'rephrase',
    //         'description': 'Type \'perfect\' to craft the perfect prompt, every time.',
    //         'icon': 'https://promptperfect.xyz/static/prompt_perfect_logo.png',
    //         'authConfig': []
    //     },
    //     uberchord: {
    //         'name': 'Uberchord',
    //         'pluginKey': 'uberchord',
    //         'description': 'Find guitar chord diagrams by specifying the chord name.',
    //         'icon': 'https://guitarchords.pluginboost.com/logo.png',
    //         'authConfig': []
    //     },
    //     scholar_ai: {
    //         'name': 'ScholarAI',
    //         'pluginKey': 'scholarai',
    //         'description': 'Unleash scientific research: search 40M+ peer-reviewed papers, explore scientific PDFs, and save to reference managers.',
    //         'icon': 'https://scholar-ai.net/logo.png',
    //         'authConfig': []
    //     },
    //     web_search: {
    //         'name': 'Web Search',
    //         'pluginKey': 'web_search',
    //         'description': 'Search for information from the internet',
    //         'icon': 'https://websearch.plugsugar.com/200x200.png',
    //         'authConfig': []
    //     },
    //     google: {
    //         'name': 'Google',
    //         'pluginKey': 'google',
    //         'description': 'Use Google Search to find information about the weather, news, sports, and more.',
    //         'icon': 'https://i.imgur.com/SMmVkNB.png',
    //         'authConfig': [
    //             {
    //                 'authField': 'GOOGLE_CSE_ID',
    //                 'label': 'Google CSE ID',
    //                 'description': 'This is your Google Custom Search Engine ID. For instructions on how to obtain this, see <a href=\'https://github.com/danny-avila/LibreChat/blob/main/docs/features/plugins/google_search.md\'>Our Docs</a>.'
    //             },
    //             {
    //                 'authField': 'GOOGLE_API_KEY',
    //                 'label': 'Google API Key',
    //                 'description': 'This is your Google Custom Search API Key. For instructions on how to obtain this, see <a href=\'https://github.com/danny-avila/LibreChat/blob/main/docs/features/plugins/google_search.md\'>Our Docs</a>.'
    //             }
    //         ],
    //         'authenticated': true
    //     },
    //     web_browser: {
    //         'name': 'Browser',
    //         'pluginKey': 'web-browser',
    //         'description': 'Scrape and summarize webpage data',
    //         'icon': '/assets/web-browser.svg',
    //         'authConfig': [
    //             {
    //                 'authField': 'OPENAI_API_KEY',
    //                 'label': 'OpenAI API Key',
    //                 'description': 'Browser makes use of OpenAI embeddings'
    //             }
    //         ],
    //         'authenticated': true
    //     },
    //     calculator: {
    //         'name': 'Calculator',
    //         'pluginKey': 'calculator',
    //         'description': 'Perform simple and complex mathematical calculations.',
    //         'icon': 'https://i.imgur.com/RHsSG5h.png',
    //         'authConfig': []
    //     },
    //     stable_diffusion: {
    //         'name': 'Stable Diffusion',
    //         'pluginKey': 'stable-diffusion',
    //         'description': 'Generate photo-realistic images given any text input.',
    //         'icon': 'https://i.imgur.com/Yr466dp.png',
    //         'authConfig': [
    //             {
    //                 'authField': 'SD_WEBUI_URL',
    //                 'label': 'Your Stable Diffusion WebUI API URL',
    //                 'description': 'You need to provide the URL of your Stable Diffusion WebUI API. For instructions on how to obtain this, see <a href=\'url\'>Our Docs</a>.'
    //             }
    //         ],
    //         'authenticated': true
    //     },
    //     code_interpreter: {
    //         'name': 'Code Interpreter',
    //         'pluginKey': 'codeinterpreter',
    //         'description': '[Experimental] Analyze files and run code online with ease. Requires dockerized python server in /pyserver/',
    //         'icon': '/assets/code.png',
    //         'authConfig': [
    //             {
    //                 'authField': 'OPENAI_API_KEY',
    //                 'label': 'OpenAI API Key',
    //                 'description': 'Gets Code from Open AI API'
    //             }
    //         ],
    //         'authenticated': true
    //     },
    //     code_brew: {
    //         'name': 'CodeBrew',
    //         'pluginKey': 'CodeBrew',
    //         'description': 'Use \'CodeBrew\' to virtually interpret Python, Node, C, C++, Java, C#, PHP, MySQL, Rust or Go code.',
    //         'icon': 'https://imgur.com/iLE5ceA.png',
    //         'authConfig': []
    //     }
    // };

    async *create_completion(
        fastify: FastifyInstance,
        model: string,
        messages: {
            role: 'system' | 'assistant' | 'user' | 'function';
            content: string;
        }[],
        options: {
            temperature: number,
            top_p: number,
            n: number,
            max_tokens: number,
            presence_penalty: number,
            frequency_penalty: number
        }
    ): CreateResult {
        this.fastify = fastify;

        const text = messages.map(message => `\n${message.role}: ${message.content}`).join('');
        let answer = '';

        let authorization = '';

        // const tools: Array<string> = plugins.map(plugin => (this.plugins as any)[plugin]);

        let resolveResponse: ((value: ResolveCreateResult) => void) | undefined;

        if (!authorization)
            authorization = await this.login();

        axios.post('https://chat.yuanmu.tech/api/ask/gptPlugins', {
            'sender': 'User',
            'text': text,
            'current': true,
            'isCreatedByUser': true,
            'parentMessageId': uuid4(),
            'conversationId': uuid4(),
            'messageId': uuid4(),
            'error': false,
            'generation': '',
            'responseMessageId': uuid4(),
            'overrideParentMessageId': null,
            'endpoint': 'gptPlugins',
            'model': model,
            'chatGptLabel': null,
            'promptPrefix': null,
            'temperature': options.temperature,
            'top_p': options.top_p,
            'presence_penalty': options.presence_penalty,
            'frequency_penalty': options.frequency_penalty,
            'tools': [],
            'agentOptions': {
                'agent': 'functions',
                'skipCompletion': true,
                'model': 'gpt-3.5-turbo',
                'temperature': 0
            },
            'key': null,
            'isContinued': false
        }, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + authorization
            },
            responseType: 'stream'
        }).then(async (response) => {
            if (response.status == 401)
                authorization = await this.login();

            response.data.on('data', async (buff: Buffer) => {
                const chunk = Buffer.from(buff).toString('utf-8');
                const lines = chunk.split('\n');

                let eventData = '';
                let jsonData = '';

                for (const line of lines) {
                    if (line.startsWith('event:')) {
                        eventData = line.substring(6).trim();
                    } else if (line.startsWith('data:')) {
                        jsonData = line.substring(5).trim();
                    };
                };

                if (eventData === 'message' && jsonData) {
                    try {
                        const packet = JSON.parse(jsonData);

                        if (packet?.text || packet?.responseMessage) {
                            if (resolveResponse) {
                                resolveResponse({
                                    content: packet?.text?.substring(answer?.length),
                                    isFinal: packet.final,
                                    finish_reason: packet.responseMessage?.finish_reason,
                                    tokens: {
                                        prompt: packet.responseMessage?.promptTokens,
                                        completion: packet.responseMessage?.completionTokens,
                                        total: packet.responseMessage?.promptTokens + packet.responseMessage?.completionTokens
                                    }
                                });
                            };
                        };
                        answer = packet.text;
                    } catch (error) {
                        console.error('Error while parsing SSE message:', error);
                        console.error('SSE message:', chunk);
                    };
                };
            });
        });
        while (true) {
            yield await new Promise<ResolveCreateResult>((resolve) => {
                resolveResponse = resolve;
            });
        };
    };

    async login(): Promise<string> {
        // TODO add validation of response

        const { data } = await axios.post(
            'https://chat.yuanmu.tech/api/auth/login',
            {
                email: 'jhajkssh@gmail.com',
                password: 'qwerty12345'
            },
            {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36'
                }
            }
        );

        return data['token'];
    }
};