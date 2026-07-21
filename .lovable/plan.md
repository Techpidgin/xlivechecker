# Plan: Analytics + Temu ad slider

## 1. Vercel Analytics + Vercel compatibility

- Install `@vercel/analytics` and mount `<Analytics />` from `@vercel/analytics/react` inside `RootComponent` in `src/routes/__root.tsx` (right after `<Outlet />`). This is the framework-agnostic React entry that works with TanStack Start.
- Add `@vercel/speed-insights/react`'s `<SpeedInsights />` alongside it (same package family, standard Vercel setup) — optional, ask if you want it skipped.
- Note on "Vercel compatible": the project currently targets Cloudflare Workers (nitro/workerd preset in the TanStack Start config). True Vercel deploy support means switching the server preset to `vercel` and re-testing server functions there. I will:
  - Keep the current Cloudflare target working.
  - Add a Vercel preset switch documented in `AGENTS.md` (env var / config comment) so a Vercel deploy just needs the preset flip — no code rewrite.
  - The `@vercel/analytics` script itself works on any host; it only reports data when the site is actually deployed on Vercel.

## 2. SEO polish

- Verify each route (`/`, `/rules`, `/recover`, `/check/$handle`) has: unique title <60 chars, description <160 chars, self-referential `canonical` link, `og:url`, `og:type`.
- Add `og:url` + `canonical` where missing (currently absent on all leaf routes).
- Add JSON-LD `WebSite` schema on `__root.tsx` and `WebPage`/`FAQPage` on `/rules`.
- Confirm `sitemap.xml` and `robots.txt` list the new `/analytics` page as `noindex` (admin-style page).

## 3. Site analytics page (`/analytics`)

Scope decision needed — see question below. Default proposal:

- New route `src/routes/analytics.tsx`.
- Client-side lightweight tracker: on every route change, POST `{ path, referrer, ua, ts }` to a TanStack server function that writes to a `page_views` table via Lovable Cloud.
  - Requires enabling Lovable Cloud (Supabase) — will prompt.
  - Table: `page_views(id, path, referrer, user_agent, country, created_at)` with `GRANT INSERT TO anon` and `GRANT SELECT TO authenticated` + `has_role(...,'admin')` RLS for reads.
- `/analytics` page renders:
  - Total views (24h / 7d / 30d) metric cards in the same style as the design.
  - Bar chart: views per day (Recharts, lime accent).
  - Top pages table.
  - Top referrers table.
- Page is gated: only visible when the visitor holds the `admin` role (via `user_roles` + `has_role`). Non-admins see a 404.
- Also embed a "Powered by Vercel Analytics" link to the Vercel dashboard for the deeper metrics Vercel captures.

## 4. Temu ad slider (top-right)

- New component `src/components/TemuAdSlider.tsx`.
- 4 slides, one image + affiliate link each:
  1. `user-uploads://f3513bbd-...png` → `https://temu.to/k/emxmibwsg5o`
  2. `user-uploads://b59b656c-...png` → `https://temu.to/k/ew9fr5mzld9`
  3. `user-uploads://7b95d294-...png` → `https://temu.to/k/emwywlaob6a`
  4. `user-uploads://dad9d650-...png` → `https://temu.to/k/eyifd4ef19j`
- Images imported as Lovable Assets (`lovable-assets create` → `.asset.json`), not committed as binaries.
- Behavior: single fixed-size container (~200×110 px), auto-advances every 5s with a subtle fade, clickable `<a target="_blank" rel="sponsored noopener">` wrapping the current slide. Small "Ad" label + dots indicator underneath, matching the dark card / border tokens already in `styles.css`.
- Placement: top-right on the home page only, aligned with the header row so it doesn't disturb the centered hero. On mobile it drops below the header. Not shown on `/check/$handle`, `/rules`, `/recover`, `/analytics` to keep those pages clean — confirm if you want it site-wide instead.

## Technical notes

- Files touched: `src/routes/__root.tsx`, `src/routes/index.tsx`, `src/routes/analytics.tsx` (new), `src/components/TemuAdSlider.tsx` (new), `src/components/SiteHeader.tsx` (minor), `public/sitemap.xml`, `public/robots.txt`, plus 4 asset pointer files under `src/assets/`.
- New dep: `@vercel/analytics` (and `@vercel/speed-insights` if approved).
- Requires enabling Lovable Cloud for the analytics table + admin role check.

## One clarifying question

Should `/analytics` be admin-gated (requires login as `mfckr_eth`), or a public dashboard anyone can see? Admin-gated is the safer default; I'll go with that unless you say otherwise.
