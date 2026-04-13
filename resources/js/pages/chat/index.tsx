import { usePage } from '@inertiajs/react';
import React, { useEffect, useRef, useState } from 'react';
import AlertError from '@/components/alert-error';
import ChatMessage from '@/components/chat-message';
import { UseLogSidebar } from '@/components/use-log-sidebar';
import AppLayout from '@/layouts/app-layout';
import chatMessages from '@/routes/chats/messages';
import chatUseLogs from '@/routes/chats/use-logs';
import type { Chat, Message, UseLog } from '@/types/assistant';
import type { AssistantModelsSharedData } from '@/types/assistant-models';
import { redirectToDashboardIfForbidden } from '../auth/redirect';
import ChatBox, { type ChatComposerSubmission } from './chat-box';

export default function Show({
    chat,
    messages: initialMessages,
    useLog: initialUseLog,
}: {
    chat: Chat;
    messages: Message[];
    useLog: UseLog | null;
}) {
    const { assistantModels } = usePage().props;

    const breadcrumbs = [
        { title: chat.title ?? `Chat #${chat.id}`, href: `/chats/${chat.id}` },
    ];
    const [inputText, setInputText] = useState('');
    const [messages, setMessages] = useState<Message[]>(initialMessages ?? []);
    const [sending, setSending] = useState(false);
    const [sendErrors, setSendErrors] = useState<string[]>([]);
    const [useLog, setUseLog] = useState<UseLog | null>(initialUseLog);
    const preferredModel = getPreferredModel(messages, assistantModels);
    const conversationDiv = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        setInputText('');
        setMessages(initialMessages ?? []);
        setUseLog(initialUseLog);
        setSendErrors([]);
        setSending(false);
    }, [chat.id, initialMessages, initialUseLog]);

    const csrfToken =
        (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)
            ?.content ?? '';
    const requestHeaders: HeadersInit = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'X-CSRF-TOKEN': csrfToken,
    };

    const scrollToBottom = (behavior: ScrollBehavior = 'auto') => {
        const el = conversationDiv.current;
        if (!el) return;
        el.scrollTo({ top: el.scrollHeight, behavior });
    };

    useEffect(() => {
        scrollToBottom('smooth');
    }, [messages.length]);

    useEffect(() => {
        scrollToBottom('auto');
    }, []);

    const parseErrorResponse = async (
        response: Response,
    ): Promise<string[] | null> => {
        const fallbackMessage =
            'We could not send your message. Please try again.';
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

            const errors = Object.values(payload.errors ?? {}).flatMap(
                (value) => (Array.isArray(value) ? value : [value]),
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
                [
                    'Your message could not be sent because the request was invalid.',
                ],
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

    const handleInputTextChange = (nextValue: Message['content']) => {
        if (sendErrors.length > 0) {
            setSendErrors([]);
        }

        setInputText(nextValue);
    };

    const requestUseLog = async (
        model: ChatComposerSubmission['model'] = null,
    ) => {
        try {
            const endpoint = chatUseLogs.store(chat);
            const response = await fetch(endpoint.url, {
                method: endpoint.method,
                headers: requestHeaders,
                body: JSON.stringify(model ? { model } : {}),
            });

            if (await redirectToDashboardIfForbidden(response)) {
                return;
            }

            if (!response.ok) return;

            const data = (await response.json()) as {
                useLog: UseLog;
                parsed: NonNullable<UseLog['parsed']>;
            };

            setUseLog({
                ...data.useLog,
                parsed: data.parsed,
            });
        } catch (error) {
            console.error(error);
        }
    };

    const handleInputSubmit = async ({
        content,
        model,
        thinkingLevel,
        tools,
    }: ChatComposerSubmission) => {
        const trimmed = content.trim();
        if (!trimmed || sending) return;

        setSending(true);
        setInputText('');
        setSendErrors([]);

        const optimisticMessage = createOptimisticUserMessage(chat.id, trimmed);

        setMessages((prev) => [...prev, optimisticMessage]);

        try {
            const endpoint = chatMessages.store(chat);
            const response = await fetch(endpoint.url, {
                method: endpoint.method,
                headers: requestHeaders,
                body: JSON.stringify({
                    content: trimmed,
                    model,
                    thinking_level: thinkingLevel,
                    tools,
                }),
            });

            if (!response.ok) {
                const errors = await parseErrorResponse(response);
                if (!errors) {
                    setMessages((prev) =>
                        prev.filter(
                            (message) => message.id !== optimisticMessage.id,
                        ),
                    );
                    return;
                }

                throw new Error(errors.join('\n'));
            }

            const data = (await response.json()) as {
                userMessage: Message;
                assistantMessage: Message;
            };

            setMessages((prev) => [
                ...prev.filter((m) => m.id !== optimisticMessage.id),
                data.userMessage,
                data.assistantMessage,
            ]);

            void requestUseLog(model);
        } catch (error) {
            setMessages((prev) =>
                prev.filter((message) => message.id !== optimisticMessage.id),
            );
            setInputText(trimmed);
            setSendErrors(
                error instanceof Error
                    ? error.message
                          .split('\n')
                          .map((message) => message.trim())
                          .filter(Boolean)
                    : ['We could not send your message. Please try again.'],
            );
            console.error(error);
        } finally {
            setSending(false);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div key={chat.id} className="flex h-[90vh] flex-row">
                <div className="flex w-full flex-col justify-center">
                    {messages.length > 0 && (
                        <div
                            className="flex-1 overflow-auto"
                            ref={conversationDiv}
                        >
                            <div className="mx-auto flex max-w-200 flex-col gap-4 p-4">
                                {messages.map((m) => (
                                    <ChatMessage key={m.id} message={m} />
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="mx-auto flex w-full max-w-200 flex-col items-center justify-center gap-2 px-6 py-8">
                        {sendErrors.length > 0 && (
                            <div className="w-fit">
                                <AlertError
                                    title="Message Not Sent"
                                    errors={sendErrors}
                                />
                            </div>
                        )}
                        {sending && (
                            <p className="animate-bounce text-neutral-400">
                                Awaiting Response...
                            </p>
                        )}

                        <ChatBox
                            initialModel={preferredModel}
                            inputText={inputText}
                            onInputTextChange={handleInputTextChange}
                            assistantModels={assistantModels}
                            onSubmit={handleInputSubmit}
                            sending={sending}
                        />
                    </div>
                </div>
                {useLog && (
                    <UseLogSidebar
                        useLog={useLog}
                        chat={chat}
                        messages={messages}
                    />
                )}
            </div>
        </AppLayout>
    );
}

const appendRequestId = (messages: string[], requestId: string | null) =>
    requestId ? [...messages, `Reference ID: ${requestId}`] : messages;

const createOptimisticUserMessage = (
    chatId: Chat['id'],
    content: Message['content'],
): Message => {
    const timestamp = new Date().toISOString();

    return {
        id: -Date.now(),
        chat_id: chatId,
        role: 'user',
        content,
        sequence: Number.MAX_SAFE_INTEGER,
        model: null,
        created_at: timestamp,
        updated_at: timestamp,
    };
};

const getPreferredModel = (
    messages: Message[],
    assistantModels: AssistantModelsSharedData,
): AssistantModelsSharedData['default'] => {
    const activeModels = new Set(
        assistantModels.options.map((model) => model.value),
    );

    const latestAssistantModel = [...messages]
        .reverse()
        .find(
            (message) =>
                message.role === 'assistant' &&
                typeof message.model === 'string' &&
                activeModels.has(message.model),
        )?.model;

    return latestAssistantModel ?? assistantModels.default;
};
