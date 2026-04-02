import { Link } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import { Ellipsis, Trash2 } from 'lucide-react';
import { SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import chats from '@/routes/chats';
import type { Chat } from '@/types/assistant';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuItem,
} from './ui/dropdown-menu';

export function ChatSidebarItem({
    chat,
    isActive,
}: {
    chat: Chat;
    isActive: boolean;
}) {
    const deleteChat = (id: number) => {
        router.delete(chats.destroy(id).url, {
            preserveScroll: true,
            onSuccess: () => {
                router.reload({ only: ['sidebarChats'] });
            },
        });
    };

    return (
        <SidebarMenuItem key={chat.id}>
            <SidebarMenuButton
                className={cn(
                    'group/chat has-data-[state=open]:bg-sidebar-accent',
                    isActive ? 'bg-neutral-100' : '',
                )}
            >
                <Link
                    href={chats.show(chat.id).url}
                    prefetch
                    className="flex-1 truncate"
                >
                    {chat.title}
                </Link>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="group flex w-8 cursor-pointer items-center justify-center text-sidebar-accent-foreground"
                            data-test="sidebar-menu-button"
                        >
                            <Ellipsis className="ml-auto size-4" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                        align="end"
                        side="bottom"
                    >
                        <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => deleteChat(chat.id)}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuButton>
        </SidebarMenuItem>
    );
}
