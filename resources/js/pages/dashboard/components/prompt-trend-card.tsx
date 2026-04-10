import { Activity } from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import { createHexGradientArray } from '@/lib/utils';
import type { ChartSeries } from '@/types/dashboard';
import {
    barChartOptions,
    formatCompact,
    formatCount,
    makeBarData,
    type PeakDay,
} from '../chart-utils';

export function PromptTrendCard({
    promptTrend,
    busiestPromptDay,
    busiestTokenDay,
}: {
    promptTrend: ChartSeries;
    busiestPromptDay: PeakDay | null;
    busiestTokenDay: PeakDay | null;
}) {
    return (
        <section className="rounded-[28px] border border-sidebar-accent bg-white/70 p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <p className="text-sm font-medium tracking-[0.2em] text-neutral-400 uppercase">
                        Prompt Trend
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-950">
                        Last 7 days
                    </h2>
                </div>
                <div className="rounded-full bg-emerald-100 p-2 text-emerald-700">
                    <Activity className="h-5 w-5" />
                </div>
            </div>
            <Bar
                data={makeBarData(
                    'Prompt Trend',
                    promptTrend.labels,
                    promptTrend.values,
                    createHexGradientArray(
                        '#A7F3D0',
                        '#10B981',
                        promptTrend.values.length,
                    ),
                )}
                options={barChartOptions}
            />
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-neutral-50 p-4">
                    <p className="text-xs tracking-[0.2em] text-neutral-400 uppercase">
                        Busiest prompt day
                    </p>
                    <p className="mt-2 text-lg font-semibold text-neutral-950">
                        {busiestPromptDay
                            ? `${busiestPromptDay.label} (${formatCount(busiestPromptDay.value)})`
                            : 'No prompt data yet'}
                    </p>
                </div>
                <div className="rounded-2xl bg-neutral-50 p-4">
                    <p className="text-xs tracking-[0.2em] text-neutral-400 uppercase">
                        Heaviest token day
                    </p>
                    <p className="mt-2 text-lg font-semibold text-neutral-950">
                        {busiestTokenDay
                            ? `${busiestTokenDay.label} (${formatCompact(busiestTokenDay.value)})`
                            : 'No token data yet'}
                    </p>
                </div>
            </div>
        </section>
    );
}
