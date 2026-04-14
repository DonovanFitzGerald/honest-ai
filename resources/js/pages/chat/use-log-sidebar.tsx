import { PanelRightOpen } from 'lucide-react';
import type { Chat, Message, UseLog } from '@/types/assistant';
import {
    CompleteChatDownloadButton,
    UserPromptsDownloadButton,
    UseLogDownloadButton,
} from './components/chat-download-buttons';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '../../components/ui/collapsible';
import { UseLogDisplay } from '../../components/use-log';

export function UseLogSidebar({
    useLog,
    chat,
    messages,
}: {
    useLog: UseLog;
    chat: Chat;
    messages: Message[];
}) {
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
                    <div className="flex h-full flex-col gap-6 border-l border-sidebar-accent p-6">
                        <UseLogDisplay useLog={useLog} />
                    </div>
                    <div className="sticky bottom-0 rounded-md border-l border-sidebar bg-background px-6">
                        <h2 className="border-b border-accent px-2 py-3 text-muted-foreground">
                            Downloads
                        </h2>
                        <div className="flex flex-col items-start gap-2 py-2 md:flex-row">
                            <UseLogDownloadButton useLog={useLog} chat={chat} />
                            <CompleteChatDownloadButton
                                chat={chat}
                                messages={messages}
                            />
                            <UserPromptsDownloadButton
                                messages={messages}
                                chat={chat}
                            />
                        </div>
                    </div>
                </CollapsibleContent>
            </Collapsible>
        </div>
    );
}
