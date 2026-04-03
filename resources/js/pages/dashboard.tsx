import { Head, usePage } from '@inertiajs/react';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    BarElement,
    CategoryScale,
    LinearScale,
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import AppLayout from '@/layouts/app-layout';
import { createHexGradientArray } from '@/lib/utils';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';
import type { AssistantRole } from '@/types/assistant';
import type { DashboardProps, DayBucket, ChartSeries } from '@/types/dashboard';
import { Zap } from 'lucide-react';

ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
    BarElement,
    CategoryScale,
    LinearScale,
);

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
];

function countValues(values: string[]): ChartSeries {
    const counts: Record<string, number> = {};

    for (const value of values) {
        if (!value) continue;
        counts[value] = (counts[value] ?? 0) + 1;
    }

    return Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .reduce(
            (acc, [label, value]) => {
                acc.labels.push(label);
                acc.values.push(value);
                return acc;
            },
            { labels: [] as string[], values: [] as number[] },
        );
}

function makePieData(
    labels: string[],
    values: number[],
    backgroundColor: string[],
) {
    return {
        labels,
        datasets: [
            {
                data: values,
                backgroundColor,
            },
        ],
    };
}

function formatDayLabel(date: Date): string {
    return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
    });
}

function getDayKey(date: Date): string {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function buildLastNDaysBuckets(days: number): DayBucket[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return Array.from({ length: days }, (_, index) => {
        const date = new Date(today);
        date.setDate(today.getDate() - (days - 1 - index));

        return {
            key: getDayKey(date),
            label: formatDayLabel(date),
        };
    });
}

function toValidDate(value: string | null): Date | null {
    if (!value) return null;

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}

function aggregatePerDay<T>(
    rows: T[],
    getCreatedAt: (row: T) => string | null,
    getValue: (row: T) => number,
    days = 14,
): ChartSeries {
    const buckets = buildLastNDaysBuckets(days);
    const counts = new Map<string, number>(
        buckets.map((bucket) => [bucket.key, 0]),
    );

    for (const row of rows) {
        const date = toValidDate(getCreatedAt(row));
        if (!date) continue;

        const key = getDayKey(date);
        if (!counts.has(key)) continue;

        counts.set(key, (counts.get(key) ?? 0) + getValue(row));
    }

    return {
        labels: buckets.map((bucket) => bucket.label),
        values: buckets.map((bucket) => counts.get(bucket.key) ?? 0),
    };
}

function makeBarData(
    label: string,
    labels: string[],
    values: number[],
    backgroundColor: string[],
) {
    return {
        labels,
        datasets: [
            {
                label,
                data: values,
                backgroundColor,
                borderRadius: 8,
                borderSkipped: false,
                categoryPercentage: 0.9,
                barPercentage: 0.95,
            },
        ],
    };
}

const barChartOptions = {
    responsive: true,
    plugins: {
        legend: {
            display: false,
        },
    },
    scales: {
        x: {
            grid: {
                display: false,
            },
            border: {
                display: false,
            },
        },
        y: {
            ticks: {
                display: false,
            },
            grid: {
                display: false,
            },
            border: {
                display: false,
            },
        },
    },
};

const pieChartOptions = {};

const tokensPerWattHour = 5000;

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
        (prompt) => prompt.created_at,
        () => 1,
        14,
    );

    const tokensPerDay = aggregatePerDay(
        assistantResponses,
        (response) => response.created_at,
        (response) => Number(response.tokens ?? 0),
        14,
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="grid gap-4 p-4 md:grid-cols-3">
                <div className="rounded-xl border p-4">
                    <h2 className="mb-3 text-sm font-medium">Input types</h2>
                    <Pie
                        data={makePieData(
                            inputCounts.labels,
                            inputCounts.values,
                            createHexGradientArray(
                                '#F2FBF4',
                                '#069971',
                                inputCounts.values.length,
                            ),
                        )}
                        options={pieChartOptions}
                    />
                </div>

                <div className="rounded-xl border p-4">
                    <h2 className="mb-3 text-sm font-medium">Output types</h2>
                    <Pie
                        data={makePieData(
                            outputCounts.labels,
                            outputCounts.values,
                            createHexGradientArray(
                                '#FFF1F3',
                                '#BF0F35',
                                outputCounts.values.length,
                            ),
                        )}
                        options={pieChartOptions}
                    />
                </div>

                <div className="rounded-xl border p-4">
                    <h2 className="mb-3 text-sm font-medium">
                        Assistant roles
                    </h2>
                    <Pie
                        data={makePieData(
                            roleCounts.labels,
                            roleCounts.values,
                            createHexGradientArray(
                                '#FFFBEA',
                                '#E68309',
                                roleCounts.values.length,
                            ),
                        )}
                        options={pieChartOptions}
                    />
                </div>
            </div>

            <div className="grid gap-4 px-4 pb-4 md:grid-cols-3">
                <div className="rounded-xl border p-4">
                    <h2 className="mb-3 text-sm font-medium">
                        Prompts per day (14 days)
                    </h2>
                    <Bar
                        data={makeBarData(
                            'Prompts',
                            promptsPerDay.labels,
                            promptsPerDay.values,
                            createHexGradientArray(
                                '#EAF4FF',
                                '#2563EB',
                                promptsPerDay.values.length,
                            ),
                        )}
                        options={barChartOptions}
                    />
                </div>

                <div className="rounded-xl border p-4">
                    <h2 className="mb-3 text-sm font-medium">
                        Tokens per day (14 days)
                    </h2>
                    <Bar
                        data={makeBarData(
                            'Tokens',
                            tokensPerDay.labels,
                            tokensPerDay.values,
                            createHexGradientArray(
                                '#F3E8FF',
                                '#7C3AED',
                                tokensPerDay.values.length,
                            ),
                        )}
                        options={barChartOptions}
                    />
                </div>

                <div className="flex flex-col items-center justify-center rounded-xl border p-4">
                    <div className="flex aspect-square h-full flex-col items-center justify-center gap-2 rounded-full border-4 border-[#F25858]">
                        <p>Energy Usage</p>
                        <p className="text-xl font-bold">
                            {(
                                tokensPerDay.values.reduce((a, b) => a + b, 0) /
                                tokensPerWattHour
                            ).toFixed(2)}{' '}
                            kWh
                        </p>
                        <Zap className="h-8 w-8 text-muted-foreground" />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
