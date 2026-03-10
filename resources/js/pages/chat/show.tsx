import { useState } from 'react';
import UserMessage from '@/components/ui/user-message';
import AppLayout from '@/layouts/app-layout';

export default function Show({ chat }) {
    const breadcrumbs = [
        { title: chat.title ?? `Chat #${chat.id}`, href: `/chat/${chat.id}` },
    ];

    const [messages, setMessages] = useState([
        'ipsum dolor sit amet consectetur adipisicing elit. Voluptates, quidem amet obcaecati odio reprehenderit enim ipsam natus temporibus iure maiores vero vitae consequatur harum saepe repellendus minima molestias autem excepturi',
        'ipsum dolor sit amet consectetur adipisicing elit. Voluptates, quidem amet obcaecati odio reprehenderit enim ipsam natus temporibus iure maiores vero vitae consequatur harum saepe repellendus minima molestias autem excepturi',
    ]);

    const [inputText, setinputText] = useState('');
    const handleInputChange = (e) => {
        setinputText(e.target.value);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key !== 'Enter') return;
        e.preventDefault();
        handleMessageSubmit(inputText);
    };

    const handleMessageSubmit = (text) => {
        setMessages((prev) => {
            return [...prev, text];
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="flex flex-col gap-4 p-4">
                {messages.map((m) => {
                    return <UserMessage content={m} />;
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
