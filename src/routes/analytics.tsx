import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { getPageViews, clearPageViews, type PageView } from "@/lib/pageview-tracker";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { ExternalLink, Trash2 } from "lucide-react";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Site analytics | xlivechecker" },
      {
        name: "description",
        content:
          "Live visitor behavior for xlivechecker: pageviews, top pages, referrers, and Vercel Analytics dashboard.",
      },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Site analytics | xlivechecker" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://xlivechecker.lovable.app/analytics" }],
  }),
  component: AnalyticsPage,
});

function dayKey(ts: number) {
  const d = new Date(ts);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function AnalyticsPage() {
  const [views, setViews] = useState<PageView[]>([]);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    setViews(getPageViews());
  }, [tick]);

  const stats = useMemo(() => {
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;
    const last24 = views.filter((v) => now - v.ts < day).length;
    const last7 = views.filter((v) => now - v.ts < 7 * day).length;
    const last30 = views.filter((v) => now - v.ts < 30 * day).length;

    const byDay = new Map<string, number>();
    for (let i = 13; i >= 0; i--) {
      byDay.set(dayKey(now - i * day), 0);
    }
    views.forEach((v) => {
      if (now - v.ts > 14 * day) return;
      const k = dayKey(v.ts);
      byDay.set(k, (byDay.get(k) ?? 0) + 1);
    });
    const daily = Array.from(byDay.entries()).map(([day, count]) => ({ day, count }));

    const byPath = new Map<string, number>();
    views.forEach((v) => byPath.set(v.path, (byPath.get(v.path) ?? 0) + 1));
    const topPages = Array.from(byPath.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);

    const byRef = new Map<string, number>();
    views.forEach((v) => {
      let r = v.ref;
      try {
        if (r && r !== "direct") r = new URL(r).hostname;
      } catch {
        /* keep raw */
      }
      byRef.set(r, (byRef.get(r) ?? 0) + 1);
    });
    const topRefs = Array.from(byRef.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);

    return { last24, last7, last30, daily, topPages, topRefs, total: views.length };
  }, [views]);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-6 pb-24 pt-6">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Site analytics</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Visitor behavior
            </h1>
            <p className="mt-2 max-w-xl text-[15px] text-muted-foreground">
              Local session pageview stream + full production numbers on Vercel Analytics.
            </p>
          </div>
          <div className="flex gap-2">
            <a
              href="https://vercel.com/dashboard/analytics"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs font-medium text-foreground hover:border-primary"
            >
              Open Vercel Analytics
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <button
              type="button"
              onClick={() => {
                clearPageViews();
                setTick((t) => t + 1);
              }}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs font-medium text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Reset local
            </button>
          </div>
        </div>

        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Last 24h" value={stats.last24} />
          <Stat label="Last 7 days" value={stats.last7} />
          <Stat label="Last 30 days" value={stats.last30} />
          <Stat label="Total tracked" value={stats.total} />
        </section>

        <section className="mt-6 rounded-2xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Pageviews · last 14 days</h2>
            <span className="text-xs text-muted-foreground">local session</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.daily}>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="2 4" vertical={false} />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} width={28} />
                <Tooltip
                  cursor={{ fill: "hsl(var(--muted) / 0.4)" }}
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-5">
            <h2 className="mb-4 text-sm font-semibold">Top pages</h2>
            {stats.topPages.length === 0 ? (
              <p className="text-sm text-muted-foreground">No visits recorded yet.</p>
            ) : (
              <ul className="space-y-2">
                {stats.topPages.map(([path, count]) => (
                  <li key={path} className="flex items-center justify-between text-sm">
                    <span className="truncate font-mono text-xs text-foreground/90">{path}</span>
                    <span className="text-muted-foreground">{count}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <h2 className="mb-4 text-sm font-semibold">Top referrers</h2>
            {stats.topRefs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No referrers recorded yet.</p>
            ) : (
              <ul className="space-y-2">
                {stats.topRefs.map(([ref, count]) => (
                  <li key={ref} className="flex items-center justify-between text-sm">
                    <span className="truncate text-xs text-foreground/90">{ref}</span>
                    <span className="text-muted-foreground">{count}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <p className="mt-8 text-xs text-muted-foreground">
          Local stats are stored in this browser only. Aggregate cross-visitor analytics live in
          Vercel Analytics once the app is deployed on Vercel.
        </p>
      </main>

      <SiteFooter />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-semibold tracking-tight">{value.toLocaleString()}</div>
    </div>
  );
}
