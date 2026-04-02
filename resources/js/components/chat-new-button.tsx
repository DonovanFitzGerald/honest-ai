import { router } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import chats from '@/routes/chats';

export function ChatNewButton() {
    const createChat = () => {
        router.post(
            chats.store().url,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    router.reload({ only: ['sidebarChats'] });
                },
            },
        );
    };

    return (
        <SidebarMenuItem key="NewChat">
            <SidebarMenuButton
                tooltip="Create a new chat"
                onClick={createChat}
                className="cursor-pointer"
            >
                <Plus className="size-4" />
                <span>New chat</span>
            </SidebarMenuButton>
        </SidebarMenuItem>
    );
}
