import { FileText } from 'lucide-react';
import type { Chat, Message, UseLog } from '@/types/assistant';

function formatUseLogMarkdown(useLog: UseLog, chat: Chat): string {
    const parsed = useLog.parsed;
    const useCases = parsed?.use_cases ?? useLog.use_cases ?? [];
    const summary =
        useLog.summary_statement ?? parsed?.summary_statement ?? 'N/A';

    const lines: string[] = [
        '# AI Use Log',
        '',
        `**Chat Title:** ${chat.title}`,
        `**Report Generated:** ${new Date().toLocaleString()}`,
        `**First Created:** ${new Date(chat.created_at).toLocaleString()}`,
        `**Last Updated:** ${new Date(useLog.created_at).toLocaleString()}`,
        '',
        '## Overview',
        '',
        `- **Total Use Cases:** ${useLog.total_use_cases}`,
        `- **Summary Statement:** ${summary}`,
        '',
        '---',
        '',
        '## Use Cases',
        '',
    ];

    useCases.forEach((useCase, index) => {
        lines.push(`### ${index + 1}. ${useCase.label}`);
        lines.push('');
        lines.push(`- **Evidence:** ${useCase.evidence}`);
        lines.push(`- **Input Type:** ${useCase.input_type.join(', ')}`);
        lines.push(`- **Output Type:** ${useCase.output_type.join(', ')}`);
        lines.push(`- **AI Role:** ${useCase.assistant_role}`);
        lines.push(`- **Confidence:** ${useCase.confidence}`);
        lines.push('');
    });
    return lines.join('\n');
}

function formatUserPromptsMarkdown(messages: Message[], chat: Chat): string {
    const prompts = messages
        .filter((message) => message.role === 'user')
        .sort((a, b) => a.sequence - b.sequence);

    const lines: string[] = [
        '# User Prompts',
        '',
        `**Chat Title:** ${chat.title}`,
        `**Exported Prompts:** ${prompts.length}`,
        `**Report Generated:** ${new Date().toLocaleString()}`,
        `**Last Updated:** ${new Date(messages[messages.length - 1].created_at).toLocaleString()}`,
        '',
        '---',
        '',
    ];

    prompts.forEach((message, index) => {
        lines.push(`## Prompt ${index + 1}`);
        lines.push('');
        lines.push(`- **Sequence:** ${message.sequence}`);
        lines.push(`- **Created:** ${message.created_at}`);
        lines.push('');
        lines.push(message.content);
        lines.push('');
        lines.push('---');
        lines.push('');
    });

    return lines.join('\n');
}

function formatCompleteChatMarkdown(messages: Message[], chat: Chat): string {
    const orderedMessages = [...messages].sort(
        (a, b) => a.sequence - b.sequence,
    );

    const lines: string[] = [
        '# Complete Chat',
        '',
        `**Chat Title:** ${chat.title}`,
        `**Total Messages:** ${orderedMessages.length}`,
        `**Report Generated:** ${new Date().toLocaleString()}`,
        `**First Created:** ${new Date(chat.created_at).toLocaleString()}`,
        `**Last Updated:** ${new Date(messages[messages.length - 1].created_at).toLocaleString()}`,
        '',
        '---',
        '',
    ];

    orderedMessages.forEach((message, index) => {
        lines.push(`## Message ${index + 1}`);
        lines.push('');
        lines.push(`- **Role:** ${message.role}`);
        lines.push(`- **Message ID:** ${message.id}`);
        lines.push(`- **Sequence:** ${message.sequence}`);
        lines.push(`- **Created:** ${message.created_at}`);

        if (message.model) {
            lines.push(`- **Model:** ${message.model}`);
        }

        lines.push('');
        lines.push(message.content);
        lines.push('');
        lines.push('---');
        lines.push('');
    });

    return lines.join('\n');
}

function downloadMarkdown(filename: string, content: string) {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();

    URL.revokeObjectURL(url);
}

export function UseLogDownloadButton({
    useLog,
    chat,
}: {
    useLog: UseLog;
    chat: Chat;
}) {
    return (
        <DownloadButton
            filename={`chat-${chat.id}-use-log.md`}
            content={formatUseLogMarkdown(useLog, chat)}
        >
            <p>Use Log</p>
            <FileText className="h-4 w-4" />
        </DownloadButton>
    );
}

export function UserPromptsDownloadButton({
    messages,
    chat,
}: {
    messages: Message[];
    chat: Chat;
}) {
    return (
        <DownloadButton
            filename={`chat-${chat.id}-user-prompts.md`}
            content={formatUserPromptsMarkdown(messages, chat)}
        >
            <p>User Prompts</p>
            <FileText className="h-4 w-4" />
        </DownloadButton>
    );
}

export function CompleteChatDownloadButton({
    messages,
    chat,
}: {
    messages: Message[];
    chat: Chat;
}) {
    return (
        <DownloadButton
            filename={`chat-${chat.id}-complete-chat.md`}
            content={formatCompleteChatMarkdown(messages, chat)}
        >
            <p>Entire Chat</p>
            <FileText className="h-4 w-4" />
        </DownloadButton>
    );
}

function DownloadButton({
    children,
    filename,
    content,
}: {
    children: React.ReactNode;
    filename: string;
    content: string;
}) {
    return (
        <button
            className="flex cursor-pointer items-center justify-center gap-2 rounded-sm p-2 hover:bg-accent"
            onMouseDown={() => downloadMarkdown(filename, content)}
        >
            {children}
        </button>
    );
}
