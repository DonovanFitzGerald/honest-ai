import { Pie } from 'react-chartjs-2';
import { createHexGradientArray } from '@/lib/utils';
import type { ChartSeries } from '@/types/dashboard';
import { makePieData, pieChartOptions } from './chart-utils';

export default function PieChartCard({
    title,
    icon,
    series,
    colorFrom,
    colorTo,
}: {
    title: string;
    icon?: React.ReactNode;
    series: ChartSeries;
    colorFrom: string;
    colorTo: string;
}) {
    return (
        <div className="rounded-xl border border-sidebar-accent p-6">
            <div className="mb-3 flex items-center justify-center gap-2 text-lg font-medium text-neutral-600">
                <h2>{title}</h2>
                {icon}
            </div>
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
                options={pieChartOptions}
            />
            <div className="mb-3 flex flex-col items-center justify-center">
                <h2 className="text-lg font-bold">
                    {series.labels[0]?.charAt(0)?.toUpperCase() +
                        series.labels[0]?.slice(1)}
                </h2>
                <div className="text-md flex items-center justify-center gap-1 text-neutral-400">
                    <p>most common - {series.values[0]}</p>
                </div>
            </div>
        </div>
    );
}
