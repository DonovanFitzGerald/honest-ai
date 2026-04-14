import { usePage } from '@inertiajs/react';
import React, { useEffect, useRef, useState } from 'react';
import AlertError from '@/components/alert-error';
import ChatMessage from '@/components/chat-message';
import { UseLogSidebar } from '@/components/use-log-sidebar';
import AppLayout from '@/layouts/app-layout';
import type { Chat, Message, UseLog } from '@/types/assistant';
import type { AssistantModelsSharedData } from '@/types/assistant-models';
import { redirectToDashboardIfForbidden } from '../auth/redirect';
import ChatBox from './chat-box';
import { createUseLog, sendChatMessage } from './chat.api';
import type { ChatSendInput } from './chat.types';

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

    const requestUseLog = async (model: ChatSendInput['model'] = null) => {
        try {
            const nextUseLog = await createUseLog(chat.id, model, {
                csrfToken,
            });

            setUseLog(nextUseLog);
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

    const handleInputSubmit = async ({
        content,
        model,
        thinkingLevel,
        tools,
    }: ChatSendInput) => {
        const trimmed = content.trim();
        if (!trimmed || sending) return;

        setSending(true);
        setInputText('');
        setSendErrors([]);

        const optimisticMessage = createOptimisticUserMessage(chat.id, trimmed);

        setMessages((prev) => [...prev, optimisticMessage]);

        try {
            const data = await sendChatMessage(
                chat.id,
                {
                    content: trimmed,
                    model,
                    thinkingLevel,
                    tools,
                },
                {
                    csrfToken,
                },
            );

            setMessages((prev) => [
                ...prev.filter((m) => m.id !== optimisticMessage.id),
                data.userMessage,
                data.assistantMessage,
            ]);

            void requestUseLog(model);
        } catch (error) {
            if (error instanceof Response) {
                const errors = await parseErrorResponse(error);
                if (!errors) {
                    setMessages((prev) =>
                        prev.filter(
                            (message) => message.id !== optimisticMessage.id,
                        ),
                    );
                    return;
                }

                setMessages((prev) =>
                    prev.filter(
                        (message) => message.id !== optimisticMessage.id,
                    ),
                );
                setInputText(trimmed);
                setSendErrors(errors);
                console.error(error);
            } else {
                setMessages((prev) =>
                    prev.filter(
                        (message) => message.id !== optimisticMessage.id,
                    ),
                );
                setInputText(trimmed);
                setSendErrors([
                    'We could not send your message. Please try again.',
                ]);
                console.error(error);
            }
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
