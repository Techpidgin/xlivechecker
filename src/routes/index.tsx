import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  Search,
  ShieldCheck,
  AlertTriangle,
  Activity,
  BarChart3,
  Ban,
  Sparkles,
  CircleDollarSign,
  Bot,
  Copyright,
  Repeat2,
  Zap,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "xlivechecker | X monetization risk & shadowban scanner" },
      {
        name: "description",
        content:
          "Enter your X handle to check demonetization, shadowban and suspension risk under the 2026 X algorithm. Charts, flags, and a step-by-step recovery plan.",
      },
      { property: "og:title", content: "xlivechecker | X monetization risk scanner" },
      {
        property: "og:description",
        content: "Scan your X account against the new engagement-farming and originality rules.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  const [handle, setHandle] = useState("");
  const navigate = useNavigate();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = handle.trim().replace(/^@/, "").replace(/\s+/g, "");
    if (!clean) return;
    navigate({ to: "/check/$handle", params: { handle: clean } });
  };

  return (
    <div className="min-h-screen bg-background">
      <TopNav />

      <main className="mx-auto max-w-6xl px-6 pb-24 pt-10">
        <section className="card-panel px-8 py-12 sm:px-12 sm:py-16">
          <div className="flex flex-col gap-8">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
              <span className="inline-flex h-2 w-2 rounded-full bg-primary" />
              Live under the 2026 X monetization rules
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold leading-tight sm:text-6xl">
                Is your X account
                <br />
                about to get <span className="text-primary">demonetized?</span>
              </h1>
              <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
                xlivechecker scans your recent posts against the new X creator rules — engagement farming, reposts,
                undisclosed promos, AI content on sensitive topics — and tells you exactly what to fix before your payouts
                pause.
              </p>
            </div>

            <form onSubmit={onSubmit} className="flex w-full max-w-2xl flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  autoFocus
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  placeholder="Enter X handle e.g. elonmusk"
                  className="h-14 w-full rounded-2xl border border-border bg-background/60 pl-12 pr-4 text-base text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
                />
              </div>
              <button
                type="submit"
                className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:brightness-105 disabled:opacity-50"
                disabled={!handle.trim()}
              >
                Run live check
                <Zap className="h-4 w-4" />
              </button>
            </form>

            <div className="grid grid-cols-2 gap-4 pt-2 sm:grid-cols-4">
              <MiniStat icon={<ShieldCheck className="h-4 w-4" />} label="Rules checked" value="18" />
              <MiniStat icon={<Activity className="h-4 w-4" />} label="Lookback window" value="30 days" />
              <MiniStat icon={<BarChart3 className="h-4 w-4" />} label="Metrics tracked" value="12" />
              <MiniStat icon={<Ban className="h-4 w-4" />} label="Accounts already paused" value="4,000+" />
            </div>
          </div>
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-2">
          <RulePanel
            icon={<Sparkles className="h-5 w-5" />}
            title="What the new algorithm rewards"
            items={[
              "Original long-form posts that spend time in feed",
              "Consistent posting inside a single niche",
              "Verified media (images, video) with disclosure when AI",
              "Real replies from real accounts, not bought engagement",
            ]}
            tone="primary"
          />
          <RulePanel
            icon={<AlertTriangle className="h-5 w-5" />}
            title="What triggers pause, shadowban or ban"
            items={[
              "Solicitation phrases 3x+: follow-for-follow, RT to win, reply below",
              "Reposts / copy-paste content aggregation",
              "Undisclosed promos, referral links, giveaways",
              "Copyrighted material and AI content on politics or elections",
              "Fewer than 5M impressions/month (min payout floor ~$30)",
            ]}
            tone="destructive"
          />
        </section>

        <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SignalCard icon={<Repeat2 />} title="Repost ratio" desc="How much of your feed is aggregation vs original." />
          <SignalCard icon={<CircleDollarSign />} title="Impressions floor" desc="Are you clearing the 5M/mo payout floor?" />
          <SignalCard icon={<Bot />} title="AI & sensitive topics" desc="Undisclosed AI on politics is being demonetized." />
          <SignalCard icon={<Copyright />} title="Copyright signals" desc="Movie clips, leaks and DMCA triggers detected." />
        </section>

        <footer className="mt-16 flex flex-col items-start justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p>
            xlivechecker is an independent tool. Data crawled from public X profile embeds. Not affiliated with X Corp.
          </p>
          <p>Rules reference: X Creator Monetization Update, 2026.</p>
        </footer>
      </main>
    </div>
  );
}

function TopNav() {
  return (
    <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
      <Link to="/" className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Zap className="h-4 w-4" strokeWidth={2.5} />
        </div>
        <span className="text-sm font-semibold tracking-tight">xlivechecker</span>
      </Link>
      <nav className="hidden items-center gap-1 rounded-full border border-border bg-card px-1 py-1 text-xs sm:flex">
        <span className="rounded-full px-3 py-1.5 text-muted-foreground">Rules</span>
        <span className="rounded-full bg-secondary px-3 py-1.5 text-foreground">Check</span>
        <span className="rounded-full px-3 py-1.5 text-muted-foreground">Recover</span>
      </nav>
      <a
        href="https://help.x.com/en/rules-and-policies/x-monetization-standards"
        target="_blank"
        rel="noreferrer"
        className="hidden rounded-full border border-border bg-card px-4 py-2 text-xs text-foreground hover:border-primary sm:inline-flex"
      >
        X rules reference
      </a>
    </header>
  );
}

function MiniStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-background/40 p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="text-primary">{icon}</span>
        {label}
      </div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
    </div>
  );
}

function RulePanel({
  icon,
  title,
  items,
  tone,
}: {
  icon: React.ReactNode;
  title: string;
  items: string[];
  tone: "primary" | "destructive";
}) {
  const toneClass = tone === "primary" ? "text-primary" : "text-destructive";
  return (
    <div className="card-panel p-6">
      <div className={`flex items-center gap-2 ${toneClass}`}>
        {icon}
        <h2 className="text-sm font-semibold uppercase tracking-wider">{title}</h2>
      </div>
      <ul className="mt-4 space-y-3">
        {items.map((it) => (
          <li key={it} className="flex gap-3 text-sm text-foreground/90">
            <span className={`mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full ${tone === "primary" ? "bg-primary" : "bg-destructive"}`} />
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}

function SignalCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="card-panel p-5">
      <div className="text-primary">{icon}</div>
      <div className="mt-3 text-sm font-semibold">{title}</div>
      <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
    </div>
  );
}
