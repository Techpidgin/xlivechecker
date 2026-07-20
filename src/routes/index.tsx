import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Search, ArrowRight } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "xlivechecker | X monetization risk & shadowban scanner" },
      {
        name: "description",
        content:
          "Enter your X handle to check demonetization, shadowban and suspension risk under the 2026 X algorithm.",
      },
      { property: "og:title", content: "xlivechecker | X monetization risk & shadowban scanner" },
      {
        property: "og:description",
        content: "Enter your X handle to check demonetization, shadowban and suspension risk under the 2026 X algorithm.",
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
      <SiteHeader />

      <main className="mx-auto flex max-w-3xl flex-col items-center px-6 pt-20 pb-24 text-center sm:pt-28">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
          <span className="inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
          Live under the 2026 X monetization rules
        </div>

        <h1 className="max-w-2xl text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
          Is your X account about to get <span className="text-primary">demonetized?</span>
        </h1>

        <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
          Enter a handle. We scan the last 30 days of public posts against X's engagement-farming,
          originality, and disclosure rules — and tell you exactly what to fix.
        </p>

        <form onSubmit={onSubmit} className="mt-10 flex w-full max-w-xl flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              autoFocus
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="Enter X handle e.g. mfckr_eth"
              className="h-13 w-full rounded-full border border-border bg-card pl-11 pr-4 py-3 text-[15px] outline-none placeholder:text-muted-foreground focus:border-primary"
            />
          </div>
          <button
            type="submit"
            className="inline-flex h-13 items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:brightness-105 disabled:opacity-50"
            disabled={!handle.trim()}
          >
            Run check
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <p className="mt-6 text-xs text-muted-foreground">
          4,000+ accounts already paused &middot; 5M impressions/month payout floor
        </p>
      </main>

      <SiteFooter />
    </div>
  );
}
