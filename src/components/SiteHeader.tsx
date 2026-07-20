import { Link, useRouterState } from "@tanstack/react-router";
import logoAsset from "@/assets/logo.jpg.asset.json";

const TABS = [
  { to: "/", label: "Check" },
  { to: "/rules", label: "Rules" },
  { to: "/recover", label: "Recover" },
] as const;

export function SiteHeader() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <header className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-6">
      <Link to="/" className="flex items-center gap-2.5">
        <img
          src="/newlogo.png"
          alt="xlivechecker"
          className="h-9 w-9 rounded-full border border-border object-cover"
        />
        <span className="text-[15px] font-semibold tracking-tight">xlivechecker</span>
      </Link>

      <nav
        aria-label="Primary"
        className="no-scrollbar flex items-center gap-1 overflow-x-auto rounded-full border border-border bg-card px-1 py-1"
      >
        {TABS.map((t) => {
          const active =
            t.to === "/" ? pathname === "/" || pathname.startsWith("/check") : pathname.startsWith(t.to);
          return (
            <Link
              key={t.to}
              to={t.to}
              className={
                "whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-medium transition " +
                (active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground")
              }
            >
              {t.label}
            </Link>
          );
        })}
      </nav>

      <a
        href="https://x.com/mfckr_eth"
        target="_blank"
        rel="noreferrer"
        className="hidden text-xs text-muted-foreground hover:text-foreground sm:inline"
      >
        @mfckr_eth
      </a>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mx-auto mt-16 flex max-w-6xl flex-col items-start justify-between gap-3 border-t border-border px-6 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
      <p>xlivechecker &middot; independent risk scanner &middot; not affiliated with X Corp.</p>
      <p>
        Built by{" "}
        <a
          href="https://x.com/mfckr_eth"
          target="_blank"
          rel="noreferrer"
          className="text-foreground hover:text-primary"
        >
          @mfckr_eth
        </a>
      </p>
    </footer>
  );
}
