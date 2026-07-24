import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const HandleInput = z.object({
  handle: z
    .string()
    .trim()
    .min(1)
    .max(40)
    .transform((h) => h.replace(/^@/, "").trim()),
});

export interface Tweet {
  id: string;
  createdAt: string;
  text: string;
  isRetweet: boolean;
  isReply: boolean;
  hasMedia: boolean;
  favorites: number;
  retweets: number;
  replies: number;
  quotes: number;
  permalink: string;
}

export interface RiskFlag {
  id: string;
  label: string;
  severity: "low" | "medium" | "high";
  count: number;
  detail: string;
  examples: string[];
}

export interface AnalysisResult {
  handle: string;
  displayName: string;
  avatar: string | null;
  followers: number;
  following: number;
  verified: boolean;
  bio: string;
  createdAt: string;
  fetchedAt: string;
  // Rollups
  postsAnalyzed: number;
  windowDays: number;
  originalCount: number;
  repostCount: number;
  replyCount: number;
  mediaCount: number;
  totalImpressionsEstimate: number;
  avgEngagement: number;
  riskScore: number; // 0-100
  riskLevel: "low" | "medium" | "high" | "critical";
  monetizationEligible: boolean;
  flags: RiskFlag[];
  dailyActivity: { date: string; original: number; reposts: number; replies: number }[];
  engagementSeries: { date: string; engagement: number }[];
  compositionBreakdown: { name: string; value: number }[];
  recommendations: string[];
  recentSamples: Tweet[];
  dataSource: string;
  warning: string | null;
}

