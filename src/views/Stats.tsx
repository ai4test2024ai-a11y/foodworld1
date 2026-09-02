import { useMemo } from "react";
import { useApp } from "../state/AppContext";
import { getAllFoods } from "../data/store";
import { Bar, CountUp, SectionTitle } from "../components/ui";

/** Lifetime statistics — all derived from the locally-persisted profile. */
export default function Stats() {
  const { t, profile } = useApp();

  const foods = useMemo(() => getAllFoods(), []);
  const disc = useMemo(() => new Set(profile.discovered), [profile.discovered]);

  const totalQ = profile.correct + profile.wrong;
  const accuracy = totalQ > 0 ? Math.round((profile.correct / totalQ) * 100) : 0;
  const countriesFound = useMemo(
    () => new Set(foods.filter((f) => disc.has(f.id)).map((f) => f.countryId)).size,
    [foods, disc]
  );

  const tiles = [
    { i: "🎮", v: profile.gamesPlayed, l: t("stats.totalGames"), c: "text-ink" },
    { i: "❓", v: totalQ, l: t("stats.totalQ"), c: "text-ink" },
    { i: "✅", v: profile.correct, l: t("stats.correct"), c: "text-pist" },
    { i: "❌", v: profile.wrong, l: t("stats.wrong"), c: "text-pom" },
    { i: "🏆", v: profile.bestGameScore, l: t("stats.bestScore"), c: "text-saffron" },
    { i: "⚡", v: profile.bestStreak, l: t("stats.bestStreak"), c: "text-teal" },
    { i: "🔥", v: profile.bestComboCount, l: t("stats.bestCombo"), c: "text-pom" },
    { i: "🌍", v: countriesFound, l: t("stats.countries"), c: "text-ink" },
    { i: "🍽️", v: profile.discovered.length, l: t("stats.foods"), c: "text-ink" },
    { i: "🧂", v: profile.discoveredIngredients.length, l: t("stats.ingredients"), c: "text-ink" },
    { i: "🪙", v: profile.coins, l: t("stats.coins"), c: "text-saffron" },
  ];

  return (
    <div className="mx-auto max-w-3xl">
      <SectionTitle kicker="📊" title={t("stats.title")} />
      <p className="-mt-2 mb-5 text-sm text-muted">{t("stats.sub")}</p>

      {/* accuracy highlight */}
      <div className="card relative mb-5 overflow-hidden p-5">
        <div aria-hidden className="absolute -top-16 -end-12 h-48 w-48 rounded-full bg-pist/10 blur-3xl" />
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-muted">{t("stats.accuracy")}</div>
            <div className="font-display text-4xl font-extrabold text-pist">
              <CountUp value={accuracy} />%
            </div>
          </div>
          <div className="flex-1">
            <Bar value={profile.correct} max={Math.max(totalQ, 1)} color="var(--pist)" />
            <div className="mt-1.5 text-xs font-bold text-muted">
              <span className="text-pist">{profile.correct}</span> / {totalQ}
            </div>
          </div>
        </div>
      </div>

      {/* stat tiles */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {tiles.map((s) => (
          <div key={s.l} className="card p-4 text-center transition-all hover:-translate-y-0.5 hover:border-saffron/40">
            <div className="text-xl" aria-hidden>{s.i}</div>
            <div className={`mt-1 font-display text-2xl font-extrabold ${s.c}`}>
              <CountUp value={s.v} />
            </div>
            <div className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-muted">{s.l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
