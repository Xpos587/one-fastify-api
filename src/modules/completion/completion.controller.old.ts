// import { FastifyRequest, FastifyReply } from 'fastify';
// import { CreateCompletionInput } from './completion.schema';

// import { getMessagesTokenCount } from '../../utils/tokenizer.util';

// import { completionModels } from '../../models/completion.models';

// import { badRequest, BadRequestError } from '../../utils/badreq.util';

// import { v4 } from 'uuid';
// import md5 from 'md5';

// export async function createCompletionHandler(
//     request: FastifyRequest<{
//         Body: CreateCompletionInput
//     }>,
//     reply: FastifyReply
// ) {
//     await new Promise(async () => {
//         try {
//             const {
//                 model, messages, temperature,
//                 top_p, n, max_tokens,
//                 presence_penalty, frequency_penalty
//             } = request.body;

//             const selectedModel = completionModels[model];

//             badRequest(reply, !!selectedModel, `Model \'${model}\' doesn't exist.`);

//             const provider = new selectedModel.provider();

//             badRequest(reply, !!provider.working, `\'${model}\' on maintenance!`);

//             const cmplId = 'chatcmpl-' + md5(v4());
//             let answer = '';

//             const completionStream = provider.create_completion(
//                 request.server,
//                 selectedModel.id,
//                 messages,
//                 {
//                     temperature,
//                     top_p,
//                     n,
//                     max_tokens,
//                     presence_penalty,
//                     frequency_penalty
//                 }
//             );
//             if (request.body.stream) reply.raw.writeHead(200, { 'Content-Type': 'text/event-stream' });

//             for await (let response of completionStream) {
//                 if (request.body.stream) {
//                     reply.raw.write(`data: ${JSON.stringify({
//                         id: cmplId,
//                         object: 'chat.completion.chunk',
//                         model,
//                         createdAt: Date.now(),
//                         choices: [
//                             {
//                                 index: 0,
//                                 delta: {
//                                     role: 'assistant',
//                                     content: response?.content
//                                 },
//                                 finish_reason: null
//                             }
//                         ]
//                     })}\n\n`);
//                 };
//                 if (response.isFinal) {
//                     const prompt_tokens = response.tokens?.prompt || getMessagesTokenCount(messages);
//                     const completion_tokens = response.tokens?.completion || getMessagesTokenCount([{ role: 'assistant', content: answer }]);
//                     const total_tokens = response.tokens?.total || prompt_tokens + completion_tokens;

//                     if (request.body.stream) {
//                         reply.raw.write(`data: ${JSON.stringify({
//                             id: cmplId,
//                             object: 'chat.completion.chunk',
//                             model,
//                             createdAt: Date.now(),
//                             choices: [{
//                                 index: 0,
//                                 delta: {},
//                                 finish_reason: response.finish_reason
//                             }],
//                             usage: {
//                                 prompt_tokens,
//                                 completion_tokens,
//                                 total_tokens
//                             }
//                         })}\n\n`)
//                         return reply.raw.end('data: [DONE]\n\n');
//                     } else {
//                         return reply
//                             .code(200)
//                             .type('application/json')
//                             .send({
//                                 id: cmplId,
//                                 object: 'chat.completion',
//                                 createdAt: Date.now(),
//                                 model,
//                                 choices: [{
//                                     index: 0,
//                                     message: {
//                                         role: 'assistant',
//                                         content: answer
//                                     },
//                                     finish_reason: response.finish_reason
//                                 }],
//                                 usage: {
//                                     prompt_tokens,
//                                     completion_tokens,
//                                     total_tokens
//                                 }
//                             });
//                     };
//                 };
//                 answer += response.content;
//             };
//         } catch (err) {
//             if (err instanceof BadRequestError) {
//                 return reply.code(400).send({
//                     error: {
//                         message: err.message,
//                         type: 'invalid_request_error',
//                         param: null,
//                         code: null
//                     }
//                 });
//             } else {
//                 reply.code(500).send({
//                     error: {
//                         message: 'Internal Server Error',
//                         type: 'internal_server_error',
//                         param: null,
//                         code: null
//                     }
//                 });
//             };
//         };
//     });
// };