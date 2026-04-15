import { usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import AlertError from '@/components/alert-error';
import ChatMessage from '@/components/chat-message';
import AppLayout from '@/layouts/app-layout';
import { UseLogSidebar } from '@/pages/chat/use-log-sidebar';
import type { Chat, Message, UseLog } from '@/types/assistant';
import type { AssistantModelsSharedData } from '@/types/assistant-models';
import { parseErrorResponse, requestUseLog, sendChatMessage } from './chat.api';
import type { ChatSendInput } from './chat.types';
import ChatBox from './components/chat-box';

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

    const handleInputTextChange = (nextValue: Message['content']) => {
        if (sendErrors.length > 0) {
            setSendErrors([]);
        }

        setInputText(nextValue);
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
            setSending(false);

            setMessages((prev) => [
                ...prev.filter((m) => m.id !== optimisticMessage.id),
                data.userMessage,
                data.assistantMessage,
            ]);
            const nextUseLog = await requestUseLog(chat.id, model, csrfToken);
            if (nextUseLog) {
                setUseLog(nextUseLog);
            }
        } catch (error) {
            setMessages((prev) =>
                prev.filter((message) => message.id !== optimisticMessage.id),
            );

            const errors =
                error instanceof Response
                    ? await parseErrorResponse(error)
                    : ['We could not send your message. Please try again.'];

            if (!errors) {
                return;
            }

            setInputText(trimmed);
            setSendErrors(errors);
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
                            <p className="animate-bounce text-muted-foreground">
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
