import type { ChartOptions } from 'chart.js';
import { ArrowDown, ArrowUp, Zap } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import '../chart-utils';
import { formatKillaMetric, type EnergyUsageStats } from '../chart-utils';

const options: ChartOptions<'line'> = {
    responsive: true,
    interaction: {
        intersect: false,
        mode: 'index' as const,
    },
    plugins: {
        legend: { position: 'bottom', labels: { boxWidth: 12, padding: 12 } },
        tooltip: {
            callbacks: {
                label: (ctx) =>
                    `${ctx.dataset.label}: ${formatKillaMetric(ctx.parsed.y ?? 0, 'Wh', 'kWh')}`,
            },
        },
    },
    scales: {
        x: { grid: { display: false }, border: { display: false } },
        y: {
            ticks: { display: false },
            grid: { display: false },
            border: { display: false },
            beginAtZero: true,
        },
    },
};

export default function EnergyUsageCard({
    energyStats,
}: {
    energyStats: EnergyUsageStats;
}) {
    const chartData = {
        labels: energyStats.dailyKwh.labels,
        datasets: [
            {
                label: 'Daily',
                data: energyStats.dailyKwh.values,
                borderColor: '#F25858',
                backgroundColor: 'transparent',
                borderWidth: 1.5,
                borderDash: [4, 3],
                pointRadius: 2,
                fill: false,
                tension: 0,
            },
            {
                label: 'Cumulative',
                data: energyStats.dailyKwhCumulative.values,
                borderColor: '#F25858',
                backgroundColor: '#F2585888',
                borderWidth: 0,
                pointRadius: 0,
                fill: true,
                tension: 0,
            },
        ],
    };

    return (
        <div className="rounded-xl border border-sidebar-accent p-6 shadow-sm">
            <div className="mb-3 flex items-start justify-start gap-2 text-lg font-medium">
                <div className="mt-3 flex flex-col items-start justify-center">
                    <div className="flex items-center gap-2">
                        <p className="text-2xl font-bold">
                            {formatKillaMetric(
                                energyStats.totalKwh,
                                'Wh',
                                'kWh',
                            )}
                        </p>
                        <Zap className="h-5 w-5" />
                    </div>
                    <p className="text-sm text-neutral-400">
                        cumulative over period
                    </p>
                </div>
            </div>
            <Line data={chartData} options={options} />
            <div className="flex justify-evenly pt-3">
                <EnergyStatRow
                    period="24h"
                    actual={energyStats.last24h}
                    expected={
                        energyStats.dailyAvg *
                        Math.min(1, energyStats.daysSinceFirst)
                    }
                />
                <EnergyStatRow
                    period="7d"
                    actual={energyStats.last7d}
                    expected={
                        energyStats.dailyAvg *
                        Math.min(7, energyStats.daysSinceFirst)
                    }
                />
                <EnergyStatRow
                    period="365d"
                    actual={energyStats.last365d}
                    expected={
                        energyStats.dailyAvg *
                        Math.min(365, energyStats.daysSinceFirst)
                    }
                />
            </div>
        </div>
    );
}

function EnergyStatRow({
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
    const deltaPercent = expected > 0 ? (delta / expected) * 100 : 0;
    const sign = isUp ? '+' : '';

    return (
        <div className="flex flex-col items-center justify-center">
            <span className="text-neutral-400">{period}</span>
            <span className="text-lg font-medium">
                {formatKillaMetric(actual, 'Wh', 'kWh')}
            </span>
            <div className="flex items-center gap-1">
                <span className="text-sm">
                    {sign}
                    {Math.round(Math.abs(deltaPercent))}%
                </span>
                {isUp ? (
                    <ArrowUp className="h-4 w-4 text-red-500" />
                ) : (
                    <ArrowDown className="h-4 w-4 text-green-500" />
                )}
            </div>
            <span className="text-sm text-neutral-400">
                avg {formatKillaMetric(expected, 'Wh', 'kWh')}
            </span>
        </div>
    );
}
