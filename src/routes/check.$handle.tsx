import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertTriangle,
  ArrowLeft,
  BadgeCheck,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Search,
  ShieldAlert,
  ShieldCheck,
  Users,
  Zap,
} from "lucide-react";
import { analyzeHandle, type AnalysisResult, type RiskFlag } from "@/lib/xcheck.functions";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";

export const Route = createFileRoute("/check/$handle")({
  head: ({ params }) => {
    const url = `https://xlivechecker.lovable.app/check/${params.handle}`;
    const title = `@${params.handle} - X monetization risk | xlivechecker`;
    const description = `Live X monetization, shadowban and suspension risk analysis for @${params.handle} against the 2026 X creator rules.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: url },
        { property: "og:type", content: "profile" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "robots", content: "noindex" },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: CheckPage,
});

function CheckPage() {
  const { handle } = Route.useParams();
  const fn = useServerFn(analyzeHandle);
  const q = useQuery({
    queryKey: ["xcheck", handle],
    queryFn: () => fn({ data: { handle } }),
    retry: false,
    staleTime: 5 * 60_000,
  });

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <ReCheckBar currentHandle={handle} />
      <main className="mx-auto max-w-6xl px-6 pb-24">
        {q.isPending && <LoadingState handle={handle} />}
        {q.isError && <ErrorState message={(q.error as Error).message} handle={handle} />}
        {q.data && <Results data={q.data} />}
      </main>
      <SiteFooter />
    </div>
  );
}

function ReCheckBar({ currentHandle }: { currentHandle: string }) {
  const [handle, setHandle] = useState(currentHandle);
  const navigate = useNavigate();
  return (
    <div className="mx-auto max-w-6xl px-6 pb-2">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const clean = handle.trim().replace(/^@/, "");
          if (clean) navigate({ to: "/check/$handle", params: { handle: clean } });
        }}
        className="flex items-center gap-2"
      >
        <div className="relative flex-1 sm:max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            className="h-10 w-full rounded-full border border-border bg-card pl-9 pr-3 text-sm outline-none focus:border-primary"
          />
        </div>
        <button className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground">
          Re-check
        </button>
      </form>
    </div>
  );
}

function LoadingState({ handle }: { handle: string }) {
  return (
    <div className="card-panel flex flex-col items-center justify-center gap-3 py-24 text-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">
        Crawling public posts for <span className="text-foreground">@{handle}</span>...
      </p>
    </div>
  );
}

function ErrorState({ message, handle }: { message: string; handle: string }) {
  return (
    <div className="card-panel flex flex-col items-start gap-4 p-8">
      <AlertTriangle className="h-8 w-8 text-destructive" />
      <div>
        <h2 className="text-xl font-semibold">Could not scan @{handle}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>
      </div>
      <Link
        to="/"
        className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm hover:border-primary"
      >
        <ArrowLeft className="h-4 w-4" /> Try another handle
      </Link>
    </div>
  );
}

const RISK_COLOR: Record<AnalysisResult["riskLevel"], string> = {
  low: "text-primary",
  medium: "text-[color:var(--warning)]",
  high: "text-[color:var(--warning)]",
  critical: "text-destructive",
};
const RISK_BG: Record<AnalysisResult["riskLevel"], string> = {
  low: "bg-primary/10 border-primary/40",
  medium: "bg-[color:var(--warning)]/10 border-[color:var(--warning)]/40",
  high: "bg-[color:var(--warning)]/10 border-[color:var(--warning)]/40",
  critical: "bg-destructive/10 border-destructive/40",
};

function Results({ data }: { data: AnalysisResult }) {
  return (
    <div className="space-y-6">
      <ProfileHeader data={data} />
      <div className="grid gap-6 lg:grid-cols-3">
        <RiskScoreCard data={data} />
        <StatCard label="Posts analyzed" value={data.postsAnalyzed.toString()} sub={`Last ${data.windowDays} days`} />
        <StatCard
          label="Projected impressions / mo"
          value={compact(data.totalImpressionsEstimate)}
          sub={data.totalImpressionsEstimate >= 5_000_000 ? "Above payout floor" : "Below 5M payout floor"}
          tone={data.totalImpressionsEstimate >= 5_000_000 ? "good" : "bad"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Daily posting mix" subtitle="Original vs reposts vs replies over 30 days">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.dailyActivity}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 12, color: "var(--muted-foreground)" }} />
              <Bar dataKey="original" stackId="a" fill="var(--chart-1)" name="Original" radius={[4, 4, 0, 0]} />
              <Bar dataKey="reposts" stackId="a" fill="var(--chart-2)" name="Reposts" />
              <Bar dataKey="replies" stackId="a" fill="var(--chart-3)" name="Replies" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Engagement trend" subtitle="Total interactions per day (public counts)">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data.engagementSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="engagement" stroke="var(--chart-1)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <ChartCard title="Content composition" subtitle="Share of original vs recycled">
          {data.compositionBreakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={data.compositionBreakdown}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={2}
                >
                  {data.compositionBreakdown.map((_, i) => (
                    <Cell key={i} fill={[`var(--chart-1)`, `var(--chart-2)`, `var(--chart-3)`][i % 3]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12, color: "var(--muted-foreground)" }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground">Not enough posts to break down.</p>
          )}
        </ChartCard>

        <div className="lg:col-span-2">
          <FlagList flags={data.flags} />
        </div>
      </div>

      <RecoveryPlan data={data} />
      <RecentPosts data={data} />

      <div className="rounded-xl border border-border bg-card px-4 py-3 text-xs text-muted-foreground">
        Data source: {data.dataSource}. {data.warning ?? "Impressions are estimated from public engagement counts."}
      </div>
    </div>
  );
}

const tooltipStyle: React.CSSProperties = {
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: 12,
  color: "var(--foreground)",
  fontSize: 12,
};

function ProfileHeader({ data }: { data: AnalysisResult }) {
  return (
    <section className="card-panel flex flex-col items-start gap-6 p-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        {data.avatar ? (
          <img src={data.avatar} alt="" className="h-16 w-16 rounded-2xl border border-border object-cover" />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-secondary text-lg font-semibold">
            {data.handle.slice(0, 2).toUpperCase()}
          </div>
        )}
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold">{data.displayName}</h1>
            {data.verified && <BadgeCheck className="h-5 w-5 text-primary" />}
          </div>
          <p className="text-sm text-muted-foreground">@{data.handle}</p>
          {data.bio && <p className="mt-2 max-w-xl text-sm text-foreground/80">{data.bio}</p>}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <div className="flex items-center gap-2 rounded-xl border border-border bg-background/40 px-3 py-2">
          <Users className="h-4 w-4 text-primary" />
          <span className="font-semibold">{compact(data.followers)}</span>
          <span className="text-muted-foreground">followers</span>
        </div>
        <a
          href={`https://x.com/${data.handle}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 rounded-xl border border-border bg-background/40 px-3 py-2 text-xs hover:border-primary"
        >
          View on X <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </section>
  );
}

function RiskScoreCard({ data }: { data: AnalysisResult }) {
  const label: Record<AnalysisResult["riskLevel"], string> = {
    low: "Low risk",
    medium: "Medium risk",
    high: "High risk",
    critical: "Critical - pause likely",
  };
  return (
    <div className={`rounded-2xl border p-6 ${RISK_BG[data.riskLevel]}`}>
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
        {data.monetizationEligible ? (
          <ShieldCheck className="h-4 w-4 text-primary" />
        ) : (
          <ShieldAlert className="h-4 w-4 text-destructive" />
        )}
        Monetization risk score
      </div>
      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-6xl font-semibold">{data.riskScore}</span>
        <span className="text-lg text-muted-foreground">/ 100</span>
      </div>
      <div className={`mt-2 text-sm font-medium ${RISK_COLOR[data.riskLevel]}`}>{label[data.riskLevel]}</div>
      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className={`h-full ${data.riskLevel === "critical" ? "bg-destructive" : data.riskLevel === "low" ? "bg-primary" : "bg-[color:var(--warning)]"}`}
          style={{ width: `${data.riskScore}%` }}
        />
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        {data.monetizationEligible
          ? "You currently meet the baseline for X creator payouts."
          : "One or more rule triggers put your revenue share at risk of pause."}
      </p>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub: string;
  tone?: "good" | "bad";
}) {
  return (
    <div className="card-panel p-6">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-3 text-4xl font-semibold">{value}</div>
      <div
        className={`mt-2 text-xs ${tone === "good" ? "text-primary" : tone === "bad" ? "text-destructive" : "text-muted-foreground"}`}
      >
        {sub}
      </div>
    </div>
  );
}

function ChartCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="card-panel p-6">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h2 className="text-sm font-semibold">{title}</h2>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function FlagList({ flags }: { flags: RiskFlag[] }) {
  if (flags.length === 0) {
    return (
      <div className="card-panel flex h-full flex-col items-start gap-3 p-6">
        <CheckCircle2 className="h-8 w-8 text-primary" />
        <h2 className="text-lg font-semibold">No rule triggers detected</h2>
        <p className="text-sm text-muted-foreground">
          Recent posts look clean against the current monetization rules. Keep publishing original content and stay above 5M
          impressions per month.
        </p>
      </div>
    );
  }
  return (
    <div className="card-panel p-6">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-destructive" />
        <h2 className="text-sm font-semibold uppercase tracking-wider">Rule triggers ({flags.length})</h2>
      </div>
      <ul className="mt-4 space-y-3">
        {flags.map((f) => (
          <li key={f.id} className="rounded-xl border border-border bg-background/40 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex h-2 w-2 rounded-full ${sevDot(f.severity)}`} />
                  <span className="text-sm font-semibold">{f.label}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{f.detail}</p>
                {f.examples.length > 0 && (
                  <ul className="mt-2 space-y-1 text-xs text-foreground/70">
                    {f.examples.map((ex, i) => (
                      <li key={i} className="truncate">
                        • {ex}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <span className={`rounded-full border px-2 py-1 text-[10px] uppercase tracking-wider ${sevPill(f.severity)}`}>
                {f.severity}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function RecoveryPlan({ data }: { data: AnalysisResult }) {
  return (
    <div className="card-panel p-6">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-primary" />
        <h2 className="text-sm font-semibold uppercase tracking-wider">Get back on track</h2>
      </div>
      <ol className="mt-4 space-y-3">
        {data.recommendations.map((r, i) => (
          <li key={i} className="flex gap-3 rounded-xl border border-border bg-background/40 p-4">
            <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              {i + 1}
            </span>
            <p className="text-sm text-foreground/90">{r}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

function RecentPosts({ data }: { data: AnalysisResult }) {
  if (data.recentSamples.length === 0) return null;
  return (
    <div className="card-panel p-6">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Recent posts sampled</h2>
      <ul className="mt-4 divide-y divide-border">
        {data.recentSamples.map((t) => (
          <li key={t.id} className="py-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{new Date(t.createdAt).toLocaleDateString()}</span>
              {t.isRetweet && <span className="rounded bg-secondary px-1.5 py-0.5">repost</span>}
              {t.isReply && <span className="rounded bg-secondary px-1.5 py-0.5">reply</span>}
              {t.hasMedia && <span className="rounded bg-secondary px-1.5 py-0.5">media</span>}
              <a href={t.permalink} target="_blank" rel="noreferrer" className="ml-auto inline-flex items-center gap-1 hover:text-primary">
                open <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <p className="mt-2 line-clamp-3 text-sm text-foreground/90">{t.text}</p>
            <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
              <span>{compact(t.favorites)} likes</span>
              <span>{compact(t.retweets)} reposts</span>
              <span>{compact(t.replies)} replies</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function sevDot(s: RiskFlag["severity"]) {
  return s === "high" ? "bg-destructive" : s === "medium" ? "bg-[color:var(--warning)]" : "bg-primary";
}
function sevPill(s: RiskFlag["severity"]) {
  return s === "high"
    ? "border-destructive/40 text-destructive"
    : s === "medium"
    ? "border-[color:var(--warning)]/40 text-[color:var(--warning)]"
    : "border-primary/40 text-primary";
}

function compact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}
