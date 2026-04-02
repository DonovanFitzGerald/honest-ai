import { Link } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import { Trash2 } from 'lucide-react';
import { SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import chats from '@/routes/chats';
import type { Chat } from '@/types/assistant';

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
                className={cn('group/chat', isActive ? 'bg-neutral-100' : '')}
            >
                <Link
                    href={chats.show(chat.id).url}
                    prefetch
                    className="flex-1 truncate"
                >
                    {chat.title}
                </Link>

                <a
                    type="button"
                    className="ml-2 hidden cursor-pointer rounded-sm p-1 text-neutral-500 group-hover/chat:inline-flex"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        deleteChat(chat.id);
                    }}
                    title="delete chat"
                >
                    <Trash2 className="h-4 w-4" />
                </a>
            </SidebarMenuButton>
        </SidebarMenuItem>
    );
}
