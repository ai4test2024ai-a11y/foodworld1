import { useMemo, useState } from "react";
import { useApp } from "../state/AppContext";
import { CATEGORIES } from "../data/lexicon";
import type { Food, Rarity } from "../data/types";
import {
  RARITY_ORDER, allIngredients, citiesOfCountry, countryName, foodName,
  getAllFoods, getCountries, ingredientLabel, loc, rarityOf,
} from "../data/store";
import { Bar, Btn, EmptyState, SectionTitle } from "../components/ui";
import { sfx } from "../sound";

const PAGE = 60;
const RARITY_COLOR: Record<Rarity, string> = {
  common: "var(--muted)",
  uncommon: "var(--teal)",
  rare: "#6aa8e8",
  epic: "#b07ce8",
  legendary: "var(--saffron)",
  mythic: "var(--pom)",
};

export default function Collection() {
  const { t, lang, nav, profile } = useApp();
  const [tab, setTab] = useState<"foods" | "ingredients">("foods");
  const [q, setQ] = useState("");
  const [country, setCountry] = useState("all");
  const [cat, setCat] = useState("all");
  const [rar, setRar] = useState<"all" | Rarity>("all");
  const [state, setState] = useState<"all" | "yes" | "no">("all");
  const [veg, setVeg] = useState(false);
  const [page, setPage] = useState(0);

  const foods = useMemo(() => getAllFoods(), []);
  const disc = useMemo(() => new Set(profile.discovered), [profile.discovered]);
  const ingDisc = useMemo(() => new Set(profile.discoveredIngredients), [profile.discoveredIngredients]);

  const stats = useMemo(() => {
    const countries = getCountries();
    const totalCities = countries.reduce((a, c) => a + citiesOfCountry(c.id).length, 0);
    const startedCountries = countries.filter((c) => foods.some((f) => f.countryId === c.id && disc.has(f.id))).length;
    return {
      foodsFound: profile.discovered.length,
      foodsTotal: foods.length,
      countriesFound: startedCountries,
      countriesTotal: countries.length,
      citiesTotal: totalCities,
      ingredientsFound: profile.discoveredIngredients.length,
      ingredientsTotal: allIngredients().length,
    };
  }, [foods, disc, profile]);

  const filtered = useMemo(() => {
    const nq = q.trim().toLowerCase();
    return foods.filter((f) => {
      if (country !== "all" && f.countryId !== country) return false;
      if (cat !== "all" && !f.categories.includes(cat)) return false;
      if (rar !== "all" && rarityOf(f) !== rar) return false;
      if (veg && !f.veg) return false;
      const found = disc.has(f.id);
      if (state === "yes" && !found) return false;
      if (state === "no" && found) return false;
      if (nq) {
        const hay = `${f.name.en} ${f.name.fa ?? ""} ${f.name.ar ?? ""} ${countryName(f.countryId, "en")}`.toLowerCase();
        if (!hay.includes(nq)) return false;
      }
      return true;
    });
  }, [foods, q, country, cat, rar, state, veg, disc]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const pageFoods = filtered.slice(page * PAGE, page * PAGE + PAGE);

  const pct = stats.foodsTotal ? Math.round((stats.foodsFound / stats.foodsTotal) * 1000) / 10 : 0;

  return (
    <div>
      <SectionTitle kicker={`📖 ${pct}%`} title={t("col.title")} />
      <p className="-mt-2 mb-5 text-sm text-muted">{t("col.sub")}</p>

      {/* world progress */}
      <div className="card relative mb-6 overflow-hidden p-5">
        <div aria-hidden className="absolute -top-16 -start-10 h-48 w-48 rounded-full bg-pom/10 blur-3xl" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { a: stats.foodsFound, b: stats.foodsTotal, l: t("col.foods"), i: "🍽️" },
            { a: stats.countriesFound, b: stats.countriesTotal, l: t("col.countries"), i: "🌍" },
            { a: stats.ingredientsFound, b: stats.ingredientsTotal, l: t("col.ingredients"), i: "🧂" },
            { a: Math.round(pct), b: 100, l: `${t("journey.completion")} %`, i: "🌎" },
          ].map((x) => (
            <div key={x.l} className="text-center">
              <div className="text-xl" aria-hidden>{x.i}</div>
              <div className="font-display text-xl font-extrabold">{x.a.toLocaleString()}<span className="text-xs font-bold text-muted"> / {x.b.toLocaleString()}</span></div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted">{x.l}</div>
            </div>
          ))}
        </div>
        <Bar value={stats.foodsFound} max={Math.max(stats.foodsTotal, 1)} className="mt-4" />
        <div className="mt-2 text-center font-display text-sm font-bold text-saffron">{t("col.worldGoal")}</div>
      </div>

      {/* tabs */}
      <div className="mb-4 flex gap-2">
        <Btn size="sm" variant={tab === "foods" ? "primary" : "ghost"} onClick={() => setTab("foods")}>📖 {t("col.tab.foods")}</Btn>
        <Btn size="sm" variant={tab === "ingredients" ? "primary" : "ghost"} onClick={() => setTab("ingredients")}>🧂 {t("col.tab.ingredients")}</Btn>
      </div>

      {tab === "foods" ? (
        <>
          {/* filters */}
          <div className="card mb-4 space-y-2.5 p-3">
            <div className="relative">
              <span aria-hidden className="pointer-events-none absolute inset-y-0 start-3 flex items-center text-muted">🔎</span>
              <input
                value={q}
                onChange={(e) => { setQ(e.target.value); setPage(0); }}
                placeholder={t("lib.searchPh")}
                aria-label={t("nav.search")}
                className="w-full rounded-xl border border-line bg-panel2 py-2.5 pe-3 ps-9 text-sm font-semibold outline-none placeholder:text-muted/70 focus:border-saffron"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              <select value={country} onChange={(e) => { setCountry(e.target.value); setPage(0); }} aria-label={t("lib.country")} className="chip bg-panel2 px-2 py-1.5 text-xs font-bold text-ink">
                <option value="all">{t("lib.allCountries")}</option>
                {getCountries().map((c) => <option key={c.id} value={c.id}>{c.flag} {loc(c.name, lang)}</option>)}
              </select>
              <select value={cat} onChange={(e) => { setCat(e.target.value); setPage(0); }} aria-label={t("lib.category")} className="chip bg-panel2 px-2 py-1.5 text-xs font-bold text-ink">
                <option value="all">{t("lib.allCats")}</option>
                {Object.entries(CATEGORIES).map(([k, v]) => <option key={k} value={k}>{loc(v, lang)}</option>)}
              </select>
              <select value={rar} onChange={(e) => { setRar(e.target.value as "all" | Rarity); setPage(0); }} aria-label={t("col.rarity")} className="chip bg-panel2 px-2 py-1.5 text-xs font-bold text-ink">
                <option value="all">{t("col.rarity")}: {t("col.all")}</option>
                {RARITY_ORDER.map((r) => <option key={r} value={r}>{t(`rarity.${r}`)}</option>)}
              </select>
              <button onClick={() => { setState(state === "yes" ? "all" : "yes"); setPage(0); }} className={`chip px-3 py-1.5 text-xs font-bold ${state === "yes" ? "border-pist text-pist" : "text-muted"}`}>✓ {t("col.discovered")}</button>
              <button onClick={() => { setState(state === "no" ? "all" : "no"); setPage(0); }} className={`chip px-3 py-1.5 text-xs font-bold ${state === "no" ? "border-pom text-pom" : "text-muted"}`}>🔒 {t("col.undiscovered")}</button>
              <button onClick={() => { setVeg(!veg); setPage(0); }} className={`chip px-3 py-1.5 text-xs font-bold ${veg ? "border-pist text-pist" : "text-muted"}`}>🌱 {t("lib.veg")}</button>
            </div>
          </div>

          {pageFoods.length === 0 ? (
            <div className="card"><EmptyState emoji="🍽️" text={t("lib.empty")} /></div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {pageFoods.map((f) => {
                  const locked = !disc.has(f.id);
                  return <CollectionCard key={f.id} f={f} locked={locked} onOpen={() => { if (!locked) nav({ name: "library", foodId: f.id }); }} />;
                })}
              </div>
              {pages > 1 && (
                <div className="mt-5 flex items-center justify-center gap-3">
                  <Btn size="sm" variant="ghost" onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0}>‹</Btn>
                  <span className="text-xs font-bold text-muted">{page + 1} / {pages}</span>
                  <Btn size="sm" variant="ghost" onClick={() => setPage(Math.min(pages - 1, page + 1))} disabled={page >= pages - 1}>›</Btn>
                </div>
              )}
            </>
          )}
        </>
      ) : (
        <IngredientBook ingDisc={ingDisc} />
      )}
    </div>
  );
}

