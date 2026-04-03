import { Head, usePage } from '@inertiajs/react';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    BarElement,
    CategoryScale,
    LinearScale,
    LineElement,
    PointElement,
    Filler,
} from 'chart.js';
import { User, MessageCircleQuestion, MessageCircleReply } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';
import type { AssistantRole } from '@/types/assistant';
import type {
    DashboardAssistantResponseRow,
    DashboardPromptRow,
    DashboardProps,
} from '@/types/dashboard';
import BarChartCard from './bar-chart-card';
import { aggregatePerDay, countValues, computeWindowStats } from './chart-utils';
import EnergyUsageCard from './energy-usage-card';
import PieChartCard from './pie-chart-card';

ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
    BarElement,
    CategoryScale,
    LinearScale,
    LineElement,
    PointElement,
    Filler,
);

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
];

export default function Dashboard() {
    const { cases, prompts, assistantResponses } =
        usePage<DashboardProps>().props;

    const inputCounts = countValues(cases.flatMap((c) => c.input_type ?? []));
    const outputCounts = countValues(cases.flatMap((c) => c.output_type ?? []));
    const roleCounts = countValues(
        cases
            .map((c) => c.assistant_role)
            .filter((role): role is AssistantRole =>
                Boolean(role && role.trim()),
            ),
    );

    const promptsPerDay = aggregatePerDay(
        prompts,
        (prompt: DashboardPromptRow) => prompt.created_at,
        () => 1,
        14,
    );

    const tokensPerDay = aggregatePerDay(
        assistantResponses,
        (response: DashboardAssistantResponseRow) => response.created_at,
        (response: DashboardAssistantResponseRow) =>
            Number(response.tokens ?? 0),
        14,
    );

    const promptStats = computeWindowStats(
        prompts,
        (p: DashboardPromptRow) => p.created_at,
        () => 1,
    );

    const tokenStats = computeWindowStats(
        assistantResponses,
        (r: DashboardAssistantResponseRow) => r.created_at,
        (r: DashboardAssistantResponseRow) => Number(r.tokens ?? 0),
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="grid gap-4 p-4 md:grid-cols-3">
                <PieChartCard
                    title="Input types"
                    icon={<MessageCircleQuestion />}
                    series={inputCounts}
                    colorFrom="#F2FBF4"
                    colorTo="#069971"
                />
                <PieChartCard
                    title="Output types"
                    icon={<MessageCircleReply />}
                    series={outputCounts}
                    colorFrom="#FFF1F3"
                    colorTo="#BF0F35"
                />
                <PieChartCard
                    title="Assistant roles"
                    icon={<User />}
                    series={roleCounts}
                    colorFrom="#FFFBEA"
                    colorTo="#E68309"
                />
            </div>

            <div className="grid gap-4 px-4 pb-4 md:grid-cols-3">
                <BarChartCard
                    label="Prompts"
                    series={promptsPerDay}
                    stats={promptStats}
                    colorFrom="#EAF4FF"
                    colorTo="#2563EB"
                />
                <BarChartCard
                    label="Tokens"
                    series={tokensPerDay}
                    stats={tokenStats}
                    colorFrom="#F3E8FF"
                    colorTo="#7C3AED"
                />
                <EnergyUsageCard tokensPerDay={tokensPerDay} stats={tokenStats} />
            </div>
        </AppLayout>
    );
}
