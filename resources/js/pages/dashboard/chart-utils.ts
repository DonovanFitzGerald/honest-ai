import type { ChartOptions } from 'chart.js';
import type { ChartSeries, DayBucket } from '@/types/dashboard';

export function sumSeries(series: ChartSeries): number {
    return series.values.reduce((a, b) => a + b, 0);
}

export type WindowStats = {
    last24h: number;
    last7d: number;
    last365d: number;
    dailyAvg: number;
    allTime: number;
    daysSinceFirst: number;
};

export function computeWindowStats<T>(
    rows: T[],
    getCreatedAt: (row: T) => string | null,
    getValue: (row: T) => number,
): WindowStats {
    const now = Date.now();
    let first: number | null = null;
    let allTime = 0,
        last24h = 0,
        last7d = 0,
        last365d = 0;

    for (const row of rows) {
        const raw = getCreatedAt(row);
        if (!raw) continue;
        const ts = new Date(raw).getTime();
        if (Number.isNaN(ts)) continue;

        const v = getValue(row);
        const age = now - ts;

        allTime += v;
        if (first === null || ts < first) first = ts;
        if (age <= 86_400_000) last24h += v;
        if (age <= 7 * 86_400_000) last7d += v;
        if (age <= 365 * 86_400_000) last365d += v;
    }

    const days = first !== null ? Math.max((now - first) / 86_400_000, 1) : 1;
    return {
        last24h,
        last7d,
        last365d,
        dailyAvg: allTime / days,
        allTime,
        daysSinceFirst: days,
    };
}

export function countValues(values: string[]): ChartSeries {
    const counts: Record<string, number> = {};

    for (const value of values) {
        if (!value) continue;
        counts[value] = (counts[value] ?? 0) + 1;
    }

    return Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .reduce(
            (acc, [label, value]) => {
                acc.labels.push(label);
                acc.values.push(value);
                return acc;
            },
            { labels: [] as string[], values: [] as number[] },
        );
}

function formatDayLabel(date: Date): string {
    return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
    });
}

function getDayKey(date: Date): string {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function buildLastNDaysBuckets(days: number): DayBucket[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return Array.from({ length: days }, (_, index) => {
        const date = new Date(today);
        date.setDate(today.getDate() - (days - 1 - index));

        return {
            key: getDayKey(date),
            label: formatDayLabel(date),
        };
    });
}

function toValidDate(value: string | null): Date | null {
    if (!value) return null;

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}

export function aggregatePerDay<T>(
    rows: T[],
    getCreatedAt: (row: T) => string | null,
    getValue: (row: T) => number,
    days = 14,
): ChartSeries {
    const buckets = buildLastNDaysBuckets(days);
    const counts = new Map<string, number>(
        buckets.map((bucket) => [bucket.key, 0]),
    );

    for (const row of rows) {
        const date = toValidDate(getCreatedAt(row));
        if (!date) continue;

        const key = getDayKey(date);
        if (!counts.has(key)) continue;

        counts.set(key, (counts.get(key) ?? 0) + getValue(row));
    }

    return {
        labels: buckets.map((bucket) => bucket.label),
        values: buckets.map((bucket) => counts.get(bucket.key) ?? 0),
    };
}

export function makePieData(
    labels: string[],
    values: number[],
    backgroundColor: string[],
) {
    return {
        labels,
        datasets: [{ data: values, backgroundColor }],
    };
}

export function makeLineData(
    label: string,
    labels: string[],
    values: number[],
    color: string,
) {
    return {
        labels,
        datasets: [
            {
                label,
                data: values,
                borderColor: color,
                backgroundColor: color + '33',
                borderWidth: 2,
                pointRadius: 3,
                pointHoverRadius: 5,
                fill: true,
                tension: 0.4,
            },
        ],
    };
}

export function makeBarData(
    label: string,
    labels: string[],
    values: number[],
    backgroundColor: string[],
) {
    return {
        labels,
        datasets: [
            {
                label,
                data: values,
                backgroundColor,
                borderRadius: 8,
                borderSkipped: false,
                categoryPercentage: 0.9,
                barPercentage: 0.95,
            },
        ],
    };
}

export const barChartOptions = {
    responsive: true,
    interaction: {
        intersect: false,
    },
    plugins: { legend: { display: false } },
    scales: {
        x: { grid: { display: false }, border: { display: false } },
        y: {
            ticks: { display: false },
            grid: { display: false },
            border: { display: false },
        },
    },
};

export const pieChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    layout: {
        padding: 20,
    },
    plugins: {
        legend: {
            position: 'bottom' as const,
            labels: {
                padding: 10,
                boxWidth: 20,
            },
        },
    },
};

export const lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
        x: { grid: { display: false }, border: { display: false } },
        y: {
            ticks: { display: false },
            grid: { display: false },
            border: { display: false },
        },
    },
};
