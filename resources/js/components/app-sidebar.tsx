import { Link, usePage, router } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, Plus, Trash2 } from 'lucide-react';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';
import chats from '@/routes/chats';
import type { NavItem } from '@/types';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
];

type ChatNavItem = {
    id: number;
    title: string;
    updated_at?: string;
    href: string;
};

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    const { props, url } = usePage<{ sidebarChats?: ChatNavItem[] }>();
    const sidebarChats = props.sidebarChats ?? [];

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

    const currentChatId = (() => {
        const match = url.match(/^\/chats\/(\d+)(?:\/)?(?:\?.*)?$/);
        return match ? Number(match[1]) : null;
    })();

    const deleteChat = (id: number) => {
        router.delete(chats.destroy(id).url, {
            preserveScroll: true,
            onSuccess: () => {
                router.reload({ only: ['sidebarChats'] });
            },
        });
    };

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
                <SidebarGroup className="px-2 py-0">
                    <SidebarMenu>
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
                    </SidebarMenu>
                </SidebarGroup>
                <SidebarMenu>
                    {sidebarChats.map((c) => {
                        const isActive = currentChatId === c.id;
                        return (
                            <SidebarMenuItem key={c.id}>
                                <SidebarMenuButton
                                    className={cn(
                                        'group/chat',
                                        isActive ? 'bg-neutral-100' : '',
                                    )}
                                >
                                    <Link
                                        href={chats.show(c.id).url}
                                        prefetch
                                        className="flex-1 truncate"
                                    >
                                        {c.title}
                                    </Link>

                                    <a
                                        type="button"
                                        className="ml-2 hidden cursor-pointer rounded-sm p-1 text-neutral-500 group-hover/chat:inline-flex"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            deleteChat(c.id);
                                        }}
                                        title="delete chat"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </a>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        );
                    })}
                </SidebarMenu>
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
