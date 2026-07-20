import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";

export const Route = createFileRoute("/recover")({
  head: () => ({
    meta: [
      { title: "Recover your X account | xlivechecker" },
      {
        name: "description",
        content:
          "Step-by-step recovery playbook for paused, shadowbanned, or suspended X accounts under the 2026 monetization rules.",
      },
      { property: "og:title", content: "Recover your X account" },
      {
        property: "og:description",
        content: "Every trick to get monetization, reach and payouts back on your X account.",
      },
    ],
  }),
  component: RecoverPage,
});

const PHASES: { title: string; steps: string[] }[] = [
  {
    title: "Phase 1 — Stop the bleeding (day 0)",
    steps: [
      "Delete or archive every post with engagement-farming phrases: follow-for-follow, RT to win, reply below, tag a friend, like if.",
      "Delete every undisclosed promo, referral link, giveaway, airdrop, WL and free-mint post from the last 30 days.",
      "Remove copyrighted media — movie clips, sports highlights, leaked material, uncredited artist work.",
      "Remove or relabel any AI-generated media on politics, elections, war, or health with a clear #AI disclosure.",
      "Unfollow engagement pods, follow-trains, and reply-guy rings you are part of.",
      "Stop reposting for 14 days. Zero retweets. Zero quote-tweet-for-the-sake-of-it.",
    ],
  },
  {
    title: "Phase 2 — Reset the signal (days 1-7)",
    steps: [
      "Post 1-2 original long-form posts per day. Minimum 150 words or a 4+ post thread. No filler ('gm', 'wagmi', 'lfg').",
      "Pick ONE niche and stay in it for 30 days. The recommender needs consistency to rebuild your topic score.",
      "Attach native media to at least 60% of posts (image or video uploaded to X, not linked).",
      "Reply substantively to 5-10 accounts inside your niche daily. No 'nice post', no emoji-only replies.",
      "Write everything in your own words. Do not copy-paste, do not translate other posts, do not screenshot.",
      "Verify your account (blue checkmark) if you haven't — the algorithm gates payouts behind Premium.",
    ],
  },
  {
    title: "Phase 3 — Rebuild reach (days 7-30)",
    steps: [
      "Aim for 5M+ impressions per rolling 30 days. Below that floor payouts stay paused.",
      "Keep repost ratio under 25% of your feed. Ideally under 10%.",
      "Disclose every paid partnership with #ad, #sponsored, or the native branded-content tag.",
      "Space posts 60-90 minutes apart. Bursts of 5+ posts in 10 minutes look like scripted spam.",
      "Do not run giveaways in this window. Even compliant giveaways get down-ranked while your account is under review.",
      "Use X Analytics to track: impressions, engagement rate, and 'not interested' signals. Cut post types with high skip rates.",
    ],
  },
  {
    title: "Phase 4 — Appeal what's stuck (days 14+)",
    steps: [
      "If monetization is paused, open help.x.com/creator-support and file a 'Monetization review' ticket. Reference specific removed posts.",
      "If shadowbanned, submit a 'search suggestion ban' appeal via the support form — cite your improvements.",
      "If suspended, submit the account appeal at help.x.com/forms/account-access. Be short, factual, no all-caps.",
      "Wait 7 days between appeals. Duplicate appeals reset the queue and delay review.",
      "Never buy followers, buy engagement, or use a 'shadowban removal' service. All three make it worse.",
    ],
  },
];

function RecoverPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="mx-auto max-w-3xl px-6 pb-24 pt-6">
        <div className="mb-10">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Recovery playbook</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Get your X account back on track
          </h1>
          <p className="mt-3 max-w-2xl text-[15px] text-muted-foreground">
            Four phases, thirty days. Do them in order. Skipping ahead is the most common reason recovery fails.
          </p>
        </div>

        <div className="space-y-6">
          {PHASES.map((p, idx) => (
            <section key={p.title} className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-primary text-xs font-semibold text-primary">
                  {idx + 1}
                </span>
                <h2 className="text-sm font-semibold uppercase tracking-wider">{p.title}</h2>
              </div>
              <ol className="mt-4 space-y-3">
                {p.steps.map((s, i) => (
                  <li key={i} className="flex gap-3 text-sm text-foreground/90">
                    <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                    <span>{s}</span>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>

        <section className="mt-10 rounded-2xl border border-primary/40 bg-card p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-primary">
            Tried everything and still stuck?
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            If you've run all four phases and your account is still paused, shadowbanned, or suspended — send a DM.
            Include your handle, when the pause started, and what you've already tried.
          </p>
          <a
            href="https://x.com/messages/compose?recipient_id=mfckr_eth"
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:brightness-105"
          >
            DM @mfckr_eth to recover your account
          </a>
          <p className="mt-3 text-xs text-muted-foreground">
            Or open X and DM{" "}
            <a
              href="https://x.com/mfckr_eth"
              target="_blank"
              rel="noreferrer"
              className="text-foreground underline underline-offset-2"
            >
              @mfckr_eth
            </a>{" "}
            directly.
          </p>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
