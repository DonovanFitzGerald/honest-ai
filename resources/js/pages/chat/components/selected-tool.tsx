import { X } from 'lucide-react';
import type { BuiltInTool } from '@/types/assistant-models';

export default function SelectedTool({
    disabled,
    onRemoveTool,
    tool,
}: {
    disabled: boolean;
    onRemoveTool: (tool: BuiltInTool) => void;
    tool: BuiltInTool;
}) {
    return (
        <div className="flex items-center gap-2 rounded-2xl border border-border bg-accent px-3 py-2 text-sm shadow-sm">
            <p className="text-accent-foreground capitalize">
                {tool.split('_').join(' ')}
            </p>
            <button
                type="button"
                className="flex size-5 cursor-pointer items-center justify-center rounded-full text-accent-foreground capitalize transition-colors hover:bg-accent hover:text-accent-foreground"
                onClick={() => onRemoveTool(tool)}
                disabled={disabled}
                aria-label={`Remove ${tool.split('_').join(' ')}`}
            >
                <X className="size-4" />
            </button>
        </div>
    );
}
