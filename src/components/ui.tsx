import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

/* ── Buttons ── */

type BtnVariant = "primary" | "ghost" | "danger" | "pist" | "outline";

export function Btn({
  children,
  onClick,
  variant = "primary",
  size = "md",
  disabled,
  className = "",
  title,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: BtnVariant;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  className?: string;
  title?: string;
}) {
  const v: Record<BtnVariant, string> = {
    primary: "bg-saffron text-[#241705] hover:bg-saffron2 shadow-[0_6px_20px_-6px_rgba(242,168,59,0.55)]",
    ghost: "bg-panel2 text-ink border border-line hover:border-line2",
    outline: "bg-transparent text-saffron border border-saffron/50 hover:bg-saffron/10",
    danger: "bg-pom/15 text-pom border border-pom/40 hover:bg-pom/25",
    pist: "bg-pist/15 text-pist border border-pist/40 hover:bg-pist/25",
  };
  const s = { sm: "px-3 py-1.5 text-xs", md: "px-4 py-2.5 text-sm", lg: "px-6 py-3.5 text-base" }[size];
  return (
    <button
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-bold transition-all duration-150 active:scale-[0.97] disabled:opacity-40 ${v[variant]} ${s} ${className}`}
    >
      {children}
    </button>
  );
}

/* ── Food tile: gradient + emoji "image" that can never break ── */

const TILE_HUES: Record<string, string> = {
  stew: "from-[#5a3413] to-[#2c1a0c]",
  soup: "from-[#3d4420] to-[#20230f]",
  ash: "from-[#3d4420] to-[#20230f]",
  rice: "from-[#5c4a12] to-[#2e2409]",
  kabab: "from-[#5c2418] to-[#2e120c]",
  noodles: "from-[#4c3a16] to-[#261d0b]",
  bread: "from-[#514019] to-[#28200c]",
  dumpling: "from-[#4a4018] to-[#25200c]",
  street: "from-[#572c14] to-[#2b160a]",
  fastfood: "from-[#572c14] to-[#2b160a]",
  dessert: "from-[#5a2d3f] to-[#2d1620]",
  sweet: "from-[#5a2d3f] to-[#2d1620]",
  drink: "from-[#1d4a44] to-[#0e2522]",
  salad: "from-[#2f4d1e] to-[#17270f]",
  side: "from-[#2f4d1e] to-[#17270f]",
  breakfast: "from-[#5c4a12] to-[#2e2409]",
  seafood: "from-[#173e4d] to-[#0b1f26]",
  curry: "from-[#5c3412] to-[#2e1a09]",
  snack: "from-[#4c3a16] to-[#261d0b]",
  traditional: "from-[#4d3318] to-[#271a0c]",
  fermented: "from-[#3a4a20] to-[#1d2510]",
};

export function FoodTile({ emoji, cat, size = "md", className = "" }: { emoji: string; cat?: string; size?: "sm" | "md" | "lg" | "xl"; className?: string }) {
  const hue = TILE_HUES[cat ?? "traditional"] ?? TILE_HUES.traditional;
  const sz = { sm: "h-12 w-12 text-2xl", md: "h-20 w-20 text-4xl", lg: "h-28 w-28 text-6xl", xl: "h-40 w-40 text-8xl" }[size];
  return (
    <div
      aria-hidden
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br ${hue} ${sz} ${className}`}
      style={{ border: "1px solid var(--line)" }}
    >
      <span className="absolute -top-3 start-1/2 h-10 w-24 -translate-x-1/2 rounded-full bg-white/10 blur-xl rtl:translate-x-1/2" />
      <span className="drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)] select-none">{emoji || "🍽️"}</span>
    </div>
  );
}

/* ── Modal ── */

export function Modal({ open, onClose, children, wide }: { open: boolean; onClose: () => void; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", h);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-6 anim-fade" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className={`card max-h-[92vh] w-full overflow-y-auto rounded-b-none rounded-t-2xl p-5 sm:rounded-2xl ${wide ? "sm:max-w-3xl" : "sm:max-w-lg"} anim-rise`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

/* ── Progress ── */

export function Bar({ value, max, color = "var(--saffron)", className = "" }: { value: number; max: number; color?: string; className?: string }) {
  const pct = Math.max(0, Math.min(100, max > 0 ? (value / max) * 100 : 0));
  return (
    <div className={`h-2 overflow-hidden rounded-full bg-panel2 ${className}`} style={{ border: "1px solid var(--line)" }}>
      <div className="relative h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }}>
        <div className="sheen-bar absolute inset-0" />
      </div>
    </div>
  );
}

/* ── Count-up hook ── */

export function useCountUp(target: number, duration = 700): number {
  const [val, setVal] = useState(target);
  const prev = useRef(target);
  useEffect(() => {
    const from = prev.current;
    prev.current = target;
    if (from === target) return;
    const start = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      setVal(Math.round(from + (target - from) * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return val;
}

export function CountUp({ value, className, duration }: { value: number; className?: string; duration?: number }) {
  const v = useCountUp(value, duration);
  return <span className={className}>{v.toLocaleString()}</span>;
}

/* ── Small atoms ── */

export function Chip({ children, active, onClick }: { children: ReactNode; active?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`chip px-3 py-1.5 text-xs font-semibold transition-colors ${active ? "border-saffron/70 bg-saffron/15 text-saffron" : "text-muted hover:text-ink"}`}
    >
      {children}
    </button>
  );
}

export function SectionTitle({ kicker, title, action }: { kicker?: string; title: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-3">
      <div>
        {kicker && <div className="mb-1 text-[11px] font-bold uppercase tracking-[0.2em] text-saffron">{kicker}</div>}
        <h2 className="font-display text-2xl font-bold sm:text-3xl">{title}</h2>
      </div>
      {action}
    </div>
  );
}

export function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className="flex items-center gap-3 text-sm font-semibold"
    >
      <span className={`relative h-6 w-11 rounded-full transition-colors ${on ? "bg-saffron" : "bg-panel2"}`} style={{ border: "1px solid var(--line2)" }}>
        <span className={`absolute top-0.5 h-4.5 w-4.5 rounded-full bg-ink transition-all ${on ? "start-6" : "start-0.5"}`} style={{ width: 18, height: 18 }} />
      </span>
      {label}
    </button>
  );
}

export function EmptyState({ emoji, text }: { emoji: string; text: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-14 text-center">
      <span className="text-5xl opacity-70">{emoji}</span>
      <p className="max-w-xs text-sm text-muted">{text}</p>
    </div>
  );
}
