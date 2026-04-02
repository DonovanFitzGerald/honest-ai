import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
                    pre: (props) => (
                        <pre
                            className="max-h-96 overflow-auto rounded-lg bg-neutral-100 p-4"
                            {...props}
                        />
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
