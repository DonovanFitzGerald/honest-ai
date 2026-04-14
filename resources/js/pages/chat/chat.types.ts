import type { Message } from '@/types/assistant';
import type { BuiltInTool, ThinkingLevel } from '@/types/assistant-models';

export type ChatSendInput = Pick<Message, 'content' | 'model'> & {
    thinkingLevel: ThinkingLevel;
    tools: BuiltInTool[];
};
