import { useEffect, useState } from "react";
import { X } from "lucide-react";

const ADS = [
  { img: "/Temu1.png", href: "https://temu.to/k/emxmibwsg5o" },
  { img: "/Temu2.png", href: "https://temu.to/k/ew9fr5mzld9" },
  { img: "/Temu3.png", href: "https://temu.to/k/emwywlaob6a" },
  { img: "/Temu4.png", href: "https://temu.to/k/eyifd4ef19j" },
];

const AFFILIATE_URL = "https://temu.to/k/eww5h9vdn97";
const VISIBLE_MS = 12000;
const HIDDEN_MS = 25000;

export function TemuAdSlider() {
  const [i, setI] = useState(0);
  const [visible, setVisible] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % ADS.length), 4500);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (dismissed) return;
    const cycle = () => {
      setVisible(true);
      const hideT = setTimeout(() => setVisible(false), VISIBLE_MS);
      const showT = setTimeout(cycle, VISIBLE_MS + HIDDEN_MS);
      return () => {
        clearTimeout(hideT);
        clearTimeout(showT);
      };
    };
    const cleanup = cycle();
    return cleanup;
  }, [dismissed]);

  if (dismissed) return null;

  return (
    <div
      className={
        "group relative w-[220px] shrink-0 transition-all duration-500 sm:w-[248px] " +
        (visible ? "pointer-events-auto opacity-100 translate-y-0" : "pointer-events-none opacity-0 -translate-y-2")
      }
      aria-hidden={!visible}
    >
      <div className="mb-1 flex items-center justify-between px-1 text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
        <span>Sponsored</span>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss ad"
          className="inline-flex h-4 w-4 items-center justify-center rounded-full text-muted-foreground hover:bg-card hover:text-foreground"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
      <div className="relative h-[110px] overflow-hidden rounded-xl border border-border bg-card sm:h-[124px]">
        {ADS.map((ad, idx) => (
          <a
            key={ad.href}
            href={ad.href}
            target="_blank"
            rel="sponsored noopener noreferrer"
            aria-hidden={idx !== i}
            tabIndex={idx === i ? 0 : -1}
            className={
              "absolute inset-0 transition-opacity duration-500 " +
              (idx === i ? "opacity-100" : "pointer-events-none opacity-0")
            }
          >
            <img
              src={ad.img}
              alt="Temu deal"
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </a>
        ))}

        <a
          href={AFFILIATE_URL}
          target="_blank"
          rel="sponsored noopener noreferrer"
          className="absolute inset-x-0 bottom-0 z-10 translate-y-full bg-background/95 px-2.5 py-1.5 text-[9px] leading-tight backdrop-blur transition-transform duration-300 group-hover:translate-y-0 focus:translate-y-0"
        >
          <div className="font-semibold uppercase tracking-wider text-primary">
            Become an affiliate
          </div>
          <div className="text-muted-foreground">
            Invite one person, get $11. Tap to join.
          </div>
        </a>
      </div>
      <div className="mt-1.5 flex items-center justify-center gap-1">
        {ADS.map((_, idx) => (
          <button
            key={idx}
            type="button"
            aria-label={`Show ad ${idx + 1}`}
            onClick={() => setI(idx)}
            className={
              "h-1 rounded-full transition-all " +
              (idx === i ? "w-3 bg-primary" : "w-1 bg-border hover:bg-muted-foreground")
            }
          />
        ))}
      </div>
    </div>
  );
}
