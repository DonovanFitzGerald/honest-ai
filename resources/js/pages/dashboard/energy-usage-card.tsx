import type { ChartOptions } from 'chart.js';
import { Zap } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import type { ChartSeries } from '@/types/dashboard';

const tokensPerWattHour = 5000;
const toKwh = (tokens: number) => tokens / tokensPerWattHour / 1000;

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
        },
    },
};

interface EnergyUsageCardProps {
    tokensPerDay: ChartSeries;
}

export default function EnergyUsageCard({
    tokensPerDay,
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
                        <p className="text-2xl font-bold">
                            {totalKwh.toFixed(4)} kWh
                        </p>
                        <Zap className="h-5 w-5" />
                    </div>
                    <p className="text-sm text-neutral-400">
                        cumulative over period
                    </p>
                </div>
            </div>
            <Line data={data} options={options} />
        </div>
    );
}
