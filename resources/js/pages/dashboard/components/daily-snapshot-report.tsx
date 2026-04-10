import {
    buildDeltaLabel,
    formatCompact,
    formatPercent,
    formatCount,
} from '../chart-utils';

export default function DailySnapshotReport({
    dateLabel,
    promptStats,
    tokenStats,
    weeklyShare,
    cases,
    responseStats,
}: {
    dateLabel: string;
    promptStats: {
        last24h: number;
        dailyAvg: number;
        allTime: number;
    };
    tokenStats: {
        last24h: number;
        dailyAvg: number;
        allTime: number;
    };
    weeklyShare: number;
    cases: {
        length: number;
    };
    responseStats: {
        last24h: number;
        dailyAvg: number;
        allTime: number;
    };
}) {
    return (
        <section className="col-span-3 rounded-[28px] border border-sidebar-accent bg-linear-to-br from-emerald-50 via-white to-sky-50 p-6 shadow-sm">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-2xl">
                    <p className="text-sm font-medium tracking-[0.25em] text-emerald-700 uppercase">
                        Daily Snapshot
                    </p>
                    <h1 className="mt-3 text-3xl font-semibold tracking-tight text-neutral-950 sm:text-4xl">
                        {dateLabel}
                    </h1>
                    <p className="mt-4 max-w-xl text-base leading-7 text-neutral-600">
                        Prompt volume is{' '}
                        {buildDeltaLabel(
                            promptStats.last24h,
                            promptStats.dailyAvg,
                        ).toLowerCase()}
                        . Responses generated{' '}
                        {formatCompact(tokenStats.last24h)} tokens in the last
                        24 hours, with {formatPercent(weeklyShare)} of this
                        week&apos;s prompt activity arriving today.
                    </p>
                </div>
                <div className="grid gap-3 rounded-3xl bg-neutral-950 p-5 text-white sm:grid-cols-3 lg:min-w-[320px] lg:grid-cols-1">
                    <div>
                        <p className="text-xs tracking-[0.2em] text-white/60 uppercase">
                            Total prompts
                        </p>
                        <p className="mt-2 text-2xl font-semibold">
                            {formatCount(promptStats.allTime)}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs tracking-[0.2em] text-white/60 uppercase">
                            Total responses
                        </p>
                        <p className="mt-2 text-2xl font-semibold">
                            {formatCount(responseStats.allTime)}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs tracking-[0.2em] text-white/60 uppercase">
                            Logged cases
                        </p>
                        <p className="mt-2 text-2xl font-semibold">
                            {formatCount(cases.length)}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
