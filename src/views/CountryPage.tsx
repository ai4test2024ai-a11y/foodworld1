import { useMemo } from "react";
import { useApp } from "../state/AppContext";
import { CONTINENT_LABELS } from "../data/countries";
import type { City } from "../data/cities";
import { citiesOfCountry, cuisineText, foodsByCountry, foodsOfCity, foodName, getCountry, loc, rarityOf } from "../data/store";
import { Bar, Btn, EmptyState } from "../components/ui";
import { sfx } from "../sound";

const RARITY_COLOR: Record<string, string> = {
  common: "var(--muted)",
  uncommon: "var(--teal)",
  rare: "#6aa8e8",
  epic: "#b07ce8",
  legendary: "var(--saffron)",
  mythic: "var(--pom)",
};

export default function CountryPage({ countryId }: { countryId: string }) {
  const { t, lang, nav, profile } = useApp();
  const c = getCountry(countryId);
  const foods = useMemo(() => foodsByCountry(countryId), [countryId]);
  const cities = useMemo(() => citiesOfCountry(countryId), [countryId]);
  const disc = useMemo(() => new Set(profile.discovered), [profile.discovered]);

  if (!c) return <EmptyState emoji="🗺️" text={t("cn.empty")} />;

  const found = foods.filter((f) => disc.has(f.id)).length;
  const cityStats = cities.map((ct) => {
    const cf = foodsOfCity(ct);
    const cfFound = cf.filter((f) => disc.has(f.id)).length;
    return { ct, total: cf.length, found: cfFound };
  });
  const citiesDiscovered = cityStats.filter((x) => x.found > 0).length;
  const pct = foods.length ? Math.round((found / foods.length) * 100) : 0;

  return (
    <div>
      <button onClick={() => nav({ name: "map" })} className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-muted hover:text-saffron">
        <span aria-hidden className="rtl:rotate-180">←</span> {t("nav.map")}
      </button>

      {/* header */}
      <div className="card relative mb-6 overflow-hidden">
        <div aria-hidden className="absolute -top-20 -end-12 h-56 w-56 rounded-full bg-saffron/10 blur-3xl" />
        <div className="flex flex-col gap-5 p-6 lg:flex-row lg:items-center">
          <span className="text-7xl lg:text-8xl" aria-hidden>{c.flag}</span>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-bold uppercase tracking-[0.25em] text-saffron">
              {countryId === "iran" ? `🏆 ${t("journey.iran.title")}` : `${loc(CONTINENT_LABELS[c.continent], lang)} · ${t("journey.title")}`}
            </div>
            <h1 className="font-display text-3xl font-extrabold sm:text-4xl">{loc(c.name, lang)}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">{cuisineText(c, lang)}</p>
            {countryId === "iran" && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-saffron/90">{t("journey.iran.sub")}</p>}
            <div className="mt-4 flex flex-wrap gap-2">
              <Btn onClick={() => nav({ name: "game", config: { mode: "country", difficulty: "medium", countryId } })}>▶ {t("journey.countryQuiz")}</Btn>
              {cities.length > 0 && (
                <Btn variant="ghost" onClick={() => nav({ name: "game", config: { mode: "geo", difficulty: "medium", countryId } })}>🧭 {t("mode.geo")}</Btn>
              )}
              {cities.length > 0 && (
                <Btn variant="ghost" onClick={() => nav({ name: "game", config: { mode: "city", difficulty: "medium", countryId } })}>🏙️ {t("journey.cityQuiz")}</Btn>
              )}
            </div>
          </div>
          <div className="w-full shrink-0 lg:w-64">
            <div className="flex items-end justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted">{t("journey.completion")}</span>
              <span className="font-display text-2xl font-extrabold text-saffron">{pct}%</span>
            </div>
            <Bar value={found} max={Math.max(foods.length, 1)} className="mt-1" />
            <div className="mt-3 grid grid-cols-2 gap-2 text-center">
              <div className="rounded-xl border border-line bg-panel2 p-2.5">
                <div className="font-display text-lg font-extrabold">{found}<span className="text-xs text-muted">/{foods.length}</span></div>
                <div className="text-[9px] font-bold uppercase tracking-wider text-muted">{t("journey.foodsFound")}</div>
              </div>
              <div className="rounded-xl border border-line bg-panel2 p-2.5">
                <div className="font-display text-lg font-extrabold">{citiesDiscovered}<span className="text-xs text-muted">/{cities.length}</span></div>
                <div className="text-[9px] font-bold uppercase tracking-wider text-muted">{t("journey.citiesFound")}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* cities */}
      {cities.length > 0 && (
        <>
          <h3 className="mb-3 font-display text-xl font-bold">🏙️ {t("journey.cities")}</h3>
          <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {cityStats.map(({ ct, total, found: cf }) => (
              <a key={ct.id} href={`#city-${ct.id}`} onClick={() => sfx.click()} className="card group p-3.5 transition-all hover:-translate-y-0.5 hover:border-saffron/60">
                <div className="flex items-center justify-between">
                  <span className="truncate font-display text-sm font-bold">{loc(ct.name, lang)}</span>
                  {cf > 0 && cf === total && total > 0 && <span className="text-xs" aria-hidden>✅</span>}
                </div>
                <div className="mt-1 text-[10px] font-bold text-muted">{t("common.of", { a: cf, b: total })} {t("map.foods")}</div>
                <Bar value={cf} max={Math.max(total, 1)} className="mt-2" />
              </a>
            ))}
          </div>
        </>
      )}

      {/* per-city food shelves */}
      {cityStats.filter((x) => x.total > 0).map(({ ct, total, found: cf }) => (
        <CityShelf key={ct.id} ct={ct} total={total} found={cf} disc={disc} />
      ))}

      {/* remaining national foods */}
      <NationalShelf countryId={countryId} disc={disc} />
    </div>
  );
}

