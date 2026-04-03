import type { ReactNode, ReactElement } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ClipboardTrigger } from '@/components/ui/clipboard';

function extractText(node: ReactNode): string {
    if (typeof node === 'string' || typeof node === 'number') {
        return String(node);
    }

    if (Array.isArray(node)) {
        return node.map(extractText).join('');
    }

    if (node && typeof node === 'object' && 'props' in node) {
        return extractText(
            (node as ReactElement<{ children?: ReactNode }>).props.children,
        );
    }

    return '';
}

function CopyableCodeBlock({
    children,
    ...props
}: React.ComponentPropsWithoutRef<'pre'>) {
    const codeText = extractText(children).replace(/\n$/, '');

    return (
        <div className="relative">
            <pre
                className="max-h-96 overflow-auto rounded-lg bg-neutral-100 p-4"
                {...props}
            >
                {children}
            </pre>

            <div className="mt-2 flex items-center justify-end">
                <ClipboardTrigger
                    value={codeText}
                    className="opacity-50 hover:opacity-100"
                />
            </div>
        </div>
    );
}

export default function MarkdownText({ content }: { content: string }) {
    return (
        <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    h1: (props) => (
                        <h1 {...props} className="mb-2 text-2xl font-bold" />
                    ),
                    h2: (props) => (
                        <h2 {...props} className="mb-2 text-xl font-bold" />
                    ),
                    h3: (props) => (
                        <h3 {...props} className="mb-2 text-lg font-bold" />
                    ),
                    h4: (props) => (
                        <h4 {...props} className="text-md mb-2 font-bold" />
                    ),
                    h5: (props) => (
                        <h5 {...props} className="mb-2 text-sm font-bold" />
                    ),
                    h6: (props) => (
                        <h6 {...props} className="mb-2 text-xs font-bold" />
                    ),
                    ul: (props) => (
                        <ul {...props} className="mb-2 list-disc pl-5" />
                    ),
                    ol: (props) => (
                        <ol {...props} className="mb-2 list-decimal pl-5" />
                    ),
                    li: (props) => <li {...props} className="mb-2" />,
                    p: (props) => <p {...props} className="mb-2" />,
                    blockquote: (props) => (
                        <blockquote
                            {...props}
                            className="mb-2 border-l-4 border-gray-300 pl-4 italic"
                        />
                    ),
                    hr: (props) => (
                        <hr {...props} className="my-4 border-gray-300" />
                    ),
                    table: (props) => (
                        <table
                            {...props}
                            className="mb-2 w-full border-collapse"
                        />
                    ),
                    thead: (props) => (
                        <thead
                            {...props}
                            className="border-b border-gray-300"
                        />
                    ),
                    tbody: (props) => (
                        <tbody
                            {...props}
                            className="border-b border-gray-300"
                        />
                    ),
                    tr: (props) => (
                        <tr {...props} className="border-b border-gray-300" />
                    ),
                    th: (props) => (
                        <th
                            {...props}
                            className="border border-gray-300 px-4 py-2 text-left font-bold"
                        />
                    ),
                    td: (props) => (
                        <td
                            {...props}
                            className="border border-gray-300 px-4 py-2"
                        />
                    ),
                    strong: (props) => (
                        <strong {...props} className="font-bold" />
                    ),
                    em: (props) => <em {...props} className="italic" />,
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
                    code: ({ className, children, ...props }) => (
                        <code
                            {...props}
                            className={`rounded bg-accent px-1 py-0.5 ${className ?? ''}`}
                        >
                            {children}
                        </code>
                    ),
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}
