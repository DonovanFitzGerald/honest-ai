import { Head, usePage } from '@inertiajs/react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import AppLayout from '@/layouts/app-layout';
import { createHexGradientArray } from '@/lib/utils';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

ChartJS.register(ArcElement, Tooltip, Legend);

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
];

type Counts = {
    inputs: { labels: string[]; values: number[] };
    outputs: { labels: string[]; values: number[] };
    roles: { labels: string[]; values: number[] };
};

export default function Dashboard() {
    const { chartCounts } = usePage().props as { chartCounts: Counts };

    const makeData = (
        labels: string[],
        values: number[],
        backgroundColor: string[],
        borderColors?: string[],
    ) => ({
        labels,
        datasets: [
            {
                data: values,
                backgroundColor,
                borderColors,
            },
        ],
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="grid gap-4 p-4 md:grid-cols-3">
                <div className="rounded-xl border p-4">
                    <h2 className="mb-3 text-sm font-medium">Input types</h2>
                    <Pie
                        data={makeData(
                            chartCounts.inputs.labels,
                            chartCounts.inputs.values,
                            createHexGradientArray(
                                '#F2FBF4',
                                '#069971',
                                chartCounts.inputs.values.length,
                            ),
                        )}
                    />
                </div>

                <div className="rounded-xl border p-4">
                    <h2 className="mb-3 text-sm font-medium">Output types</h2>
                    <Pie
                        data={makeData(
                            chartCounts.outputs.labels,
                            chartCounts.outputs.values,
                            createHexGradientArray(
                                '#FFF1F3',
                                '#BF0F35',
                                chartCounts.outputs.values.length,
                            ),
                        )}
                    />
                </div>

                <div className="rounded-xl border p-4">
                    <h2 className="mb-3 text-sm font-medium">
                        Assistant roles
                    </h2>
                    <Pie
                        data={makeData(
                            chartCounts.roles.labels,
                            chartCounts.roles.values,
                            createHexGradientArray(
                                '#FFFBEA',
                                '#E68309',
                                chartCounts.roles.values.length,
                            ),
                        )}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
