import { Zap } from 'lucide-react';
import type { ChartSeries } from '@/types/dashboard';

const tokensPerWattHour = 5000;

interface EnergyUsageCardProps {
    tokensPerDay: ChartSeries;
}

export default function EnergyUsageCard({
    tokensPerDay,
}: EnergyUsageCardProps) {
    const totalKwh = (
        tokensPerDay.values.reduce((a, b) => a + b, 0) /
        tokensPerWattHour /
        1000
    ).toFixed(2);

    return (
        <div className="flex flex-col items-center justify-center rounded-xl border border-sidebar-accent p-4">
            <div className="flex aspect-square h-full flex-col items-center justify-center gap-2 rounded-full border-4 border-[#F25858]">
                <p>Energy Usage</p>
                <p className="text-xl font-bold">{totalKwh} kWh</p>
                <Zap className="h-8 w-8 text-muted-foreground" />
            </div>
        </div>
    );
}
