import { ClipboardTrigger } from '@/components/ui/clipboard';
import MarkdownText from '@/components/ui/markdown-text';
import { cn } from '@/lib/utils';
import type { Message } from '@/types/assistant';

export default function ChatMessage({ message }: { message: Message }) {
    const isUser = message.role === 'user';
    const isAssistant = message.role === 'assistant';

    return (
        <div
            data-slot="message-row "
            className={cn(
                'group/message flex w-full flex-col px-6 py-3',
                isUser ? 'items-end' : 'items-start',
            )}
        >
            <div
                className={cn(
                    'w-full rounded-3xl',
                    isUser && 'max-w-[70%] bg-accent px-6 py-3 text-foreground',
                    !isUser && !isAssistant && 'bg-accent text-foreground',
                )}
                data-slot="message "
            >
                <div className="w-full">
                    <div
                        className="flex items-start gap-2"
                        data-slot="message-content"
                    >
                        <div className="min-w-0 flex-1">
                            {isAssistant ? (
                                <MarkdownText content={message.content} />
                            ) : (
                                <p className="whitespace-pre-wrap">
                                    {message.content}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <div
                className={cn(
                    'mt-2 flex flex-col items-start gap-2 text-[11px] opacity-70',
                    isUser ? 'items-end' : 'items-start',
                )}
            >
                {message.created_at
                    ? new Date(message.created_at).toLocaleString()
                    : ''}
                {message.model ? ` • ${message.model}` : ''}
                <ClipboardTrigger
                    value={message.content}
                    className="opacity-0 transition-opacity ease-in-out group-hover/message:opacity-50 hover:opacity-100"
                />
            </div>
        </div>
    );
}
