import { encode } from 'gpt-tokenizer';

interface ChatMessage {
  role: string;
  content: string;
};

export const getMessagesTokenCount = (messages: ChatMessage[]) =>
  encode(messages.map((m: ChatMessage) => m.content).join('')).length;