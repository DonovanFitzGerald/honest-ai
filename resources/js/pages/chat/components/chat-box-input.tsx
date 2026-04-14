import type { KeyboardEventHandler } from 'react';
import type { Message } from '@/types/assistant';

export default function ChatBoxInput({
    disabled,
    onChange,
    value,
    onSubmit,
}: {
    disabled: boolean;
    onChange: (text: Message['content']) => void;
    value: Message['content'];
    onSubmit: () => void;
}) {
    const handleKeyDown: KeyboardEventHandler<HTMLTextAreaElement> = (
        event,
    ) => {
        if (event.key !== 'Enter') return;
        if (event.shiftKey) return;
        event.preventDefault();
        onSubmit();
    };

    return (
        <textarea
            className="peer/input field-sizing-content w-full resize-none px-4 focus:outline-none"
            placeholder="Ask anything..."
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={handleKeyDown}
            value={value}
            disabled={disabled}
        />
    );
}
