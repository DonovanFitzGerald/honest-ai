import React, { useEffect, useRef, useState } from 'react';
import { route } from 'ziggy-js';
import ChatMessage from '@/components/ui/chat-message';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import AppLayout from '@/layouts/app-layout';

type Message = {
    id: number | string;
    chat_id: number;
    role: string;
    content: string;
    sequence: number;
    model?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
};

type InputType =
    | 'question'
    | 'instructions'
    | 'draft text'
    | 'outline'
    | 'code'
    | 'data'
    | 'image prompt'
    | 'error message'
    | 'reflection notes'
    | 'research topic'
    | 'citation request'
    | 'mixed';

type OutputType =
    | 'explanation'
    | 'summary'
    | 'rewrite'
    | 'ideas'
    | 'outline'
    | 'code'
    | 'debugging help'
    | 'examples'
    | 'feedback'
    | 'grammar correction'
    | 'structure advice'
    | 'citations'
    | 'plan'
    | 'mixed';

type AiRole =
    | 'tutor'
    | 'editor'
    | 'brainstorm partner'
    | 'coding assistant'
    | 'research assistant'
    | 'formatter'
    | 'reviewer';

type Confidence = 'High' | 'Medium' | 'Low';

type UseCase = {
    label: string;
    evidence: string;
    input_type: InputType[];
    output_type: OutputType[];
    ai_role: AiRole;
    confidence: Confidence;
};

type AiUseLog =
    | {
          total_use_cases: number;
          use_cases: UseCase[];
          summary_statement: string;
      }
    | undefined;

export default function Show({ chat, messages: initialMessages }: any) {
    const breadcrumbs = [
        { title: chat.title ?? `Chat #${chat.id}`, href: `/chat/${chat.id}` },
    ];

    const [messages, setMessages] = useState<Message[]>(initialMessages ?? []);
    const [sending, setSending] = useState(false);
    const [inputText, setInputText] = useState('');
    const [useLog, setUseLog] = useState<AiUseLog>(undefined);
    const conversationDiv = useRef<HTMLDivElement | null>(null);

    const csrf =
        (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)
            ?.content ?? '';

    const scrollToBottom = () => {
        const el = conversationDiv.current;
        if (!el) return;
        el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages.length]);

    const requestUseLog = async () => {
        try {
            const response = await fetch(
                route('use-log.store', { chat: chat.id }),
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

        const tempId = `temp-user-${Date.now()}`;
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
                route('chat.messages.store', { chat: chat.id }),
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

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key !== 'Enter') return;
        e.preventDefault();
        handleInputSubmit(inputText);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="flex h-[90vh] flex-row">
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
                        <input
                            type="text"
                            className="w-full rounded-3xl border px-6 py-3 shadow-lg"
                            placeholder="Ask anything..."
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={handleKeyDown}
                            value={inputText}
                            disabled={sending}
                        />
                    </div>
                </div>

                <Collapsible>
                    <CollapsibleTrigger>
                        <h1>CLOSE</h1>
                    </CollapsibleTrigger>
                    {useLog && (
                        <CollapsibleContent>
                            <div className="mx-auto flex max-w-2xl flex-1 flex-col gap-6 p-6">
                                <div className="border-b pb-4">
                                    <h2 className="text-2xl font-bold text-gray-800">
                                        AI Use
                                    </h2>
                                    <p className="mt-2 font-medium text-gray-600">
                                        Total Use Cases:{' '}
                                        {useLog.total_use_cases}
                                    </p>
                                    <p className="mt-2 text-gray-700 italic">
                                        "{useLog.summary_statement}"
                                    </p>
                                </div>

                                <div className="flex flex-col gap-8">
                                    {useLog.use_cases.map((useCase, index) => (
                                        <div
                                            key={index}
                                            className="rounded-lg bg-white"
                                        >
                                            <h3 className="mb-2 text-lg font-semibold">
                                                {useCase.label}
                                            </h3>

                                            <div className="space-y-1 text-sm text-gray-700">
                                                <p>
                                                    <span className="font-bold">
                                                        Evidence:
                                                    </span>
                                                    {useCase.evidence}
                                                </p>
                                                <p>
                                                    <span className="font-bold">
                                                        Role:
                                                    </span>
                                                    {useCase.ai_role}
                                                </p>
                                                <p>
                                                    <span className="font-bold">
                                                        Confidence:
                                                    </span>
                                                    {useCase.confidence}
                                                </p>
                                                <div className="flex gap-4 pt-2">
                                                    <span className="rounded text-xs font-semibold uppercase">
                                                        Input:
                                                        {useCase.input_type.join(
                                                            ', ',
                                                        )}
                                                    </span>
                                                    <span className="rounded text-xs font-semibold uppercase">
                                                        Output:
                                                        {useCase.output_type.join(
                                                            ', ',
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CollapsibleContent>
                    )}
                </Collapsible>
            </div>
        </AppLayout>
    );
}
