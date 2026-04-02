import type { Chat } from '@/types/assistant';
import type { AssistantModelsSharedData } from '@/types/assistant-models';
import type { Auth } from '@/types/auth';

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            sidebarOpen: boolean;
            [key: string]: unknown;
            SidebarChat: Chat[] | null;
            assistantModels: AssistantModelsSharedData;
        };
    }
}