function CollectionCard({ f, locked, onOpen }: { f: Food; locked: boolean; onOpen: () => void }) {
  const { t, lang } = useApp();
  const r = rarityOf(f);
  return (
    <button onClick={() => { onOpen(); sfx.click(); }} className="card group flex flex-col items-center gap-2 p-3 text-center transition-all hover:-translate-y-1 hover:border-saffron/50">
      <span className={`text-4xl transition-transform group-hover:scale-110 ${locked ? "opacity-30 grayscale blur-[2px]" : ""}`} aria-hidden>{locked ? "❓" : f.emoji}</span>
      <span className={`w-full truncate text-xs font-bold ${locked ? "text-muted" : ""}`}>{locked ? "· · ·" : foodName(f, lang)}</span>
      <span className="w-full truncate text-[10px] text-muted">{locked ? "?" : `${countryName(f.countryId, lang)}${f.city ? ` · ${f.city}` : ""}`}</span>
      <span className="text-[9px] font-extrabold uppercase tracking-wider" style={{ color: RARITY_COLOR[r] }}>
        {locked ? `🔒 ${t("col.locked")}` : t(`rarity.${r}`)}
      </span>
    </button>
  );
}

function IngredientBook({ ingDisc }: { ingDisc: Set<string> }) {
  const { t, lang, nav } = useApp();
  const foods = useMemo(() => getAllFoods(), []);
  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const f of foods) for (const i of f.ingredients) m.set(i, (m.get(i) ?? 0) + 1);
    return m;
  }, [foods]);
  const [showOnlyFound, setShowOnlyFound] = useState(false);
  const list = allIngredients().filter((i) => !showOnlyFound || ingDisc.has(i));

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-bold text-muted">
          {t("common.of", { a: ingDisc.size, b: counts.size })} · {t("col.ingredients")}
        </span>
        <button onClick={() => setShowOnlyFound(!showOnlyFound)} className={`chip px-3 py-1.5 text-xs font-bold ${showOnlyFound ? "border-pist text-pist" : "text-muted"}`}>
          ✓ {t("col.discovered")}
        </button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {list.map((i) => {
          const found = ingDisc.has(i);
          return (
            <button
              key={i}
              onClick={() => nav({ name: "library" })}
              className={`chip px-3 py-1.5 text-xs font-bold transition-all hover:border-saffron ${found ? "text-ink" : "text-muted/60"}`}
            >
              {found ? "🧂" : "❔"} {ingredientLabel(i, lang)}
              <span className={`ms-1 ${found ? "text-saffron" : "text-muted/50"}`}>×{counts.get(i)}</span>
            </button>
          );
        })}
      </div>
      {list.length === 0 && <p className="py-8 text-center text-sm text-muted">{t("home.noneYet")}</p>}
    </div>
  );
}
