import { useMemo, useState } from "react";
import { useApp } from "../state/AppContext";
import { CONTINENT_LABELS } from "../data/countries";
import type { Continent } from "../data/types";
import { cuisineText, foodsByCountry, foodName, getCountries, loc } from "../data/store";
import { Btn, EmptyState, FoodTile, SectionTitle } from "../components/ui";
import { sfx } from "../sound";
import JourneyPage from "./CountryPage";

export default function Countries({ countryId }: { countryId?: string }) {
  const { t, lang, nav } = useApp();
  const [q, setQ] = useState("");
  const [cont, setCont] = useState<"all" | Continent>("all");

  const countries = useMemo(() => getCountries(), []);

  if (countryId) {
    return <JourneyPage countryId={countryId} />;
  }

  const filtered = countries.filter((c) => {
    if (cont !== "all" && c.continent !== cont) return false;
    const nq = q.trim().toLowerCase();
    if (nq && !`${c.name.en} ${c.name.fa ?? ""} ${c.name.ar ?? ""}`.toLowerCase().includes(nq)) return false;
    return true;
  });

  return (
    <div>
      <SectionTitle kicker={`${countries.length}`} title={t("cn.title")} />
      <p className="-mt-2 mb-5 text-sm text-muted">{t("cn.sub")}</p>

      <div className="card mb-5 space-y-3 p-4">
        <div className="relative">
          <span aria-hidden className="pointer-events-none absolute inset-y-0 start-3 flex items-center text-muted">🔎</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("cn.searchPh")}
            aria-label={t("cn.title")}
            className="w-full rounded-xl border border-line bg-panel2 py-3 pe-4 ps-10 text-sm font-semibold outline-none placeholder:text-muted/70 focus:border-saffron"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button onClick={() => setCont("all")} className={`chip px-3 py-1.5 text-xs font-bold ${cont === "all" ? "border-saffron text-saffron" : "text-muted"}`}>{t("lib.all")}</button>
          {(Object.keys(CONTINENT_LABELS) as Continent[]).map((k) => (
            <button key={k} onClick={() => setCont(k)} className={`chip px-3 py-1.5 text-xs font-bold ${cont === k ? "border-saffron text-saffron" : "text-muted"}`}>
              {loc(CONTINENT_LABELS[k], lang)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((c) => {
          const n = foodsByCountry(c.id).length;
          return (
            <button key={c.id} onClick={() => { nav({ name: "countries", countryId: c.id }); sfx.click(); }} className="card group flex items-center gap-4 p-4 text-start transition-all hover:-translate-y-0.5 hover:border-saffron/50">
              <span className="text-4xl transition-transform group-hover:scale-110" aria-hidden>{c.flag}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-display text-base font-bold">{loc(c.name, lang)}</span>
                <span className="block text-[11px] text-muted">{loc(CONTINENT_LABELS[c.continent], lang)} · {t("cn.foods", { n })}</span>
              </span>
              <span aria-hidden className="text-muted transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1">→</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CountryPage({ id }: { id: string }) {
  const { t, lang, nav } = useApp();
  const c = getCountries().find((x) => x.id === id);
  const foods = useMemo(() => foodsByCountry(id), [id]);
  if (!c) return null;

  const famous = foods.filter((f) => f.difficulty === "easy" || f.difficulty === "medium");
  const traditional = foods.filter((f) => f.categories.includes("traditional"));
  const regional = foods.filter((f) => f.city);

  return (
    <div>
      <button onClick={() => nav({ name: "countries" })} className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-muted hover:text-saffron">
        <span aria-hidden className="rtl:rotate-180">←</span> {t("common.back")}
      </button>

      <div className="card relative mb-6 overflow-hidden">
        <div aria-hidden className="absolute -top-16 -end-16 h-56 w-56 rounded-full bg-saffron/10 blur-3xl" />
        <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center">
          <span className="text-7xl sm:text-8xl" aria-hidden>{c.flag}</span>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-bold uppercase tracking-[0.25em] text-saffron">{loc(CONTINENT_LABELS[c.continent], lang)}</div>
            <h1 className="font-display text-3xl font-extrabold sm:text-4xl">{loc(c.name, lang)}</h1>
            <div className="mt-1 text-sm text-muted">{c.name.en}{c.name.fa ? ` · ${c.name.fa}` : ""}{c.name.ar ? ` · ${c.name.ar}` : ""}</div>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">{cuisineText(c, lang)}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Btn onClick={() => nav({ name: "game", config: { mode: "country", difficulty: "medium", countryId: id } })}>
                ▶ {t("cn.challenge")}
              </Btn>
              <Btn variant="ghost" onClick={() => nav({ name: "library" })}>{t("nav.library")}</Btn>
              <span className="chip self-center px-3 py-1.5 text-xs font-extrabold text-saffron">{t("cn.foods", { n: foods.length })}</span>
            </div>
          </div>
        </div>
      </div>

      {foods.length === 0 ? (
        <div className="card"><EmptyState emoji="🍳" text={t("cn.empty")} /></div>
      ) : (
        <div className="space-y-8">
          <FoodSection title={`⭐ ${t("diff.easy")} / ${t("diff.medium")}`} foods={famous} />
          <FoodSection title={`🏺 ${t("mode.country")} — ${t("diff.hard")}+`} foods={traditional.filter((f) => f.difficulty === "hard" || f.difficulty === "extreme")} />
          {regional.length > 0 && (
            <div>
              <h3 className="mb-3 font-display text-lg font-bold">📍 {t("lib.city")}</h3>
              <div className="flex flex-wrap gap-2">
                {regional.map((f) => (
                  <span key={f.id} className="chip px-3 py-1.5 text-xs font-bold">{f.emoji} {foodName(f, lang)} <span className="text-saffron">· {f.city}</span></span>
                ))}
              </div>
            </div>
          )}
          <div>
            <h3 className="mb-3 font-display text-lg font-bold">🍽️ {t("cn.popular", { c: loc(c.name, lang) })}</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {foods.map((f) => (
                <button key={f.id} onClick={() => nav({ name: "library", foodId: f.id })} className="card group flex flex-col items-center gap-2 p-3 text-center transition-all hover:-translate-y-1 hover:border-saffron/50">
                  <FoodTile emoji={f.emoji} cat={f.categories[0]} size="md" className="transition-transform group-hover:scale-105" />
                  <span className="w-full truncate text-xs font-bold">{foodName(f, lang)}</span>
                  <span className="text-[10px] font-bold" style={{ color: { easy: "var(--pist)", medium: "var(--saffron)", hard: "#e08a3c", extreme: "var(--pom)" }[f.difficulty] }}>
                    {t(`diff.${f.difficulty}`)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FoodSection({ title, foods }: { title: string; foods: ReturnType<typeof foodsByCountry> }) {
  const { lang } = useApp();
  if (foods.length === 0) return null;
  return (
    <div>
      <h3 className="mb-3 font-display text-lg font-bold">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {foods.map((f) => (
          <span key={f.id} className="chip px-3 py-1.5 text-xs font-bold">{f.emoji} {foodName(f, lang)}</span>
        ))}
      </div>
    </div>
  );
}
