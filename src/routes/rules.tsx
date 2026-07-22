import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";

export const Route = createFileRoute("/rules")({
  head: () => {
    const url = "https://xlivechecker.lovable.app/rules";
    return {
      meta: [
        { title: "The 2026 X monetization rules | xlivechecker" },
        {
          name: "description",
          content:
            "Every rule the new X algorithm enforces — what it rewards, what pauses payouts, and what triggers shadowban or suspension.",
        },
        { property: "og:title", content: "The 2026 X monetization rules" },
        {
          property: "og:description",
          content: "What the new X algorithm rewards, and what triggers demonetization, shadowban or ban.",
        },
        { property: "og:url", content: url },
        { property: "og:type", content: "article" },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              ...REWARDS.map((r) => ({
                "@type": "Question",
                name: `What does the 2026 X algorithm reward: ${r.title}?`,
                acceptedAnswer: { "@type": "Answer", text: r.detail },
              })),
              ...TRIGGERS.map((r) => ({
                "@type": "Question",
                name: `Does ${r.title} trigger demonetization on X?`,
                acceptedAnswer: { "@type": "Answer", text: r.detail },
              })),
            ],
          }),
        },
      ],
    };
  },
  component: RulesPage,
});

const REWARDS: { title: string; detail: string }[] = [
  {
    title: "Original long-form posts",
    detail:
      "Posts that spend real time in the feed. Threads, 200+ word posts, essays, breakdowns. Long-form now weighs more than raw likes.",
  },
  {
    title: "Consistent niche",
    detail:
      "Posting inside a single topic (crypto, sports, tech, etc.) trains the recommender to route your posts. Jumping topics dilutes reach.",
  },
  {
    title: "Verified media with disclosure",
    detail:
      "Native images and video outperform link-outs. AI-generated media must be labelled — undisclosed AI on sensitive topics is demonetized.",
  },
  {
    title: "Real replies from real accounts",
    detail:
      "Human engagement from non-bot, aged accounts. Bought engagement pods are detected and reduce your payout multiplier.",
  },
  {
    title: "Reply-inside-your-niche",
    detail:
      "Replying to accounts in your niche now counts toward reach signals. Random reply farming does the opposite.",
  },
  {
    title: "Media-heavy composition",
    detail: "60%+ of top-earning creators post with attached image or video. Text-only feeds earn less per impression.",
  },
];

const TRIGGERS: { title: string; severity: "high" | "medium"; detail: string }[] = [
  {
    title: "Engagement farming (3+ instances)",
    severity: "high",
    detail:
      "Phrases like 'follow for follow', 'RT to win', 'reply below', 'like if', 'tag a friend', 'drop a...'. Three instances within the rolling window remove you from the revenue program.",
  },
  {
    title: "Reposts and content aggregation",
    severity: "high",
    detail:
      "Reposting other people's posts, screenshot recycling, and copy-paste content earn near-zero. Revenue routes to the original poster. Keep reposts under 25% of your feed.",
  },
  {
    title: "Undisclosed promotions",
    severity: "high",
    detail:
      "Referral links, promo codes, and 'check this out' pushes without #ad or #sponsored violate the disclosure rule. Repeat offenses pause payouts.",
  },
  {
    title: "Giveaways, airdrops, WL bait",
    severity: "high",
    detail:
      "Giveaway posts, airdrop mentions, whitelist promises, free-mint pushes get automatically flagged. Web3 accounts have been hit hardest — most of the 4,000+ paused accounts are crypto.",
  },
  {
    title: "Copyrighted material",
    severity: "high",
    detail:
      "Movie clips, full episodes, leaks, and other copyrighted media trigger DMCA and revenue holds. One strike removes monetization for the post; three removes the account.",
  },
  {
    title: "Undisclosed AI on sensitive topics",
    severity: "high",
    detail:
      "AI-generated media on politics, elections, war, or health without disclosure is being demonetized and shadow-limited. Label with #AI or a clear caption.",
  },
  {
    title: "Below 5M impressions / month",
    severity: "medium",
    detail:
      "Creator payouts pause below the 5M impressions floor. Minimum payout is roughly $30 — accounts below the floor for 30 days get moved out of the program.",
  },
  {
    title: "Duplicate / copy-paste posts",
    severity: "medium",
    detail: "Near-identical posts across a short window are spam-flagged. Rewrite each post uniquely.",
  },
  {
    title: "Low-effort filler",
    severity: "medium",
    detail: "Threads of 'gm', 'gn', 'wagmi', 'lfg' etc. dilute engagement rate and drag your average payout multiplier.",
  },
  {
    title: "Follower solicitation",
    severity: "medium",
    detail: "'Follow me for more', 'F4F', 'follow back' — the fastest way to a shadowban.",
  },
];

const AFFECTED = [
  { label: "Accounts paused", value: "4,000+" },
  { label: "Categories hit hardest", value: "Crypto / Web3" },
  { label: "Regions cited", value: "Nigeria &amp; other emerging markets" },
  { label: "Minimum payout", value: "~$30 / month" },
];

function RulesPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="mx-auto max-w-4xl px-6 pb-24 pt-6">
        <div className="mb-10">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">The 2026 update</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Every rule the new X algorithm enforces
          </h1>
          <p className="mt-3 max-w-2xl text-[15px] text-muted-foreground">
            Distilled from X's Creator Monetization Standards and observed enforcement actions since the update.
            xlivechecker scans your account against every rule below.
          </p>
        </div>

        <section className="mb-12 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {AFFECTED.map((s) => (
            <div key={s.label} className="rounded-2xl border border-border bg-card p-4">
              <div className="text-xs text-muted-foreground">{s.label}</div>
              <div
                className="mt-1 text-lg font-semibold tracking-tight"
                dangerouslySetInnerHTML={{ __html: s.value }}
              />
            </div>
          ))}
        </section>

        <section>
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">What the algorithm rewards</h2>
          <div className="mt-4 divide-y divide-border rounded-2xl border border-border bg-card">
            {REWARDS.map((r) => (
              <div key={r.title} className="flex flex-col gap-1 p-5">
                <div className="text-sm font-semibold">{r.title}</div>
                <p className="text-sm text-muted-foreground">{r.detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-destructive">
            What triggers pause, shadowban or ban
          </h2>
          <div className="mt-4 divide-y divide-border rounded-2xl border border-border bg-card">
            {TRIGGERS.map((r) => (
              <div key={r.title} className="flex flex-col gap-1 p-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-semibold">{r.title}</div>
                  <span
                    className={
                      "rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider " +
                      (r.severity === "high"
                        ? "border-destructive/40 text-destructive"
                        : "border-border text-muted-foreground")
                    }
                  >
                    {r.severity}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{r.detail}</p>
              </div>
            ))}
          </div>
        </section>

        <p className="mt-10 text-xs text-muted-foreground">
          Reference: X Creator Monetization Standards (2026 update) &middot; enforcement observations across ~4,000
          paused accounts.
        </p>
      </main>

      <SiteFooter />
    </div>
  );
}
