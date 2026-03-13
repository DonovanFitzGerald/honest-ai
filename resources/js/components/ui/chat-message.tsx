import * as React from 'react';
import { cn } from '@/lib/utils';
import MarkdownText from './markdown-text';

type Message = {
    id: number;
    chat_id: number;
    role: 'user' | 'assistant' | string;
    content: string;
    sequence: number;
    model?: string | null;
    created_at?: string;
    updated_at?: string;
};

type ChatMessageProps = React.HTMLAttributes<HTMLDivElement> & {
    message: Message;
};

export default function ChatMessage({
    message,
    className,
    ...props
}: ChatMessageProps) {
    const isUser = message.role === 'user';
    const isAssistant = message.role === 'assistant';

    return (
        <div
            data-slot="message-row"
            className={cn(
                'flex w-full',
                isUser ? 'justify-end' : 'justify-start',
            )}
        >
            <div
                data-slot="message"
                {...props}
                className={cn(
                    'w-full rounded-3xl px-6 py-3',
                    isUser && 'max-w-[70%] bg-neutral-100 text-black',
                    !isUser && !isAssistant && 'bg-neutral-200 text-black',
                    className,
                )}
            >
                <div className="w-full">
                    <MarkdownText content={message.content} />
                </div>

                <div className="mt-2 text-[11px] opacity-70">
                    {message.created_at
                        ? new Date(message.created_at).toLocaleString()
                        : ''}
                    {message.model ? ` • ${message.model}` : ''}
                </div>
            </div>
        </div>
    );
}
