import { Check, Copy } from 'lucide-react';
import { useState } from 'react';

export function ClipboardTrigger({
    value,
    className,
    label = 'Copy',
}: {
    value: string;
    className?: string;
    label?: string;
}) {
    const [copied, setCopied] = useState(false);

    const copy = async () => {
        if (!value) return;

        await navigator.clipboard.writeText(value);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
    };

    return (
        <button
            type="button"
            onClick={copy}
            aria-label={copied ? 'Copied' : label}
            className={
                className ??
                'flex cursor-pointer items-center gap-1 rounded-full p-2 transition hover:bg-neutral-200'
            }
        >
            {copied ? (
                <Check className="size-4" />
            ) : (
                <Copy className="size-4 cursor-pointer" />
            )}
        </button>
    );
}
