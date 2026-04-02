import { Check, Copy } from 'lucide-react';
import { type ReactNode, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function extractText(node: ReactNode): string {
    if (typeof node === 'string') return node;
    if (Array.isArray(node)) return node.map(extractText).join('');
    if (node && typeof node === 'object' && 'props' in node) {
        return extractText((node as React.ReactElement).props.children);
    }
    return '';
}

function CopyableCodeBlock({
    children,
    ...props
}: React.ComponentPropsWithoutRef<'pre'>) {
    const [copied, setCopied] = useState(false);

    const copy = () => {
        navigator.clipboard.writeText(extractText(children)).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <>
            <pre
                className="max-h-96 overflow-auto rounded-lg bg-neutral-100 p-4"
                {...props}
            >
                {children}
            </pre>
            <div className="mt-2 flex items-center justify-end">
                <button
                    onClick={copy}
                    className="flex cursor-pointer items-center gap-1 rounded-full p-2 transition-opacity hover:bg-neutral-200"
                    aria-label="Copy code"
                >
                    {copied ? (
                        <Check className="size-4" />
                    ) : (
                        <Copy className="size-4" />
                    )}
                </button>
            </div>
        </>
    );
}

export default function MarkdownText({ content }: { content: string }) {
    return (
        <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    a: (props) => (
                        <a
                            {...props}
                            target="_blank"
                            rel="noreferrer noopener"
                        />
                    ),
                    pre: ({ children, ...props }) => (
                        <CopyableCodeBlock {...props}>
                            {children}
                        </CopyableCodeBlock>
                    ),
                    code: (props) => (
                        <code className="rounded px-1 py-0.5" {...props} />
                    ),
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}
