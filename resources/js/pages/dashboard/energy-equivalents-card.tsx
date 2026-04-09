import { Cloud, Droplet, Search } from 'lucide-react';
import type { WindowStats } from './chart-utils';

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
        <div className="flex">
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
        <div className="flex w-40 flex-col items-center justify-center border">
            {icon}
            <h2>{title}</h2>
            <p>
                {value} {unit}
            </p>
        </div>
    );
}
