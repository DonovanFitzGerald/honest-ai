import { Bar } from 'react-chartjs-2';
import { createHexGradientArray } from '@/lib/utils';
import type { ChartSeries } from '@/types/dashboard';
import { makeBarData, barChartOptions, sumSeries } from './chart-utils';

export default function BarChartCard({
    label,
    series,
    colorFrom,
    colorTo,
}: {
    label: string;
    series: ChartSeries;
    colorFrom: string;
    colorTo: string;
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
        </div>
    );
}
