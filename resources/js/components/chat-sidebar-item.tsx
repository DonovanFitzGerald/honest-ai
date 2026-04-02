import { Link } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import { Check, Ellipsis, Pencil, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
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
import { Input } from './ui/input';

export function ChatSidebarItem({
    chat,
    isActive,
}: {
    chat: Chat;
    isActive: boolean;
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

    const deleteChat = (id: number) => {
        router.delete(chats.destroy(id).url, {
            preserveScroll: true,
            onSuccess: () => {
                router.reload({ only: ['sidebarChats'] });
            },
        });
    };

    const submitRename = () => {
        if (isEditing) {
            updateChat(chat.id);
        }
        setIsEditing(!isEditing);
        setTitle(newTitle);
    };

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

    return (
        <SidebarMenuItem key={chat.id}>
            <SidebarMenuButton
                className={cn(
                    'group/chat has-data-[state=open]:bg-sidebar-accent',
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
                        <SidebarMenuButton
                            size="lg"
                            className="group flex w-8 cursor-pointer items-center justify-center text-sidebar-accent-foreground"
                            data-test="sidebar-menu-button"
                            onClick={() => submitRename()}
                        >
                            <Check className="ml-auto size-4" />
                        </SidebarMenuButton>
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
            </SidebarMenuButton>
        </SidebarMenuItem>
    );
}
