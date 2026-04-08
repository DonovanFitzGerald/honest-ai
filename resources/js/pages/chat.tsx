import { usePage } from '@inertiajs/react';
import { Send } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { route } from 'ziggy-js';
import AlertError from '@/components/alert-error';
import ChatMessage from '@/components/chat-message';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { UseLogSidebar } from '@/components/use-log-sidebar';
import AppLayout from '@/layouts/app-layout';
import type { Chat, Message, UseLog } from '@/types/assistant';
import type { AssistantModelsSharedData } from '@/types/assistant-models';

const getSelectedModel = (
    messages: Message[],
    assistantModels: AssistantModelsSharedData,
): string => {
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
        assistantModels: AssistantModelsSharedData;
    }>().props;

    const breadcrumbs = [
        { title: chat.title ?? `Chat #${chat.id}`, href: `/chats/${chat.id}` },
    ];

    const [messages, setMessages] = useState<Message[]>(initialMessages ?? []);
    const [sending, setSending] = useState(false);
    const [inputText, setInputText] = useState('');
    const [sendErrors, setSendErrors] = useState<string[]>([]);
    const [selectedModel, setSelectedModel] = useState(
        getSelectedModel(initialMessages ?? [], assistantModels),
    );
    const [useLog, setUseLog] = useState<UseLog | null>(
        initialUseLog?.total_use_cases ? initialUseLog : null,
    );

    useEffect(() => {
        setUseLog(initialUseLog?.total_use_cases ? initialUseLog : null);
        setMessages(initialMessages ?? []);
        setInputText('');
        setSendErrors([]);
        setSelectedModel(
            getSelectedModel(initialMessages ?? [], assistantModels),
        );
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
            if (!response.ok) return;
            const data = await response.json();
            setUseLog(data.parsed);
        } catch (error) {
            console.error(error);
        }
    };

    const handleInputSubmit = async (content: string) => {
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
                        model: selectedModel,
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

            const responseModel =
                typeof data.assistantMessage?.model === 'string'
                    ? data.assistantMessage.model
                    : selectedModel;

            setSelectedModel(responseModel);
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

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key !== 'Enter') return;
        if (e.shiftKey) return;
        e.preventDefault();
        handleInputSubmit(inputText);
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
                        <div className="flex h-full max-h-60 min-h-14 w-full flex-col items-center justify-center gap-4 overflow-y-auto rounded-3xl border border-border p-2 shadow-lg has-focus-within:outline-1 has-focus-within:outline-black">
                            <textarea
                                className="peer/input field-sizing-content w-full resize-none px-4 focus:outline-none"
                                placeholder="Ask anything..."
                                onChange={(e) => {
                                    if (sendErrors.length > 0) {
                                        setSendErrors([]);
                                    }

                                    setInputText(e.target.value);
                                }}
                                onKeyDown={handleKeyDown}
                                value={inputText}
                                disabled={sending}
                            />
                            <div className="flex w-full justify-between peer-placeholder-shown/input:hidden">
                                <div className="w-1/3">
                                    <Select
                                        value={selectedModel}
                                        onValueChange={setSelectedModel}
                                        disabled={sending}
                                    >
                                        <SelectTrigger className="h-11 rounded-2xl bg-background">
                                            <SelectValue placeholder="Choose a model" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {assistantModels.options.map(
                                                (model) => (
                                                    <SelectItem
                                                        key={model.value}
                                                        value={model.value}
                                                    >
                                                        {model.label}
                                                    </SelectItem>
                                                ),
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button
                                    className="flex aspect-square h-10 w-10 cursor-pointer justify-center rounded-full bg-primary text-primary-foreground"
                                    onClick={() => handleInputSubmit(inputText)}
                                    disabled={sending}
                                >
                                    <Send className="size-4" />
                                </Button>
                            </div>
                        </div>
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
