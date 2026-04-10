import { Pie } from 'react-chartjs-2';
import { createHexGradientArray } from '@/lib/utils';
import type { ChartSeries } from '@/types/dashboard';
import {
    capitalizeLabel,
    formatCount,
    makePieData,
    pieChartOptions,
} from '../../chart-utils';

export function BreakdownCard({
    title,
    leadLabel,
    leadValue,
    entries,
    series,
    colorFrom,
    colorTo,
}: {
    title: string;
    leadLabel: string;
    leadValue: number;
    entries: Array<{ label: string; value: number }>;
    series?: ChartSeries;
    colorFrom?: string;
    colorTo?: string;
}) {
    return (
        <div className="rounded-2xl border border-sidebar-accent bg-white/70 p-5 shadow-sm">
            <p className="text-sm font-medium tracking-[0.2em] text-neutral-400 uppercase">
                {title}
            </p>
            <div className="mt-4">
                <p className="text-2xl font-semibold text-neutral-950">
                    {leadLabel}
                </p>
                <p className="mt-1 text-sm text-neutral-500">
                    Leads with {formatCount(leadValue)} logged uses
                </p>
            </div>
            <div className="mt-5 space-y-3">
                {series && series.values.length > 0 && colorFrom && colorTo ? (
                    <div className="mx-auto max-w-[220px]">
                        <Pie
                            data={makePieData(
                                series.labels,
                                series.values,
                                createHexGradientArray(
                                    colorFrom,
                                    colorTo,
                                    series.values.length,
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
                    </div>
                ) : null}
                {entries.length ? (
                    entries.map((entry) => (
                        <div
                            key={`${title}-${entry.label}`}
                            className="flex items-center justify-between gap-3 text-sm"
                        >
                            <span className="text-neutral-600">
                                {capitalizeLabel(entry.label)}
                            </span>
                            <span className="font-medium text-neutral-950">
                                {formatCount(entry.value)}
                            </span>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-neutral-500">
                        No data logged yet.
                    </p>
                )}
            </div>
        </div>
    );
}
