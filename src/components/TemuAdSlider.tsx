import { useEffect, useState } from "react";
import temu1 from "@/assets/temu-1.png.asset.json";
import temu2 from "@/assets/temu-2.png.asset.json";
import temu3 from "@/assets/temu-3.png.asset.json";
import temu4 from "@/assets/temu-4.png.asset.json";

const ADS = [
  { img: temu1.url, href: "https://temu.to/k/emxmibwsg5o" },
  { img: temu2.url, href: "https://temu.to/k/ew9fr5mzld9" },
  { img: temu3.url, href: "https://temu.to/k/emwywlaob6a" },
  { img: temu4.url, href: "https://temu.to/k/eyifd4ef19j" },
];

export function TemuAdSlider() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % ADS.length), 4500);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="w-[188px] shrink-0">
      <div className="mb-1 flex items-center justify-between px-1 text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
        <span>Sponsored</span>
        <span>Ad</span>
      </div>
      <div className="relative h-[92px] overflow-hidden rounded-xl border border-border bg-card">
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
              (idx === i ? "w-4 bg-primary" : "w-1 bg-border hover:bg-muted-foreground")
            }
          />
        ))}
      </div>
    </div>
  );
}