function CityShelf({ ct, total, found, disc }: { ct: City; total: number; found: number; disc: Set<string> }) {
  const { t, lang, nav } = useApp();
  const foods = foodsOfCity(ct);
  return (
    <section id={`city-${ct.id}`} className="mb-8 scroll-mt-24">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <h4 className="font-display text-lg font-bold">📍 {loc(ct.name, lang)}</h4>
          <div className="text-[11px] font-bold text-muted">{t("journey.associated", { c: loc(ct.name, lang) })} · {t("common.of", { a: found, b: total })}</div>
        </div>
        <Bar value={found} max={Math.max(total, 1)} className="w-32" />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {foods.map((f) => {
          const locked = !disc.has(f.id);
          return <FoodCard key={f.id} id={f.id} emoji={f.emoji} name={foodName(f, lang)} rarity={rarityOf(f)} locked={locked} onOpen={() => { if (!locked) nav({ name: "library", foodId: f.id }); }} />;
        })}
      </div>
    </section>
  );
}

function NationalShelf({ countryId, disc }: { countryId: string; disc: Set<string> }) {
  const { t, lang, nav } = useApp();
  const all = foodsByCountry(countryId);
  const c = getCountry(countryId);
  if (!c) return null;
  return (
    <section className="mb-4">
      <h4 className="mb-3 font-display text-lg font-bold">🍽️ {loc(c.name, lang)} — {t("col.foods")}</h4>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {all.map((f) => {
          const locked = !disc.has(f.id);
          return <FoodCard key={f.id} id={f.id} emoji={f.emoji} name={foodName(f, lang)} rarity={rarityOf(f)} locked={locked} onOpen={() => { if (!locked) nav({ name: "library", foodId: f.id }); }} />;
        })}
      </div>
    </section>
  );
}

function FoodCard({ emoji, name, rarity, locked, onOpen }: { id: string; emoji: string; name: string; rarity: string; locked: boolean; onOpen: () => void }) {
  const { t } = useApp();
  return (
    <button onClick={onOpen} className="card group flex flex-col items-center gap-2 p-3 text-center transition-all hover:-translate-y-1 hover:border-saffron/50">
      <span className={`text-4xl transition-transform group-hover:scale-110 ${locked ? "opacity-30 grayscale blur-[2px]" : ""}`} aria-hidden>{locked ? "❓" : emoji}</span>
      <span className={`w-full truncate text-xs font-bold ${locked ? "text-muted" : ""}`}>{locked ? "· · ·" : name}</span>
      <span className="text-[9px] font-extrabold uppercase tracking-wider" style={{ color: RARITY_COLOR[rarity] }}>
        {locked ? `🔒 ${t("col.locked")}` : t(`rarity.${rarity}`)}
      </span>
    </button>
  );
}
