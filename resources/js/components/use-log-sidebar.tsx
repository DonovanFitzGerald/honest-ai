import { PanelRightOpen } from 'lucide-react';
import type { UseLog } from '@/types/assistant';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from './ui/collapsible';
import { UseLogDisplay } from './ui/use-log';

export function UseLogSidebar({ useLog }: { useLog: UseLog }) {
    return (
        <div className="overflow-auto">
            <Collapsible>
                {useLog && (
                    <>
                        <CollapsibleTrigger className="absolute top-4 right-8 flex cursor-pointer items-center justify-center gap-1.5 rounded-sm p-1.5 text-sm hover:bg-accent">
                            <span className="flex aspect-square h-6 w-6 items-center justify-center rounded-full border border-accent bg-background">
                                {useLog.total_use_cases}
                            </span>
                            <span>Use Log</span>
                            <PanelRightOpen className="h-4 w-4" />
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <UseLogDisplay useLog={useLog} />
                        </CollapsibleContent>
                    </>
                )}
            </Collapsible>
        </div>
    );
}
