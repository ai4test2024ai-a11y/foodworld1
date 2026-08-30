import { useMemo, useState } from "react";
import { useApp } from "../state/AppContext";
import { CONTINENT_LABELS } from "../data/countries";
import type { Continent } from "../data/types";
import { citiesOfCountry, foodsByCountry, getCountries, loc } from "../data/store";
import { Bar, SectionTitle } from "../components/ui";
import { sfx } from "../sound";

export default function WorldMap() {
  const { t, lang, nav, profile } = useApp();
  const [cont, setCont] = useState<"all" | Continent>("all");
  const [status, setStatus] = useState<"all" | "none" | "mid" | "done">("all");

  const rows = useMemo(() => {
    const disc = new Set(profile.discovered);
    return getCountries().map((c) => {
      const foods = foodsByCountry(c.id);
      const found = foods.filter((f) => disc.has(f.id)).length;
      const cities = citiesOfCountry(c.id);
      const citiesStarted = cities.filter((ct) => ct.foods.length > 0).length;
      const pct = foods.length ? Math.round((found / foods.length) * 100) : 0;
      const state: "none" | "mid" | "done" = found === 0 ? "none" : pct === 100 ? "done" : "mid";
      return { c, foods: foods.length, found, cities: cities.length, citiesStarted, pct, state };
    });
  }, [profile.discovered]);

  const world = useMemo(() => {
    const disc = new Set(profile.discovered);
    const totalFoods = rows.reduce((a, r) => a + r.foods, 0);
    const foundFoods = rows.reduce((a, r) => a + r.found, 0);
    return {
      totalFoods,
      foundFoods,
      countriesStarted: rows.filter((r) => r.found > 0).length,
      countriesDone: rows.filter((r) => r.state === "done").length,
      totalCities: rows.reduce((a, r) => a + r.cities, 0),
      citiesStarted: rows.reduce((a, r) => a + r.citiesStarted, 0),
    };
  }, [rows, profile.discovered]);

  const filtered = rows.filter((r) => (cont === "all" || r.c.continent === cont) && (status === "all" || r.state === status));

  const stateDot = (s: "none" | "mid" | "done") =>
    s === "done" ? "bg-pist" : s === "mid" ? "bg-saffron" : "bg-line2";

  return (
    <div>
      <SectionTitle kicker={`🗺️ ${t("map.title")}`} title={t("col.worldTitle")} />
      <p className="-mt-2 mb-5 text-sm text-muted">{t("map.sub")}</p>

      {/* world stats */}
      <div className="card relative mb-6 overflow-hidden p-5">
        <div aria-hidden className="absolute -top-16 -end-10 h-48 w-48 rounded-full bg-saffron/10 blur-3xl" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { v: `${world.foundFoods}`, s: `/ ${world.totalFoods}`, l: t("col.foods"), i: "🍽️" },
            { v: `${world.countriesStarted}`, s: `/ ${rows.length}`, l: t("col.countries"), i: "🌍" },
            { v: `${world.citiesStarted}`, s: `/ ${world.totalCities}`, l: t("col.cities"), i: "🏙️" },
            { v: `${world.totalFoods ? Math.round((world.foundFoods / world.totalFoods) * 1000) / 10 : 0}%`, s: "", l: t("journey.completion"), i: "⭐" },
          ].map((x) => (
            <div key={x.l} className="text-center">
              <div className="text-xl" aria-hidden>{x.i}</div>
              <div className="font-display text-2xl font-extrabold">
                {x.v} <span className="text-sm font-bold text-muted">{x.s}</span>
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted">{x.l}</div>
            </div>
          ))}
        </div>
        <Bar value={world.foundFoods} max={Math.max(world.totalFoods, 1)} className="mt-4" />
        <div className="mt-2 text-center font-display text-sm font-bold text-saffron">{t("col.worldGoal")}</div>
      </div>

      {/* filters */}
      <div className="card mb-5 flex flex-wrap items-center gap-1.5 p-3">
        <button onClick={() => setCont("all")} className={`chip px-3 py-1.5 text-xs font-bold ${cont === "all" ? "border-saffron text-saffron" : "text-muted"}`}>{t("col.all")}</button>
        {(Object.keys(CONTINENT_LABELS) as Continent[]).map((k) => (
          <button key={k} onClick={() => setCont(k)} className={`chip px-3 py-1.5 text-xs font-bold ${cont === k ? "border-saffron text-saffron" : "text-muted"}`}>
            {loc(CONTINENT_LABELS[k], lang)}
          </button>
        ))}
        <span aria-hidden className="mx-1 h-5 w-px bg-line" />
        {(["all", "none", "mid", "done"] as const).map((s) => (
          <button key={s} onClick={() => setStatus(s)} className={`chip flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold ${status === s ? "border-saffron text-saffron" : "text-muted"}`}>
            <span className={`inline-block h-2 w-2 rounded-full ${stateDot(s === "all" ? "mid" : s)}`} />
            {s === "all" ? t("col.all") : s === "none" ? t("map.notStarted") : s === "mid" ? t("map.inProgress") : t("map.completed")}
          </button>
        ))}
      </div>

      {/* board */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((r) => (
          <button
            key={r.c.id}
            onClick={() => { nav({ name: "countries", countryId: r.c.id }); sfx.click(); }}
            className={`card group relative overflow-hidden p-4 text-start transition-all hover:-translate-y-1 hover:border-saffron/60 ${r.state === "done" ? "border-pist/40" : ""}`}
          >
            <span className={`absolute top-3 end-3 h-2.5 w-2.5 rounded-full ${stateDot(r.state)}`} aria-hidden />
            <div className="flex items-center gap-3">
              <span className="text-4xl transition-transform group-hover:scale-110" aria-hidden>{r.c.flag}</span>
              <div className="min-w-0 flex-1">
                <div className="truncate font-display text-base font-bold">{loc(r.c.name, lang)}</div>
                <div className="text-[11px] text-muted">
                  🍽 {t("common.of", { a: r.found, b: r.foods })} · 🏙 {r.citiesStarted}/{r.cities}
                </div>
              </div>
              <span className="font-display text-lg font-extrabold text-saffron">{r.pct}%</span>
            </div>
            <Bar value={r.found} max={Math.max(r.foods, 1)} className="mt-3" color={r.state === "done" ? "var(--pist)" : "var(--saffron)"} />
          </button>
        ))}
      </div>
      {filtered.length === 0 && <p className="py-10 text-center text-sm text-muted">{t("search.noResults")}</p>}
    </div>
  );
}
