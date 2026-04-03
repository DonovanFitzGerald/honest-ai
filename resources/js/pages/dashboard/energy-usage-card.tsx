import type { ChartOptions } from 'chart.js';
import { ArrowDown, ArrowUp, Zap } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import type { ChartSeries } from '@/types/dashboard';
import type { WindowStats } from './chart-utils';

const tokensPerWattHour = 5000;
const toKwh = (tokens: number) => tokens / tokensPerWattHour / 1000;
const fmtKwh = (kwh: number) =>
    kwh >= 1 ? `${kwh.toFixed(2)} kWh` : `${(kwh * 1000).toFixed(2)} Wh`;

const options: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
        legend: { position: 'bottom', labels: { boxWidth: 12, padding: 12 } },
        tooltip: {
            callbacks: {
                label: (ctx) =>
                    `${ctx.dataset.label}: ${Number(ctx.parsed.y).toFixed(4)} kWh`,
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
            <span className="text-lg font-medium">{fmtKwh(actual)}</span>
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
                avg {fmtKwh(expected)}
            </span>
        </div>
    );
}

interface EnergyUsageCardProps {
    tokensPerDay: ChartSeries;
    stats?: WindowStats;
}

export default function EnergyUsageCard({
    tokensPerDay,
    stats,
}: EnergyUsageCardProps) {
    const dailyKwh = tokensPerDay.values.map(toKwh);

    const cumulativeKwh = dailyKwh.reduce<number[]>((acc, v) => {
        acc.push((acc[acc.length - 1] ?? 0) + v);
        return acc;
    }, []);

    const totalKwh = cumulativeKwh[cumulativeKwh.length - 1] ?? 0;

    const data = {
        labels: tokensPerDay.labels,
        datasets: [
            {
                label: 'Cumulative',
                data: cumulativeKwh,
                borderColor: '#F25858',
                backgroundColor: '#F2585833',
                borderWidth: 2,
                pointRadius: 2,
                fill: true,
                tension: 0.4,
            },
            {
                label: 'Daily',
                data: dailyKwh,
                borderColor: '#F258588A',
                backgroundColor: 'transparent',
                borderWidth: 1.5,
                borderDash: [4, 3],
                pointRadius: 2,
                fill: false,
                tension: 0.4,
            },
        ],
    };

    return (
        <div className="rounded-xl border border-sidebar-accent p-6">
            <div className="mb-3 flex items-start justify-start gap-2 text-lg font-medium">
                <div className="mt-3 flex flex-col items-start justify-center">
                    <div className="flex items-center gap-2">
                        <p className="text-2xl font-bold">{fmtKwh(totalKwh)}</p>
                        <Zap className="h-5 w-5" />
                    </div>
                    <p className="text-sm text-neutral-400">
                        cumulative over period
                    </p>
                </div>
            </div>
            <Line data={data} options={options} />
            {stats && (
                <div className="flex justify-evenly pt-3">
                    <EnergyStatRow
                        period="24h"
                        actual={toKwh(stats.last24h)}
                        expected={toKwh(
                            stats.dailyAvg * Math.min(1, stats.daysSinceFirst),
                        )}
                    />
                    <EnergyStatRow
                        period="7d"
                        actual={toKwh(stats.last7d)}
                        expected={toKwh(
                            stats.dailyAvg * Math.min(7, stats.daysSinceFirst),
                        )}
                    />
                    <EnergyStatRow
                        period="365d"
                        actual={toKwh(stats.last365d)}
                        expected={toKwh(
                            stats.dailyAvg *
                                Math.min(365, stats.daysSinceFirst),
                        )}
                    />
                </div>
            )}
        </div>
    );
}
