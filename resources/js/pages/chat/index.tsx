import { usePage } from '@inertiajs/react';
import React, { useEffect, useRef, useState } from 'react';
import { route } from 'ziggy-js';
import AlertError from '@/components/alert-error';
import ChatMessage from '@/components/chat-message';
import { UseLogSidebar } from '@/components/use-log-sidebar';
import AppLayout from '@/layouts/app-layout';
import type { Chat, Message, UseLog } from '@/types/assistant';
import type {
    AssistantModelOption,
    BuiltInTool,
    ThinkingLevel,
} from '@/types/assistant-models';
import { redirectToDashboardIfForbidden } from '../auth/redirect';
import ChatBox from './chat-box';

export default function Show({
    chat,
    messages: initialMessages,
    useLog: initialUseLog,
}: {
    chat: Chat;
    messages: Message[];
    useLog: UseLog | null;
}) {
    const { assistantModels } = usePage<{
        assistantModels: AssistantModelOption;
    }>().props;

    const defaultModel = assistantModels.default;

    const breadcrumbs = [
        { title: chat.title ?? `Chat #${chat.id}`, href: `/chats/${chat.id}` },
    ];
    const [inputText, setInputText] = useState('');
    const [messages, setMessages] = useState<Message[]>(initialMessages ?? []);
    const [sending, setSending] = useState(false);
    const [sendErrors, setSendErrors] = useState<string[]>([]);
    const [useLog, setUseLog] = useState<UseLog | null>(
        initialUseLog?.total_use_cases ? initialUseLog : null,
    );

    useEffect(() => {
        setUseLog(initialUseLog?.total_use_cases ? initialUseLog : null);
        setMessages(initialMessages ?? []);
        setSendErrors([]);
        setSending(false);
    }, [assistantModels, chat.id, initialMessages, initialUseLog]);

    const conversationDiv = useRef<HTMLDivElement | null>(null);

    const csrf =
        (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)
            ?.content ?? '';

    const scrollToBottom = (behavior: ScrollBehavior = 'instant') => {
        const el = conversationDiv.current;
        if (!el) return;
        el.scrollTo({ top: el.scrollHeight, behavior });
    };

    useEffect(() => {
        scrollToBottom('smooth');
    }, [messages.length]);

    useEffect(() => {
        scrollToBottom('instant');
    }, []);

    const parseErrorResponse = async (
        response: Response,
    ): Promise<string[]> => {
        const fallbackMessage =
            'We could not send your message. Please try again.';

        if (await redirectToDashboardIfForbidden(response)) {
            return [];
        }

        if (response.status === 419) {
            return [
                'Your session expired. Refresh the page and sign in again before sending another message.',
            ];
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
                    : null;

            const errors = Object.values(payload.errors ?? {}).flatMap(
                (value) => (Array.isArray(value) ? value : [value]),
            );

            if (errors.length > 0) {
                return requestId
                    ? [...errors, `Reference ID: ${requestId}`]
                    : errors;
            }

            if (payload.message) {
                return requestId
                    ? [payload.message, `Reference ID: ${requestId}`]
                    : [payload.message];
            }
        } catch {
            // Fall back to a status-based message when the server returns no JSON body.
        }

        if (response.status === 422) {
            return [
                'Your message could not be sent because the request was invalid.',
            ];
        }

        if (response.status === 429) {
            return [
                'Too many requests were sent. Wait a moment and try again.',
            ];
        }

        if (response.status >= 500) {
            return [
                'The server failed while sending your message. Please try again shortly.',
            ];
        }

        return [fallbackMessage];
    };

    const requestUseLog = async (model: string | null = null) => {
        try {
            const response = await fetch(
                route('chats.use-logs.store', { chat: chat.id }),
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                        'X-CSRF-TOKEN': csrf,
                    },
                    body: JSON.stringify(model ? { model } : {}),
                },
            );

            if (await redirectToDashboardIfForbidden(response)) {
                return;
            }

            if (!response.ok) return;

            const data = await response.json();
            setUseLog(data.parsed);
        } catch (error) {
            console.error(error);
        }
    };

    const handleInputSubmit = async (
        content: string,
        {
            model,
            thinkingLevel,
            tools,
        }: {
            model: string | null;
            thinkingLevel: ThinkingLevel;
            tools: BuiltInTool[];
        },
    ) => {
        const trimmed = content.trim();
        if (!trimmed || sending) return;

        setSending(true);
        setInputText('');
        setSendErrors([]);

        const tempId = Date.now();
        const tempUserMessage: Message = {
            id: tempId,
            chat_id: chat.id,
            role: 'user',
            content: trimmed,
            sequence: Number.MAX_SAFE_INTEGER,
            model: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, tempUserMessage]);

        try {
            const response = await fetch(
                route('chats.messages.store', { chat: chat.id }),
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                        'X-CSRF-TOKEN': csrf,
                    },
                    body: JSON.stringify({
                        content: trimmed,
                        model: model,
                        thinking_level: thinkingLevel,
                        tools: tools,
                    }),
                },
            );

            if (!response.ok) {
                const errors = await parseErrorResponse(response);
                throw new Error(errors.join('\n'));
            }

            const data = await response.json();

            setMessages((prev) => [
                ...prev.filter((m) => m.id !== tempId),
                data.userMessage,
                data.assistantMessage,
            ]);

            const responseModel = data.assistantMessage.model;

            requestUseLog(responseModel);
        } catch (error) {
            setMessages((prev) => prev.filter((m) => m.id !== tempId));
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
                            inputText={inputText}
                            setInputText={setInputText}
                            assistantModels={assistantModels}
                            initialMessages={messages}
                            handleInputSubmit={handleInputSubmit}
                            sendErrors={sendErrors}
                            setSendErrors={setSendErrors}
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
