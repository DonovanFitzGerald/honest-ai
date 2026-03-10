import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';

export default function Show({ chat }) {
    const breadcrumbs = [
        { title: 'Chat', href: '/chat' },
        { title: chat.title ?? `Chat #${chat.id}`, href: `/chat/${chat.id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={chat.title ?? 'Chat'} />
            <div className="p-4">
                <h1 className="text-xl font-semibold">
                    {chat.title ?? `Chat #${chat.id}`}
                </h1>
            </div>
        </AppLayout>
    );
}
