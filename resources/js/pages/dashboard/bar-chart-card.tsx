import { Bar } from 'react-chartjs-2';
import { createHexGradientArray } from '@/lib/utils';
import type { ChartSeries } from '@/types/dashboard';
import { makeBarData, barChartOptions } from './chart-utils';

interface BarChartCardProps {
    title: string;
    label: string;
    series: ChartSeries;
    colorFrom: string;
    colorTo: string;
}

export default function BarChartCard({
    title,
    label,
    series,
    colorFrom,
    colorTo,
}: BarChartCardProps) {
    return (
        <div className="rounded-xl border border-sidebar-accent p-4">
            <h2 className="mb-3 text-sm font-medium">{title}</h2>
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
        </div>
    );
}
