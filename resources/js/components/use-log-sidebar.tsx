import { FileText, PanelRightOpen } from 'lucide-react';
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
                <CollapsibleTrigger className="absolute top-4 right-8 flex cursor-pointer items-center justify-center gap-1.5 rounded-sm p-1.5 text-sm hover:bg-accent">
                    <span className="flex aspect-square h-6 w-6 items-center justify-center rounded-full border border-accent bg-background">
                        {useLog.total_use_cases}
                    </span>
                    <span>Use Log</span>
                    <PanelRightOpen className="h-4 w-4" />
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <div className="flex flex-col gap-6 border-l border-sidebar-accent p-6">
                        <UseLogDisplay useLog={useLog} />
                        <div>
                            <h2 className="border-b border-sidebar-accent px-2 py-3 text-muted-foreground">
                                Downloads
                            </h2>
                            <div className="flex justify-between py-2">
                                <div className="flex cursor-pointer items-center justify-center gap-2 rounded-sm p-2 hover:bg-accent">
                                    <p>AI Use Log</p>
                                    <FileText className="h-4 w-4" />
                                </div>
                                <div className="flex cursor-pointer items-center justify-center gap-2 rounded-sm p-2 hover:bg-accent">
                                    <p>Complete Chat</p>
                                    <FileText className="h-4 w-4" />
                                </div>
                                <div className="flex cursor-pointer items-center justify-center gap-2 rounded-sm p-2 hover:bg-accent">
                                    <p>User Prompts</p>
                                    <FileText className="h-4 w-4" />
                                </div>
                            </div>
                        </div>
                    </div>
                </CollapsibleContent>
            </Collapsible>
        </div>
    );
}