// Pattern libraries reflecting X's 2026 monetization/engagement-farming rules.
const FARM_PATTERNS: { pattern: RegExp; label: string }[] = [
  { pattern: /\b(follow(?:\s+for\s+follow)?|f4f|follow\s*back|follow\s*me)\b/i, label: "follow solicitation" },
  { pattern: /\b(rt(?:\s+to\s+win)?|retweet\s+(?:this|to\s+win|for))\b/i, label: "retweet solicitation" },
  { pattern: /\b(like\s+(?:this|if|and|for)|drop\s+a\s+like|smash\s+(?:the\s+)?like)\b/i, label: "like solicitation" },
  { pattern: /\b(reply\s+(?:below|yes|no|with|"|')|comment\s+(?:below|yes|no|"|')|drop\s+.+\s+in\s+(?:the\s+)?(?:reply|comments))\b/i, label: "reply solicitation" },
  { pattern: /\bagree\??\s*$/i, label: "engagement-bait question" },
  { pattern: /\b(giveaway|airdrop|whitelist|wl\s+spot|free\s+mint|claim\s+now)\b/i, label: "giveaway / airdrop bait" },
  { pattern: /\b(tag\s+(?:a\s+friend|someone|3\s+friends))\b/i, label: "tag-a-friend farm" },
  { pattern: /\b(bookmark\s+this|save\s+this\s+post|save\s+for\s+later)\b/i, label: "bookmark bait" },
  { pattern: /^\s*(gm|gn|wagmi|lfg)\s*[!.]*\s*$/i, label: "low-effort filler post" },
  { pattern: /\bthread\s*(?:🧵|below|incoming|👇)/i, label: "thread bait" },
];

const UNDISCLOSED_PROMO = /\b(check\s+out|use\s+code|promo\s+code|referral|my\s+link|link\s+in\s+bio)\b/i;
const HAS_AD_DISCLOSURE = /#(ad|sponsored|paid|promo)\b/i;
const SENSITIVE_TOPICS = /\b(election|trump|biden|putin|zelensky|gaza|israel|hamas|abortion|vaccine)\b/i;
const AI_HINTS = /\b(chatgpt|midjourney|sora|generated with ai|ai[- ]generated|deepfake)\b/i;
const COPYWRITED_HINTS = /\b(movie clip|full episode|leaked|watch full|1080p|torrent)\b/i;

function estImpressions(t: Tweet): number {
  // Rough public heuristic: ~ (favorites*35 + retweets*120 + replies*40 + quotes*80)
  return t.favorites * 35 + t.retweets * 120 + t.replies * 40 + t.quotes * 80;
}

function daysAgo(iso: string): number {
  return (Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24);
}

function fmtDay(d: Date): string {
  return d.toISOString().slice(5, 10);
}

async function fetchTimeline(handle: string): Promise<{ tweets: Tweet[]; user: any; source: string; warning: string | null }> {
  const target = `https://syndication.twitter.com/srv/timeline-profile/screen-name/${encodeURIComponent(handle)}`;
  const attempts: { url: string; source: string }[] = [
    { url: target, source: "syndication.twitter.com" },
    { url: `https://api.cors.lol/?url=${encodeURIComponent(target)}`, source: "api.cors.lol" },
    { url: `https://proxy.cors.sh/${target}`, source: "proxy.cors.sh" },
    { url: `https://r.jina.ai/${target}`, source: "r.jina.ai" },
  ];
  let lastStatus = 0;
  let lastReason = "";
  let html = "";
  let source = "";
  for (const a of attempts) {
    try {
      const res = await fetch(a.url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml",
          "X-Return-Format": "html",
          "x-cors-api-key": "temp_public",
        },
      });
      lastStatus = res.status;
      if (!res.ok) {
        lastReason = `${a.source} → ${res.status}`;
        continue;
      }
      const body = await res.text();
      if (!body.includes("__NEXT_DATA__")) {
        lastReason = `${a.source} → no timeline payload`;
        continue;
      }
      html = body;
      source = a.source;
      break;
    } catch (err) {
      lastReason = `${a.source} → ${(err as Error).message}`;
    }
  }
  if (!html) {
    throw new Error(
      `Could not reach X for @${handle} right now (${lastReason || `status ${lastStatus}`}). X's public timeline endpoints are rate-limiting — please retry in a minute. If it keeps failing, double-check the handle spelling.`,
    );
  }
  const m = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (!m) throw new Error("Could not parse X profile response.");
  const data = JSON.parse(m[1]);
  const entries = data?.props?.pageProps?.timeline?.entries ?? [];
  let user: any = data?.props?.pageProps?.user ?? null;
  const tweets: Tweet[] = [];
  for (const e of entries) {
    const tw = e?.content?.tweet;
    if (!tw) continue;
    if (!user && tw.user) user = tw.user;
    const isRetweet = !!tw.retweeted_status || /^RT @/.test(tw.text ?? "");
    const isReply = !!tw.in_reply_to_status_id_str || !!tw.in_reply_to_screen_name;
    const media = tw.entities?.media?.length ?? 0;
    tweets.push({
      id: tw.id_str,
      createdAt: new Date(tw.created_at).toISOString(),
      text: tw.full_text ?? tw.text ?? "",
      isRetweet,
      isReply,
      hasMedia: media > 0,
      favorites: tw.favorite_count ?? 0,
      retweets: tw.retweet_count ?? 0,
      replies: tw.reply_count ?? 0,
      quotes: tw.quote_count ?? 0,
      permalink: `https://x.com${tw.permalink ?? `/${handle}/status/${tw.id_str}`}`,
    });
  }
  if (!user) {
    throw new Error(`No public data returned for @${handle}. The account may be new, private, or protected.`);
  }
  return {
    tweets,
    user,
    source,
    warning:
      tweets.length < 15
        ? "Public timeline returned a limited sample. Risk scoring is directional but based on real posts."
        : null,
  };
}

function analyze(handle: string, tweets: Tweet[], user: any, source: string, warning: string | null): AnalysisResult {
  const now = Date.now();
  const WINDOW = 30;
  const recent = tweets.filter((t) => daysAgo(t.createdAt) <= WINDOW);
  const pool = recent.length > 0 ? recent : tweets.slice(0, 30);

  let originalCount = 0;
  let repostCount = 0;
  let replyCount = 0;
  let mediaCount = 0;

  const farmHits = new Map<string, { count: number; examples: string[] }>();
  let undisclosedPromo: Tweet[] = [];
  let sensitiveAi: Tweet[] = [];
  let copywrited: Tweet[] = [];
  let lowEffort = 0;
  let duplicateGroups = new Map<string, number>();

  const riskyIds = new Set<string>();
  for (const t of pool) {
    if (t.isRetweet) repostCount++;
    else if (t.isReply) replyCount++;
    else originalCount++;
    if (t.hasMedia) mediaCount++;

    // Duplicate detection (near-identical short text)
    const norm = t.text.toLowerCase().replace(/https?:\/\/\S+/g, "").replace(/[^a-z0-9 ]/g, "").trim().slice(0, 80);
    if (norm.length > 10) duplicateGroups.set(norm, (duplicateGroups.get(norm) ?? 0) + 1);

    for (const { pattern, label } of FARM_PATTERNS) {
      if (pattern.test(t.text)) {
        const entry = farmHits.get(label) ?? { count: 0, examples: [] };
        entry.count++;
        if (entry.examples.length < 3) entry.examples.push(t.text.slice(0, 140));
        farmHits.set(label, entry);
        if (label === "low-effort filler post") lowEffort++;
        riskyIds.add(t.id);
      }
    }

    if (UNDISCLOSED_PROMO.test(t.text) && !HAS_AD_DISCLOSURE.test(t.text)) { undisclosedPromo.push(t); riskyIds.add(t.id); }
    if (SENSITIVE_TOPICS.test(t.text) && AI_HINTS.test(t.text)) { sensitiveAi.push(t); riskyIds.add(t.id); }
    if (COPYWRITED_HINTS.test(t.text)) { copywrited.push(t); riskyIds.add(t.id); }
  }

  // Flag duplicate posts and reposts as monetization-risk samples
  const dupNorms = new Set(
    [...duplicateGroups.entries()].filter(([, n]) => n >= 2).map(([k]) => k),
  );
  for (const t of pool) {
    const norm = t.text.toLowerCase().replace(/https?:\/\/\S+/g, "").replace(/[^a-z0-9 ]/g, "").trim().slice(0, 80);
    if (dupNorms.has(norm)) riskyIds.add(t.id);
    if (t.isRetweet) riskyIds.add(t.id);
  }

  const duplicates = [...duplicateGroups.values()].filter((n) => n >= 2).reduce((a, b) => a + b, 0);

  const totalImpressions = pool.reduce((sum, t) => sum + estImpressions(t), 0);
  const projectedMonthly = pool.length > 0 ? (totalImpressions / Math.max(1, Math.min(WINDOW, daysAgo(pool[pool.length - 1].createdAt) || WINDOW))) * 30 : 0;
  const avgEngagement =
    pool.length > 0 ? pool.reduce((s, t) => s + t.favorites + t.retweets + t.replies + t.quotes, 0) / pool.length : 0;

  const flags: RiskFlag[] = [];

  const farmTotal = [...farmHits.values()].reduce((a, b) => a + b.count, 0);
  if (farmTotal > 0) {
    const severity: RiskFlag["severity"] = farmTotal >= 3 ? "high" : farmTotal >= 2 ? "medium" : "low";
    flags.push({
      id: "engagement-farming",
      label: "Engagement farming language",
      severity,
      count: farmTotal,
      detail:
        farmTotal >= 3
          ? "X removes accounts that repeat solicitation phrasing 3+ times. You are at or over that threshold."
          : "Solicitation patterns detected in recent posts. Two more instances trigger automatic removal.",
      examples: [...farmHits.entries()].map(([k, v]) => `${k} - ${v.count}x`).slice(0, 6),
    });
  }

  if (repostCount / Math.max(1, pool.length) > 0.4) {
    flags.push({
      id: "reposts",
      label: "High repost ratio",
      severity: repostCount / pool.length > 0.6 ? "high" : "medium",
      count: repostCount,
      detail:
        "Reposts and content aggregation now earn near-zero. Revenue routes to the original poster. Keep reposts under 25% of your output.",
      examples: [],
    });
  }

  if (duplicates >= 2) {
    flags.push({
      id: "duplicates",
      label: "Duplicate / copy-paste posts",
      severity: duplicates >= 4 ? "high" : "medium",
      count: duplicates,
      detail: "Spam detection flags near-identical posts across a short window. Rewrite each post uniquely.",
      examples: [],
    });
  }

  if (undisclosedPromo.length > 0) {
    flags.push({
      id: "undisclosed-promo",
      label: "Undisclosed promotions",
      severity: undisclosedPromo.length >= 3 ? "high" : "medium",
      count: undisclosedPromo.length,
      detail: "Promo/referral language without #ad or #sponsored disclosure violates monetization rules.",
      examples: undisclosedPromo.slice(0, 3).map((t) => t.text.slice(0, 140)),
    });
  }

  if (sensitiveAi.length > 0) {
    flags.push({
      id: "sensitive-ai",
      label: "AI content on sensitive topics",
      severity: "high",
      count: sensitiveAi.length,
      detail: "Undisclosed AI content around politics or elections is being demonetized and shadow-limited.",
      examples: sensitiveAi.slice(0, 3).map((t) => t.text.slice(0, 140)),
    });
  }

  if (copywrited.length > 0) {
    flags.push({
      id: "copyright",
      label: "Copyrighted material signals",
      severity: "medium",
      count: copywrited.length,
      detail: "Movie clips, leaked episodes, and full copyrighted content trigger DMCA and revenue holds.",
      examples: copywrited.slice(0, 3).map((t) => t.text.slice(0, 140)),
    });
  }

  if (projectedMonthly < 5_000_000) {
    flags.push({
      id: "impressions",
      label: "Below 5M monthly impressions",
      severity: projectedMonthly < 1_000_000 ? "high" : "medium",
      count: Math.round(projectedMonthly),
      detail:
        "Creator payouts pause below the 5M impressions / month floor (roughly $30 minimum payout). Estimated projection from public engagement.",
      examples: [],
    });
  }

  if (originalCount / Math.max(1, pool.length) < 0.3) {
    flags.push({
      id: "originality",
      label: "Low original content ratio",
      severity: "medium",
      count: originalCount,
      detail: "The new algorithm prioritises original posts. Keep originals above 60% of your feed.",
      examples: [],
    });
  }

  // Risk score composition (0-100)
  let score = 0;
  for (const f of flags) score += f.severity === "high" ? 26 : f.severity === "medium" ? 14 : 6;
  score = Math.min(100, score);
  const level: AnalysisResult["riskLevel"] =
    score >= 70 ? "critical" : score >= 45 ? "high" : score >= 20 ? "medium" : "low";
  const monetizationEligible = level !== "critical" && projectedMonthly >= 5_000_000 && farmTotal < 3;

  // Time series
  const dayMap = new Map<string, { original: number; reposts: number; replies: number }>();
  const engMap = new Map<string, number>();
  for (let i = WINDOW - 1; i >= 0; i--) {
    const d = new Date(now - i * 86400000);
    const key = fmtDay(d);
    dayMap.set(key, { original: 0, reposts: 0, replies: 0 });
    engMap.set(key, 0);
  }
  for (const t of pool) {
    const key = fmtDay(new Date(t.createdAt));
    if (!dayMap.has(key)) continue;
    const bucket = dayMap.get(key)!;
    if (t.isRetweet) bucket.reposts++;
    else if (t.isReply) bucket.replies++;
    else bucket.original++;
    engMap.set(key, (engMap.get(key) ?? 0) + t.favorites + t.retweets + t.replies + t.quotes);
  }
  const dailyActivity = [...dayMap.entries()].map(([date, v]) => ({ date, ...v }));
  const engagementSeries = [...engMap.entries()].map(([date, engagement]) => ({ date, engagement }));

  const compositionBreakdown = [
    { name: "Original", value: originalCount },
    { name: "Reposts", value: repostCount },
    { name: "Replies", value: replyCount },
  ].filter((s) => s.value > 0);

  const recommendations: string[] = [];
  if (farmTotal >= 3)
    recommendations.push(
      "Delete or edit posts containing 'follow for follow', 'RT to win', 'reply below', 'like if' and similar phrases. Three instances trigger removal from monetization.",
    );
  else if (farmTotal > 0)
    recommendations.push("Rewrite any solicitation phrasing (follow/like/reply/RT prompts). Stay below 3 instances per rolling window.");
  if (repostCount / Math.max(1, pool.length) > 0.4)
    recommendations.push("Cut reposts to under 25% of output. Reposts now earn near-zero and dilute originality signals.");
  if (duplicates >= 2) recommendations.push("Stop copy-pasting posts. Rewrite each with unique wording and framing.");
  if (undisclosedPromo.length > 0) recommendations.push("Add #ad or #sponsored to any post pushing a link, code, or referral.");
  if (sensitiveAi.length > 0) recommendations.push("Label AI-generated media clearly and avoid AI content on elections, war, and health.");
  if (copywrited.length > 0) recommendations.push("Remove movie/TV clips and other copyrighted media. Use licensed or original visuals.");
  if (projectedMonthly < 5_000_000)
    recommendations.push("Grow monthly impressions above 5M. Post 3-5 original longer-form pieces per week, add media, and reply inside your niche.");
  if (originalCount / Math.max(1, pool.length) < 0.5)
    recommendations.push("Post 60%+ original content. Long-form posts, video, and threads convert best under the new algorithm.");
  if (lowEffort > 3) recommendations.push("Reduce low-effort 'gm/gn/wagmi' posts. They dilute your engagement rate and lower payouts.");
  if (recommendations.length === 0) recommendations.push("Your recent activity looks aligned with current X monetization rules. Keep publishing original long-form posts.");

  return {
    handle: user.screen_name ?? handle,
    displayName: user.name ?? handle,
    avatar: user.profile_image_url_https ?? null,
    followers: user.followers_count ?? 0,
    following: user.friends_count ?? 0,
    verified: !!user.verified || !!user.is_blue_verified,
    bio: user.description ?? "",
    createdAt: user.created_at ? new Date(user.created_at).toISOString() : "",
    fetchedAt: new Date().toISOString(),
    postsAnalyzed: pool.length,
    windowDays: WINDOW,
    originalCount,
    repostCount,
    replyCount,
    mediaCount,
    totalImpressionsEstimate: Math.round(projectedMonthly),
    avgEngagement: Math.round(avgEngagement),
    riskScore: score,
    riskLevel: level,
    monetizationEligible,
    flags,
    dailyActivity,
    engagementSeries,
    compositionBreakdown,
    recommendations,
    recentSamples: pool.filter((t) => riskyIds.has(t.id)).slice(0, 8),
    dataSource: source,
    warning,
  };
}

export const analyzeHandle = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => HandleInput.parse(data))
  .handler(async ({ data }): Promise<AnalysisResult> => {
    const { tweets, user, source, warning } = await fetchTimeline(data.handle);
    return analyze(data.handle, tweets, user, source, warning);
  });
