// Lightweight client-side pageview tracker (localStorage).
// Complements Vercel Analytics for the in-app /analytics dashboard.
const KEY = "xlc:pv:v1";

export type PageView = { path: string; ts: number; ref: string };

function read(): PageView[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as PageView[]) : [];
  } catch {
    return [];
  }
}

function write(list: PageView[]) {
  if (typeof window === "undefined") return;
  try {
    // Keep last 500 entries.
    const trimmed = list.slice(-500);
    window.localStorage.setItem(KEY, JSON.stringify(trimmed));
  } catch {
    /* ignore */
  }
}

export function recordPageView(path: string) {
  if (typeof window === "undefined") return;
  const list = read();
  const last = list[list.length - 1];
  const now = Date.now();
  // Dedupe rapid duplicates (same path within 1s).
  if (last && last.path === path && now - last.ts < 1000) return;
  list.push({ path, ts: now, ref: document.referrer || "direct" });
  write(list);
}

export function getPageViews(): PageView[] {
  return read();
}

export function clearPageViews() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}
