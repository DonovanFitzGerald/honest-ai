import { Head, usePage } from '@inertiajs/react';
import { FileText, MessagesSquare, Sparkles, Zap } from 'lucide-react';
import { Pie } from 'react-chartjs-2';
import AppLayout from '@/layouts/app-layout';
import { createHexGradientArray } from '@/lib/utils';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';
import type { AssistantRole } from '@/types/assistant';
import type { DashboardProps } from '@/types/dashboard';
import {
    computeWindowStats,
    countValues,
    formatCount,
    formatCompact,
    capitalizeLabel,
    buildDeltaLabel,
    topEntries,
    makePieData,
    pieChartOptions,
} from './chart-utils';
import DailySnapshotReport from './components/daily-snapshot-report';
import EnergyUsageCard from './components/energy-usage-card';
import { PromptTrendCard } from './components/prompt-trend-card';
import { BreakdownCard } from './components/ui/breakdown-card';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
];

export default function Dashboard() {
    const { cases, prompts, assistantResponses } =
        usePage<DashboardProps>().props;

    const inputCounts = countValues(
        cases.flatMap((item) => item.input_type ?? []),
    );
    const outputCounts = countValues(
        cases.flatMap((item) => item.output_type ?? []),
    );
    const roleCounts = countValues(
        cases
            .map((item) => item.assistant_role)
            .filter((role): role is AssistantRole =>
                Boolean(role && role.trim()),
            ),
    );
    const modelCounts = countValues(
        assistantResponses
            .map((response) => response.model)
            .filter((model): model is string => Boolean(model && model.trim())),
    );

    const promptStats = computeWindowStats(
        prompts,
        (prompt) => prompt.created_at,
        () => 1,
    );
    const responseStats = computeWindowStats(
        assistantResponses,
        (response) => response.created_at,
        () => 1,
    );
    const tokenStats = computeWindowStats(
        assistantResponses,
        (response) => response.created_at,
        (response) => Number(response.tokens ?? 0),
    );

    const avgTokensPerResponse =
        responseStats.last24h > 0
            ? tokenStats.last24h / responseStats.last24h
            : 0;
    const weeklyShare =
        promptStats.last7d > 0
            ? (promptStats.last24h / promptStats.last7d) * 100
            : 0;

    const dateLabel = new Intl.DateTimeFormat(undefined, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    }).format(new Date());

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="space-y-4 p-4">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <DailySnapshotReport
                        dateLabel={dateLabel}
                        promptStats={promptStats}
                        tokenStats={tokenStats}
                        weeklyShare={weeklyShare}
                        cases={cases}
                        responseStats={responseStats}
                    />
                    <PromptTrendCard
                        prompts={prompts}
                        assistantResponses={assistantResponses}
                    />
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <MetricCard
                        title="Prompts in last 24h"
                        value={formatCount(promptStats.last24h)}
                        detail={buildDeltaLabel(
                            promptStats.last24h,
                            promptStats.dailyAvg,
                        )}
                        icon={<FileText className="h-5 w-5" />}
                    />
                    <MetricCard
                        title="Responses in last 24h"
                        value={formatCount(responseStats.last24h)}
                        detail={buildDeltaLabel(
                            responseStats.last24h,
                            responseStats.dailyAvg,
                        )}
                        icon={<MessagesSquare className="h-5 w-5" />}
                    />
                    <MetricCard
                        title="Tokens in last 24h"
                        value={formatCompact(tokenStats.last24h)}
                        detail={buildDeltaLabel(
                            tokenStats.last24h,
                            tokenStats.dailyAvg,
                        )}
                        icon={<Zap className="h-5 w-5" />}
                    />
                    <MetricCard
                        title="Average tokens per response"
                        value={formatCount(avgTokensPerResponse)}
                        detail={
                            responseStats.last24h > 0
                                ? 'Based on responses generated in the last 24 hours'
                                : 'No responses recorded in the last 24 hours'
                        }
                        icon={<Sparkles className="h-5 w-5" />}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
                    <BreakdownCard
                        title="Top input type"
                        leadLabel={capitalizeLabel(
                            inputCounts.labels[0] ?? 'None',
                        )}
                        chart={
                            <Pie
                                data={makePieData(
                                    inputCounts.labels,
                                    inputCounts.values,
                                    createHexGradientArray(
                                        '#A7F3D0',
                                        '#10B981',
                                        inputCounts.values.length,
                                    ),
                                )}
                                options={{
                                    ...pieChartOptions,
                                    plugins: {
                                        legend: {
                                            display: false,
                                        },
                                    },
                                }}
                            />
                        }
                        leadValue={inputCounts.values[0] ?? 0}
                        entries={topEntries(
                            inputCounts.labels,
                            inputCounts.values,
                        )}
                    />
                    <BreakdownCard
                        title="Top output type"
                        leadLabel={capitalizeLabel(
                            outputCounts.labels[0] ?? 'None',
                        )}
                        chart={
                            <Pie
                                data={makePieData(
                                    outputCounts.labels,
                                    outputCounts.values,
                                    createHexGradientArray(
                                        '#FDE68A',
                                        '#F59E0B',
                                        outputCounts.values.length,
                                    ),
                                )}
                                options={{
                                    ...pieChartOptions,
                                    plugins: {
                                        legend: {
                                            display: false,
                                        },
                                    },
                                }}
                            />
                        }
                        leadValue={outputCounts.values[0] ?? 0}
                        entries={topEntries(
                            outputCounts.labels,
                            outputCounts.values,
                        )}
                    />

                    <div className="col-span-2">
                        <EnergyUsageCard
                            tokens={assistantResponses.map((p) => {
                                return {
                                    tokens: p.tokens,
                                    created_at: p.created_at,
                                };
                            })}
                        />
                    </div>

                    <BreakdownCard
                        title="Top assistant role"
                        leadLabel={capitalizeLabel(
                            roleCounts.labels[0] ?? 'None',
                        )}
                        leadValue={roleCounts.values[0] ?? 0}
                        entries={topEntries(
                            roleCounts.labels,
                            roleCounts.values,
                        )}
                    />
                    <BreakdownCard
                        title="Most used model"
                        leadLabel={modelCounts.labels[0] ?? 'None'}
                        leadValue={modelCounts.values[0] ?? 0}
                        entries={topEntries(
                            modelCounts.labels,
                            modelCounts.values,
                        )}
                    />
                </div>
            </div>
        </AppLayout>
    );
}

function MetricCard({
    title,
    value,
    detail,
    icon,
}: {
    title: string;
    value: string;
    detail: string;
    icon: React.ReactNode;
}) {
    return (
        <div className="rounded-2xl border border-sidebar-accent bg-white/70 p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-sm font-medium text-neutral-500">
                        {title}
                    </p>
                    <p className="mt-2 text-3xl font-semibold tracking-tight text-neutral-950">
                        {value}
                    </p>
                </div>
                <div className="rounded-full bg-neutral-950 p-2 text-white">
                    {icon}
                </div>
            </div>
            <p className="mt-3 text-sm text-neutral-500">{detail}</p>
        </div>
    );
}
