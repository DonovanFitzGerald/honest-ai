import { Send } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { route } from 'ziggy-js';
import { Button } from '@/components/ui/button';
import ChatMessage from '@/components/ui/chat-message';
import { UseLogSidebar } from '@/components/use-log-sidebar';
import AppLayout from '@/layouts/app-layout';
import type { Chat, Message, UseLog } from '@/types/assistant';

export default function Show({
    chat,
    messages: initialMessages,
    useLog: initialUseLog,
}: {
    chat: Chat;
    messages: Message[];
    useLog: UseLog;
}) {
    const breadcrumbs = [
        { title: chat.title ?? `Chat #${chat.id}`, href: `/chats/${chat.id}` },
    ];

    const [messages, setMessages] = useState<Message[]>(initialMessages ?? []);
    const [sending, setSending] = useState(false);
    const [inputText, setInputText] = useState('');
    const [useLog, setUseLog] = useState<UseLog>(initialUseLog);
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

    useEffect(() => {
        setMessages(initialMessages ?? []);
        setInputText('');
        setSending(false);
    }, [chat.id, initialMessages]);

    const requestUseLog = async () => {
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
                },
            );
            if (!response.ok) return;
            const data = await response.json();
            setUseLog(data.parsed);
        } catch (error) {
            console.error(error);
        } finally {
            console.log(useLog);
        }
    };

    const handleInputSubmit = async (content: string) => {
        const trimmed = content.trim();
        if (!trimmed || sending) return;

        setSending(true);
        setInputText('');

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
                    body: JSON.stringify({ content: trimmed }),
                },
            );

            if (!response.ok) throw new Error('Failed to send message');

            const data = await response.json();

            setMessages((prev) => [
                ...prev.filter((m) => m.id !== tempId),
                data.userMessage,
                data.assistantMessage,
            ]);

            requestUseLog();
        } catch (error) {
            setMessages((prev) => prev.filter((m) => m.id !== tempId));
            setInputText(trimmed);
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
                <div className="flex w-full flex-col">
                    <div className="flex-1 overflow-auto" ref={conversationDiv}>
                        <div className="mx-auto flex max-w-3xl flex-col gap-4 p-4">
                            {messages.map((m) => (
                                <ChatMessage key={m.id} message={m} />
                            ))}
                        </div>
                    </div>

                    <div className="mx-auto flex w-full max-w-3xl flex-col items-center justify-center gap-2 px-6 py-8">
                        {sending && (
                            <p className="animate-bounce text-neutral-400">
                                Awaiting Response...
                            </p>
                        )}
                        <div className="flex h-full max-h-60 min-h-14 w-full flex-col items-center justify-center gap-2 overflow-y-auto rounded-3xl border border-border p-2 shadow-lg has-focus-within:outline-1 has-focus-within:outline-black">
                            <textarea
                                className="peer/input field-sizing-content w-full resize-none px-4 focus:outline-none"
                                placeholder="Ask anything..."
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyDown={handleKeyDown}
                                value={inputText}
                                disabled={sending}
                            />
                            <div className="flex w-full justify-end peer-placeholder-shown/input:hidden">
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
                <UseLogSidebar useLog={useLog} />
            </div>
        </AppLayout>
    );
}
