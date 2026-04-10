import { Cloud, Droplet, Search } from 'lucide-react';
import { formatKillaMetric, tokensToWattHours } from '../chart-utils';

const EnergyConversions = {
    wattHour: {
        tokens: 5000,
        googleSearch: 4,
        water: 0.02,
        co2: 0.0002,
    },
};

export default function EnergyEquivalentsCard({
    totalTokens,
}: {
    totalTokens: number;
}) {
    const wattHours = tokensToWattHours(totalTokens);
    const googleSearches = wattHours * EnergyConversions.wattHour.googleSearch;
    const water = wattHours * EnergyConversions.wattHour.water;
    const co2 = wattHours * EnergyConversions.wattHour.co2;

    const data: Array<{
        title: string;
        value: string;
        unit: string;
        accentClass: string;
        icon: React.ReactNode;
    }> = [
        {
            title: 'Google Searches',
            value: Math.round(googleSearches).toLocaleString(),
            unit: 'searches',
            accentClass: 'bg-sky-100 text-sky-700',
            icon: <Search className="h-5 w-5" />,
        },
        {
            title: 'Water',
            value:
                water > 1
                    ? water.toFixed(2)
                    : Math.round(water * 1000).toLocaleString(),
            unit: water > 1 ? 'litres' : 'ml',
            accentClass: 'bg-cyan-100 text-cyan-700',
            icon: <Droplet className="h-5 w-5" />,
        },
        {
            title: 'CO2',
            value: co2 > 1 ? co2.toFixed(2) : (co2 * 1000).toFixed(2),
            unit: co2 > 1 ? 'kg' : 'g',
            accentClass: 'bg-rose-100 text-rose-700',
            icon: <Cloud className="h-5 w-5" />,
        },
    ];

    return (
        <section className="overflow-hidden rounded-[28px] border border-sidebar-accent shadow-sm">
            <div className="border-b border-sidebar-accent/70 px-6 py-5">
                <p className="text-xs font-medium tracking-[0.22em] text-neutral-500 uppercase">
                    Energy Equivalents
                </p>
                <div className="mt-3 flex items-end justify-between gap-4">
                    <div>
                        <p className="text-3xl font-semibold tracking-tight text-neutral-950">
                            {formatKillaMetric(wattHours / 1000, 'Wh', 'kWh')}
                        </p>
                        <p className="mt-1 text-sm text-neutral-500">
                            Energy calculated by cumulative assistant responses
                        </p>
                    </div>
                    <div className="rounded-full bg-neutral-950 px-3 py-1 text-xs font-medium tracking-[0.16em] text-white uppercase">
                        Approximate
                    </div>
                </div>
            </div>

            <div className="grid gap-4 p-6 sm:grid-cols-3">
                {data.map((item) => (
                    <EnergyMetricDisplayCard
                        key={item.title}
                        title={item.title}
                        value={item.value}
                        unit={item.unit}
                        accentClass={item.accentClass}
                        icon={item.icon}
                    />
                ))}
            </div>

            <div className="border-t border-sidebar-accent/70 bg-white/60 px-6 py-4">
                <p className="text-sm leading-6 text-neutral-500">
                    These comparisons are directional rather than exact. Model,
                    infrastructure, and datacenter overhead can push the true
                    footprint higher.
                </p>
            </div>
        </section>
    );
}

function EnergyMetricDisplayCard({
    title,
    value,
    unit,
    accentClass,
    icon,
}: {
    title: string;
    value: string;
    unit: string;
    accentClass: string;
    icon: React.ReactNode;
}) {
    return (
        <div className="rounded-2xl border border-sidebar-accent bg-white/85 p-4">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-sm font-medium text-neutral-500">
                        {title}
                    </p>
                </div>
                <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${accentClass}`}
                >
                    {icon}
                </div>
            </div>
            <div className="mt-3 flex items-end gap-2">
                <p className="text-2xl font-semibold tracking-tight text-neutral-950">
                    {value}
                </p>
                <span className="pb-1 text-sm text-neutral-500">{unit}</span>
            </div>
        </div>
    );
}
