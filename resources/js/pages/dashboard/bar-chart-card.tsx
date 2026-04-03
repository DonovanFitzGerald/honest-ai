import { ArrowDown, ArrowUp } from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import { createHexGradientArray } from '@/lib/utils';
import type { ChartSeries } from '@/types/dashboard';
import { makeBarData, barChartOptions, sumSeries } from './chart-utils';
import type { WindowStats } from './chart-utils';

function StatRow({
    period,
    actual,
    expected,
}: {
    period: string;
    actual: number;
    expected: number;
}) {
    const delta = actual - expected;
    const isUp = delta >= 0;
    const sign = isUp ? '+' : '';
    const deltaPercent = (delta / expected) * 100;
    const fmt = (n: number) =>
        n >= 1000
            ? `${(n / 1000).toFixed(1)}k`
            : Math.round(n).toLocaleString();

    return (
        <div className="flex flex-col items-center justify-center">
            <span className="text-neutral-400">{period}</span>
            <span className="text-lg font-medium">{fmt(actual)}</span>
            <div className="flex items-center gap-1">
                <span className={'text-sm'}>
                    {sign}
                    {fmt(deltaPercent)}%
                </span>
                {isUp ? (
                    <ArrowUp className="h-4 w-4 text-red-500" />
                ) : (
                    <ArrowDown className="h-4 w-4 text-green-500" />
                )}
            </div>
            <span className="text-sm text-neutral-400">
                avg {fmt(expected)}
            </span>
        </div>
    );
}

export default function BarChartCard({
    label,
    series,
    colorFrom,
    colorTo,
    stats,
}: {
    label: string;
    series: ChartSeries;
    colorFrom: string;
    colorTo: string;
    stats?: WindowStats;
}) {
    const total = sumSeries(series);

    return (
        <div className="flex flex-col gap-2 rounded-xl border border-sidebar-accent p-4">
            <div className="mt-3 flex flex-col items-start justify-center">
                <p className="text-2xl font-bold">
                    {total.toLocaleString()} {label}
                </p>
                <p className="text-sm text-neutral-400">total over period</p>
            </div>
            <Bar
                data={makeBarData(
                    label,
                    series.labels,
                    series.values,
                    createHexGradientArray(
                        colorFrom,
                        colorTo,
                        series.values.length,
                    ),
                )}
                options={barChartOptions}
            />
            {stats && (
                <div className="flex justify-evenly gap-1 pt-3">
                    <StatRow
                        period="24h"
                        actual={stats.last24h}
                        expected={
                            stats.dailyAvg * Math.min(1, stats.daysSinceFirst)
                        }
                    />
                    <StatRow
                        period="7d"
                        actual={stats.last7d}
                        expected={
                            stats.dailyAvg * Math.min(7, stats.daysSinceFirst)
                        }
                    />
                    <StatRow
                        period="365d"
                        actual={stats.last365d}
                        expected={
                            stats.dailyAvg * Math.min(365, stats.daysSinceFirst)
                        }
                    />
                </div>
            )}
        </div>
    );
}
