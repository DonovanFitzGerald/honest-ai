import { Cloud, Droplet, Search } from 'lucide-react';
import type { WindowStats } from '../chart-utils';

const EnergyConversions = {
    wattHour: {
        tokens: 5000,
        googleSearch: 4, // Non-ai searches
        water: 0.02, // litres
        co2: 0.0002, // kg
    },
};

export default function EnergyEquivalentsCard({
    stats,
}: {
    stats: WindowStats;
}) {
    const totalTokens = stats.allTime;
    const energyCost = totalTokens / EnergyConversions.wattHour.tokens;
    const googleSearches = energyCost * EnergyConversions.wattHour.googleSearch;
    const water = energyCost * EnergyConversions.wattHour.water;
    const co2 = energyCost * EnergyConversions.wattHour.co2;

    const data: {
        title: string;
        value: number;
        unit: string;
        icon: React.ReactNode;
    }[] = [
        {
            title: 'Google Searches',
            value: parseInt(googleSearches.toFixed(0)),
            unit: 'Searches',
            icon: <Search />,
        },
        {
            title: 'Water',
            value:
                water > 1
                    ? parseInt(water.toFixed(2))
                    : parseInt((water * 1000).toFixed(0)),
            unit: water > 1 ? 'Litres' : 'ml',
            icon: <Droplet />,
        },
        {
            title: 'CO2',
            value:
                co2 > 1
                    ? parseInt(co2.toFixed(2))
                    : parseInt((co2 * 1000).toFixed(2)),
            unit: co2 > 1 ? 'kg' : 'g',
            icon: <Cloud />,
        },
    ];

    return (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-sidebar-accent p-6">
            <div className="flex flex-col items-center">
                <p className="font-medium">
                    {energyCost > 1000
                        ? `${(energyCost * 1000).toFixed(0)} kWh`
                        : `${energyCost.toFixed(2)} Wh`}
                </p>
                <p className="text-sm text-neutral-400">is equivalent to...</p>
            </div>
            <div className="grid grid-cols-3 gap-4 border-t border-sidebar-accent">
                {data.map((item) => (
                    <EnergyMetricDisplayCard
                        key={item.title}
                        title={item.title}
                        value={item.value}
                        unit={item.unit}
                        icon={item.icon}
                    />
                ))}
            </div>
            <p className="text-sm text-neutral-400">
                Estimates are conservative. Real costs could be much higher.
            </p>
        </div>
    );
}

function EnergyMetricDisplayCard({
    title,
    value,
    unit,
    icon,
}: {
    title: string;
    value: number;
    unit: string;
    icon: React.ReactNode;
}) {
    return (
        <div className="grid w-full grid-rows-3 items-center justify-center">
            <h2 className="mt-auto w-full py-2 text-center text-lg font-medium text-wrap">
                {title}
            </h2>
            <div className="flex flex-col items-center justify-center">
                <div className="flex aspect-square items-center rounded-lg bg-primary p-4 text-primary-foreground">
                    {icon}
                </div>
            </div>
            <p className="mb-auto py-2 text-center">
                {value} {unit}
            </p>
        </div>
    );
}
