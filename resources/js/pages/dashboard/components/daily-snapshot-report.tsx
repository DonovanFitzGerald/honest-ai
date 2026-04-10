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
        <section className="col-span-3 rounded-[28px] border border-sidebar-accent bg-linear-to-br from-emerald-50 via-card to-sky-50 p-6 shadow-sm dark:from-emerald-950 dark:to-sky-950">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-2xl">
                    <p className="text-sm font-medium tracking-[0.25em] text-emerald-700 uppercase dark:text-emerald-200">
                        Daily Snapshot
                    </p>
                    <h1 className="mt-3 text-3xl font-semibold tracking-tight text-neutral-950 sm:text-4xl dark:text-foreground">
                        {dateLabel}
                    </h1>
                    <p className="mt-4 max-w-xl text-base leading-7 text-neutral-600 dark:text-neutral-400">
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
                <div className="grid gap-3 rounded-3xl border border-sidebar-accent bg-card p-5 text-foreground sm:grid-cols-3 lg:min-w-[320px] lg:grid-cols-1">
                    <div>
                        <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
                            Total prompts
                        </p>
                        <p className="mt-2 text-2xl font-semibold">
                            {formatCount(promptStats.allTime)}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
                            Total Tokens
                        </p>
                        <p className="mt-2 text-2xl font-semibold">
                            {formatCount(tokenStats.allTime)}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
                            Logged Cases
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
