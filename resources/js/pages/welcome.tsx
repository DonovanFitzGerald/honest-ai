import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    BarChart3,
    Leaf,
    MessageSquareText,
    Sparkles,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { dashboard, home, login, register } from '@/routes';

const featureCards = [
    {
        title: 'Track every conversation',
        description:
            'Keep prompts and assistant responses together so work stays reviewable and easy to revisit.',
        icon: MessageSquareText,
        accent: 'from-[#EAF4FF] to-[#2563EB]',
    },
    {
        title: 'Turn usage into evidence',
        description:
            'Capture structured use logs that support reflection, accountability, and academic reporting.',
        icon: Sparkles,
        accent: 'from-[#FFF1F3] to-[#BF0F35]',
    },
    {
        title: 'Read the impact clearly',
        description:
            'See prompt counts, token trends, assistant roles, and energy equivalents from one dashboard.',
        icon: Leaf,
        accent: 'from-[#F2FBF4] to-[#069971]',
    },
];

const overviewMetrics = [
    {
        label: 'Prompt activity',
        value: 'Daily and long-term usage patterns',
        tone: 'bg-[#EAF4FF] text-[#1D4ED8]',
    },
    {
        label: 'Use logs',
        value: 'Context for why and how AI was used',
        tone: 'bg-[#FFF1F3] text-[#BE123C]',
    },
    {
        label: 'Energy view',
        value: 'Estimated environmental cost per workflow',
        tone: 'bg-[#F2FBF4] text-[#047857]',
    },
];

export default function Welcome({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    const { auth, name } = usePage().props;
    const isAuthenticated = Boolean(auth.user);

    return (
        <>
            <Head title="Welcome" />

            <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
                <div className="absolute inset-x-0 top-0 -z-10 h-[28rem] bg-[radial-gradient(circle_at_top,_rgba(239,68,68,0.12),_transparent_55%)]" />
                <div className="absolute right-[-8rem] bottom-[-10rem] -z-10 h-80 w-80 rounded-full bg-[rgba(37,99,235,0.08)] blur-3xl" />
                <div className="absolute top-40 left-[-6rem] -z-10 h-72 w-72 rounded-full bg-[rgba(6,153,113,0.08)] blur-3xl" />

                <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-6 lg:px-8">
                    <header className="flex items-center justify-between gap-4">
                        <Link href={home()} className="flex items-center gap-3">
                            <AppLogo />
                            <div>
                                <p className="text-sm font-semibold tracking-tight">
                                    {name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    AI activity tracking
                                </p>
                            </div>
                        </Link>

                        <nav className="flex items-center gap-2">
                            {isAuthenticated ? (
                                <Button asChild>
                                    <Link href={dashboard()}>
                                        Open dashboard
                                        <ArrowRight />
                                    </Link>
                                </Button>
                            ) : (
                                <>
                                    <Button variant="ghost" asChild>
                                        <Link href={login()}>Log in</Link>
                                    </Button>
                                    {canRegister && (
                                        <Button asChild>
                                            <Link href={register()}>
                                                Create account
                                            </Link>
                                        </Button>
                                    )}
                                </>
                            )}
                        </nav>
                    </header>

                    <main className="flex flex-1 items-center py-12 lg:py-16">
                        <div className="grid w-full gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-12">
                            <section className="flex flex-col justify-center">
                                <Badge
                                    variant="outline"
                                    className="mb-4 rounded-full px-3 py-1 text-sm"
                                >
                                    Built for transparency
                                </Badge>

                                <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
                                    See how AI is used, logged, and measured in
                                    one place.
                                </h1>

                                <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                                    {name} combines conversation history, use
                                    logs, and dashboard reporting so students
                                    and teams can review prompts, analyse
                                    response patterns, and understand the cost
                                    of AI-assisted work.
                                </p>

                                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                    <Button size="lg" asChild>
                                        <Link
                                            href={
                                                isAuthenticated
                                                    ? dashboard()
                                                    : canRegister
                                                      ? register()
                                                      : login()
                                            }
                                        >
                                            {isAuthenticated
                                                ? 'Go to dashboard'
                                                : canRegister
                                                  ? 'Get started'
                                                  : 'Log in'}
                                            <ArrowRight />
                                        </Link>
                                    </Button>

                                    {!isAuthenticated && (
                                        <Button
                                            size="lg"
                                            variant="outline"
                                            asChild
                                        >
                                            <Link href={login()}>
                                                View existing account
                                            </Link>
                                        </Button>
                                    )}
                                </div>

                                <div className="mt-10 grid gap-4 sm:grid-cols-3">
                                    <Card className="border-border/70 bg-card/80 py-0 backdrop-blur">
                                        <CardContent className="p-5">
                                            <p className="text-sm text-muted-foreground">
                                                Conversations
                                            </p>
                                            <p className="mt-2 text-lg font-semibold">
                                                Centralised chat history
                                            </p>
                                        </CardContent>
                                    </Card>
                                    <Card className="border-border/70 bg-card/80 py-0 backdrop-blur">
                                        <CardContent className="p-5">
                                            <p className="text-sm text-muted-foreground">
                                                Reporting
                                            </p>
                                            <p className="mt-2 text-lg font-semibold">
                                                Visual usage trends
                                            </p>
                                        </CardContent>
                                    </Card>
                                    <Card className="border-border/70 bg-card/80 py-0 backdrop-blur">
                                        <CardContent className="p-5">
                                            <p className="text-sm text-muted-foreground">
                                                Accountability
                                            </p>
                                            <p className="mt-2 text-lg font-semibold">
                                                Structured AI reflection
                                            </p>
                                        </CardContent>
                                    </Card>
                                </div>
                            </section>

                            <section className="flex items-center">
                                <Card className="w-full border-border/70 bg-card/95 py-0 shadow-xl shadow-black/5">
                                    <CardContent className="space-y-6 p-6 sm:p-7">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">
                                                    Overview
                                                </p>
                                                <h2 className="mt-1 text-2xl font-semibold tracking-tight">
                                                    A homepage that keeps you
                                                    honest
                                                </h2>
                                            </div>
                                            <div className="rounded-xl bg-primary/10 p-3 text-primary">
                                                <BarChart3 className="size-5" />
                                            </div>
                                        </div>

                                        <div className="grid gap-3">
                                            {overviewMetrics.map((metric) => (
                                                <div
                                                    key={metric.label}
                                                    className="flex items-start gap-4 rounded-2xl border border-border/70 p-4"
                                                >
                                                    <div
                                                        className={`rounded-xl px-3 py-2 text-xs font-semibold ${metric.tone}`}
                                                    >
                                                        {metric.label}
                                                    </div>
                                                    <p className="text-sm leading-6 text-muted-foreground">
                                                        {metric.value}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="grid gap-4 sm:grid-cols-3">
                                            {featureCards.map((feature) => {
                                                const Icon = feature.icon;

                                                return (
                                                    <div
                                                        key={feature.title}
                                                        className="rounded-2xl border border-border/70 p-4"
                                                    >
                                                        <div
                                                            className={`inline-flex rounded-xl bg-gradient-to-br p-[1px] ${feature.accent}`}
                                                        >
                                                            <div className="rounded-[11px] bg-background p-3">
                                                                <Icon className="size-4" />
                                                            </div>
                                                        </div>
                                                        <h3 className="mt-4 text-sm font-semibold">
                                                            {feature.title}
                                                        </h3>
                                                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                                            {
                                                                feature.description
                                                            }
                                                        </p>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </CardContent>
                                </Card>
                            </section>
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}
