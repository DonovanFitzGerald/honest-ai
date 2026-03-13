import { router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { route } from 'ziggy-js';
import ChatMessage from '@/components/ui/chat-message';
import AppLayout from '@/layouts/app-layout';

export default function Show({ chat, messages }) {
    const breadcrumbs = [
        { title: chat.title ?? `Chat #${chat.id}`, href: `/chat/${chat.id}` },
    ];
    const [sending, setSending] = useState(false);
    const [awaitingResponse, setAwaitingResponse] = useState(false);

    // Input box handlers
    const [inputText, setinputText] = useState('');
    const handleInputChange = (e) => {
        setinputText(e.target.value);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key !== 'Enter') return;
        e.preventDefault();
        handleInputSubmit(inputText);
    };

    const handleInputSubmit = (content: string) => {
        if (!content.trim() || sending) return;

        router.post(
            route('chats.messages.store', chat.id),
            { content },
            {
                preserveScroll: true,
                onStart: () => setSending(true),
                onFinish: () => setSending(false),
                onSuccess: () => setinputText(''),
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="flex flex-col gap-4 p-4">
                {messages.map((m) => {
                    return <ChatMessage message={m} />;
                })}
            </div>
            <div className="mt-auto flex w-full justify-center p-8">
                <input
                    type="text"
                    className="w-full max-w-lg rounded-3xl border px-6 py-3"
                    id="message-input"
                    placeholder="Ask anything..."
                    onChange={(e) => handleInputChange(e)}
                    onKeyDown={handleKeyDown}
                    value={inputText}
                />
            </div>
        </AppLayout>
    );
}
