import chatMessages from '@/routes/chats/messages';
import chatUseLogs from '@/routes/chats/use-logs';
import type { Chat, Message, UseLog } from '@/types/assistant';
import type { ChatSendInput } from './chat.types';

type ChatApiRequestOptions = {
    csrfToken: string;
    signal?: AbortSignal;
};

type SendChatMessageResponse = {
    userMessage: Message;
    assistantMessage: Message;
};

type CreateUseLogResponse = {
    useLog: UseLog;
    parsed: NonNullable<UseLog['parsed']>;
};

const createJsonHeaders = (csrfToken: string): HeadersInit => ({
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    'X-CSRF-TOKEN': csrfToken,
});

const throwIfNotOk = (response: Response): Response => {
    if (!response.ok) {
        throw response;
    }

    return response;
};

export async function sendChatMessage(
    chatId: Chat['id'],
    input: ChatSendInput,
    options: ChatApiRequestOptions,
): Promise<SendChatMessageResponse> {
    const endpoint = chatMessages.store(chatId);
    const response = await fetch(endpoint.url, {
        method: endpoint.method,
        headers: createJsonHeaders(options.csrfToken),
        body: JSON.stringify({
            content: input.content,
            model: input.model,
            thinking_level: input.thinkingLevel,
            tools: input.tools,
        }),
        signal: options.signal,
    });

    return (await throwIfNotOk(response).json()) as SendChatMessageResponse;
}

export async function createUseLog(
    chatId: Chat['id'],
    model: ChatSendInput['model'],
    options: ChatApiRequestOptions,
): Promise<UseLog> {
    const endpoint = chatUseLogs.store(chatId);
    const response = await fetch(endpoint.url, {
        method: endpoint.method,
        headers: createJsonHeaders(options.csrfToken),
        body: JSON.stringify(model ? { model } : {}),
        signal: options.signal,
    });

    const data = (await throwIfNotOk(response).json()) as CreateUseLogResponse;

    return {
        ...data.useLog,
        parsed: data.parsed,
    };
}
