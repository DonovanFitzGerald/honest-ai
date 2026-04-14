import { Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { BuiltInTool } from '@/types/assistant-models';

export default function ToolPicker({
    addableToolOptions,
    onAddTool,
    sending,
}: {
    addableToolOptions: BuiltInTool[];
    onAddTool: (tool: BuiltInTool) => void;
    sending: boolean;
}) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    className="h-10 w-10 shrink-0 cursor-pointer rounded-full bg-background"
                    disabled={sending}
                >
                    <Settings2 className="size-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                side="top"
                className="w-56 rounded-lg"
            >
                {addableToolOptions.map((tool) => (
                    <DropdownMenuItem
                        key={tool}
                        className="cursor-pointer rounded-lg capitalize"
                        onClick={() => onAddTool(tool)}
                    >
                        {tool.split('_').join(' ')}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
