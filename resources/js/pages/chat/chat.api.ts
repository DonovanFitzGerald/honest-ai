import chatMessages from '@/routes/chats/messages';
import chatUseLogs from '@/routes/chats/use-logs';
import type { Chat, Message, UseLog } from '@/types/assistant';
import { redirectToDashboardIfForbidden } from '../auth/redirect';
import type { ChatSendInput } from './chat.types';

type ChatApiRequestOptions = {
    csrfToken: string;
    signal?: AbortSignal;
};

type JsonEndpoint = {
    method: string;
    url: string;
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

const postJson = async <T>(
    endpoint: JsonEndpoint,
    body: Record<string, unknown>,
    options: ChatApiRequestOptions,
): Promise<T> => {
    const response = await fetch(endpoint.url, {
        method: endpoint.method,
        headers: createJsonHeaders(options.csrfToken),
        body: JSON.stringify(body),
        signal: options.signal,
    });

    return (await throwIfNotOk(response).json()) as T;
};

async function sendChatMessage(
    chatId: Chat['id'],
    input: ChatSendInput,
    options: ChatApiRequestOptions,
): Promise<SendChatMessageResponse> {
    return postJson<SendChatMessageResponse>(
        chatMessages.store(chatId),
        {
            content: input.content,
            model: input.model,
            thinking_level: input.thinkingLevel,
            tools: input.tools,
        },
        options,
    );
}

const parseErrorResponse = async (
    response: Response,
): Promise<string[] | null> => {
    const fallbackMessage = 'We could not send your message. Please try again.';
    const responseRequestId = response.headers.get('X-Request-Id');

    if (await redirectToDashboardIfForbidden(response)) {
        return null;
    }

    if (response.status === 419) {
        return appendRequestId(
            [
                'Your session expired. Refresh the page and sign in again before sending another message.',
            ],
            responseRequestId,
        );
    }

    try {
        const payload = (await response.json()) as {
            message?: string;
            errors?: Record<string, string[] | string>;
            request_id?: string;
        };
        const requestId =
            typeof payload.request_id === 'string'
                ? payload.request_id
                : responseRequestId;

        const errors = Object.values(payload.errors ?? {}).flatMap((value) =>
            Array.isArray(value) ? value : [value],
        );

        if (errors.length > 0) {
            return appendRequestId(errors, requestId);
        }

        if (payload.message) {
            return appendRequestId([payload.message], requestId);
        }
    } catch {
        // Fall back to a status-based message when the server returns no JSON body.
    }

    if (response.status === 422) {
        return appendRequestId(
            ['Your message could not be sent because the request was invalid.'],
            responseRequestId,
        );
    }

    if (response.status === 429) {
        return appendRequestId(
            ['Too many requests were sent. Wait a moment and try again.'],
            responseRequestId,
        );
    }

    if (response.status >= 500) {
        return appendRequestId(
            [
                'The server failed while sending your message. Please try again shortly.',
            ],
            responseRequestId,
        );
    }

    return appendRequestId([fallbackMessage], responseRequestId);
};

const appendRequestId = (messages: string[], requestId: string | null) =>
    requestId ? [...messages, `Reference ID: ${requestId}`] : messages;

const requestUseLog = async (
    chatId: Chat['id'],
    model: ChatSendInput['model'],
    csrfToken: string,
) => {
    try {
        const data = await postJson<CreateUseLogResponse>(
            chatUseLogs.store(chatId),
            model ? { model } : {},
            { csrfToken },
        );

        return {
            ...data.useLog,
            parsed: data.parsed,
        };
    } catch (error) {
        if (
            error instanceof Response &&
            (await redirectToDashboardIfForbidden(error))
        ) {
            return;
        }

        console.error(error);
    }
};

export { requestUseLog, sendChatMessage, parseErrorResponse };
