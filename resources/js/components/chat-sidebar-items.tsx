import { Link, usePage } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import { Check, Ellipsis, Pencil, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { SidebarMenuItem } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import chats from '@/routes/chats';
import type { Chat } from '@/types/assistant';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuItem,
} from './ui/dropdown-menu';
import { Input } from './ui/input';

export function ChatSidebarItem({
    chat,
    isActive,
    deleteChat,
}: {
    chat: Chat;
    isActive: boolean;
    deleteChat: (id: number) => void;
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(chat.title);
    const [newTitle, setNewTitle] = useState(chat.title);

    const refInput = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditing) {
            refInput.current?.focus();
            refInput.current?.select();
        }
    }, [isEditing]);

    const updateChat = (id: number) => {
        router.put(
            chats.update(id).url,
            { title: newTitle },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setTitle(newTitle);
                    router.reload({ only: ['sidebarChats'] });
                },
            },
        );
    };

    const submitRename = () => {
        if (isEditing) {
            updateChat(chat.id);
        }
        setIsEditing(!isEditing);
        setTitle(newTitle);
    };

    return (
        <SidebarMenuItem key={chat.id}>
            <div
                className={cn(
                    'peer/menu-button group/chat flex w-full items-center gap-0 overflow-hidden rounded-md px-2 py-1.5 text-sm has-data-[state=open]:bg-sidebar-accent',
                    isActive ? 'bg-sidebar-accent' : '',
                    isEditing ? 'bg-sidebar-accent' : '',
                )}
            >
                {isEditing ? (
                    <>
                        <Input
                            ref={refInput}
                            placeholder="Chat title"
                            className="m-0 h-full w-full rounded-none border-0 px-0 shadow-none focus:border-0 focus:shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                            type="text"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    submitRename();
                                }
                            }}
                        />
                        <button
                            className="flex w-8 shrink-0 cursor-pointer items-center justify-center text-sidebar-accent-foreground"
                            onClick={() => submitRename()}
                            aria-label="Confirm rename"
                        >
                            <Check className="ml-auto size-4" />
                        </button>
                    </>
                ) : (
                    <>
                        <Link
                            href={chats.show(chat.id).url}
                            prefetch
                            className="flex-1 truncate"
                        >
                            {title}
                        </Link>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button
                                    className="flex w-0 cursor-pointer items-center justify-center overflow-hidden text-sidebar-accent-foreground transition-[width] group-hover/chat:w-6 data-[state=open]:w-6"
                                    aria-label="Chat options"
                                >
                                    <Ellipsis className="hidden size-4 group-hover/chat:block in-data-[state=open]:block" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                                align="end"
                                side="bottom"
                            >
                                <DropdownMenuItem
                                    className="cursor-pointer"
                                    onClick={() => setIsEditing(true)}
                                >
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Rename
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="cursor-pointer"
                                    onClick={() => deleteChat(chat.id)}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </>
                )}
            </div>
        </SidebarMenuItem>
    );
}

export default function ChatSidebarItems({ items }: { items: Chat[] }) {
    const { url } = usePage();

    const currentChatId = (() => {
        const match = url.match(/^\/chats\/(\d+)(?:\/)?(?:\?.*)?$/);
        return match ? Number(match[1]) : null;
    })();

    const deleteChat = (id: number) => {
        router.delete(chats.destroy(id).url, {
            data: { active_chat_id: currentChatId },
            preserveScroll: true,
            onSuccess: () => {
                router.reload({ only: ['sidebarChats'] });
            },
        });
    };

    return (
        <>
            {items.map((chat) => (
                <ChatSidebarItem
                    key={chat.id}
                    chat={chat}
                    isActive={chat.id === currentChatId}
                    deleteChat={deleteChat}
                />
            ))}
        </>
    );
}
