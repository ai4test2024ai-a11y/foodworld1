import { useMemo, useState } from "react";
import { useApp } from "../state/AppContext";
import type { GameMode } from "../data/types";
import { citiesOfCountry, foodName, getAllFoods, getCountries, getCountry, loc } from "../data/store";
import { gregorianDate, levelFromXp, persianDate, todayKey, todaySeed, xpForLevel } from "../game/engine";
import { Bar, Btn, FoodTile, SectionTitle } from "../components/ui";
import { sfx } from "../sound";

const HERO_URL = "https://image.qwenlm.ai/generated-images/e842b647-ebf9-419b-9dec-4675a9528453/_result.png";

export default function Home() {
  const { t, lang, nav, profile, settings, isDailyDone } = useApp();
  const foods = useMemo(() => getAllFoods(), []);
  const countries = useMemo(() => getCountries(), []);
  const [countryId, setCountryId] = useState("iran");

  const level = levelFromXp(profile.xp);
  const xpInto = profile.xp - xpForLevel(level);
  const xpNeed = xpForLevel(level + 1) - xpForLevel(level);
  const disc = useMemo(() => new Set(profile.discovered), [profile.discovered]);
  const foundFoods = foods.filter((f) => disc.has(f.id)).length;
  const startedCountries = countries.filter((c) => foods.some((f) => f.countryId === c.id && disc.has(f.id))).length;
  const totalCities = countries.reduce((a, c) => a + citiesOfCountry(c.id).length, 0);
  const pct = foods.length ? Math.round((foundFoods / foods.length) * 1000) / 10 : 0;

  const featured = countries[todaySeed() % countries.length];
  const recent = useMemo(
    () => profile.discovered.slice(-6).reverse().map((id) => foods.find((f) => f.id === id)).filter(Boolean),
    [profile.discovered, foods]
  );

  const date = new Date();
  const showGreg = settings.calendar !== "persian";
  const showJal = settings.calendar !== "gregorian";

  const play = (mode: GameMode, difficulty: GameMode extends never ? never : "medium" | "hard" | "extreme" | "easy" = "medium") => {
    nav({ name: "game", config: { mode, difficulty: difficulty as never, countryId: mode === "journey" || mode === "city" ? "iran" : undefined } });
    sfx.click();
  };

  const modes: { icon: string; mode: GameMode; k: string; d: string; accent: string; hot?: boolean }[] = [
    { icon: "🌍", mode: "classic", k: "mode.classic", d: "mode.classicDesc", accent: "var(--saffron)" },
    { icon: "🧭", mode: "geo", k: "mode.geo", d: "mode.geoDesc", accent: "var(--teal)", hot: true },
    { icon: "🇮🇷", mode: "journey", k: "mode.journey", d: "mode.journeyDesc", accent: "var(--pom)", hot: true },
    { icon: "🏙️", mode: "city", k: "mode.city", d: "mode.cityDesc", accent: "#6aa8e8" },
    { icon: "⚡", mode: "speed", k: "mode.speed", d: "mode.speedDesc", accent: "var(--saffron)" },
    { icon: "💀", mode: "hardcore", k: "mode.hardcore", d: "mode.hardcoreDesc", accent: "var(--pom)" },
    { icon: "🌐", mode: "world", k: "mode.world", d: "mode.worldDesc", accent: "var(--pist)" },
    { icon: "♾️", mode: "endless", k: "mode.endless", d: "mode.endlessDesc", accent: "var(--teal)" },
  ];

  return (
    <div>
      {/* ── Brand opening ── */}
      <section className="card relative mb-6 overflow-hidden">
        <img
          src={HERO_URL}
          alt=""
          aria-hidden
          loading="eager"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          className="absolute inset-0 h-full w-full object-cover opacity-25"
        />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-[var(--panel)] via-[var(--panel)]/70 to-transparent" />
        <div className="relative flex flex-col items-start gap-4 p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="chip px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.2em] text-saffron">🌎 {foods.length.toLocaleString()} {t("map.foods")} · {countries.length} {t("col.countries").toLowerCase()}</span>
            {showGreg && <span className="chip px-2.5 py-1 text-[10px] font-bold text-muted">{gregorianDate(date, lang)}</span>}
            {showJal && <span className="chip px-2.5 py-1 text-[10px] font-bold text-muted">🗓️ {persianDate(date, lang)}</span>}
          </div>
          <h1 className="font-display text-4xl font-extrabold leading-[1.05] sm:text-6xl">
            {t("brand.name").split(" ")[0]} <span className="text-saffron">{t("brand.name").split(" ").slice(1).join(" ")}</span> 🌍🍴
          </h1>
          <p className="max-w-xl text-base font-semibold text-muted sm:text-lg">{t("brand.sub")}</p>
          <div className="mt-1 flex flex-wrap gap-2.5">
            <Btn onClick={() => play("classic")} className="anim-pulse-ring-once">▶ {t("home.playNow")}</Btn>
            <Btn variant="ghost" onClick={() => nav({ name: "map" })}>🗺️ {t("home.explore")}</Btn>
            <Btn variant="ghost" onClick={() => nav({ name: "collection" })}>📖 {t("home.collectionBtn")}</Btn>
            <Btn variant="ghost" onClick={() => nav({ name: "game", config: { mode: "journey", difficulty: "medium" } })}>🇮🇷 {t("home.journeyBtn")}</Btn>
          </div>
        </div>
      </section>

      {/* ── Journey progress ── */}
      <section className="mb-6 grid gap-3 lg:grid-cols-3">
        <div className="card relative overflow-hidden p-5 lg:col-span-2">
          <div aria-hidden className="absolute -top-14 -end-10 h-44 w-44 rounded-full bg-saffron/10 blur-3xl" />
          <div className="mb-3 flex items-end justify-between">
            <h2 className="font-display text-lg font-bold">🚀 {t("home.progress")}</h2>
            <span className="font-display text-2xl font-extrabold text-saffron">{pct}%</span>
          </div>
          <Bar value={foundFoods} max={Math.max(foods.length, 1)} className="sheen-bar" />
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { v: `${foundFoods}/${foods.length}`, l: t("col.foods"), i: "🍽️" },
              { v: `${startedCountries}/${countries.length}`, l: t("col.countries"), i: "🌍" },
              { v: `${totalCities}`, l: t("col.cities"), i: "🏙️" },
              { v: profile.coins.toLocaleString(), l: t("prof.coins"), i: "🪙" },
            ].map((s) => (
              <div key={s.l} className="rounded-xl border border-line bg-panel2 p-2.5 text-center">
                <div className="text-lg" aria-hidden>{s.i}</div>
                <div className="font-display text-sm font-extrabold">{s.v}</div>
                <div className="text-[9px] font-bold uppercase tracking-wider text-muted">{s.l}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-saffron/15 font-display text-sm font-extrabold text-saffron">L{level}</span>
            <div className="min-w-0 flex-1">
              <Bar value={xpInto} max={Math.max(xpNeed, 1)} color="var(--teal)" />
              <div className="mt-1 text-[10px] font-bold text-muted">{t("prof.xp")}: {profile.xp.toLocaleString()} · {t("prof.nextLevel", { a: xpInto, b: xpNeed, n: level + 1 })}</div>
            </div>
            <button onClick={() => nav({ name: "profile" })} className="text-xs font-extrabold text-saffron hover:underline">{t("nav.profile")} →</button>
          </div>
        </div>

        {/* daily challenge card */}
        <div className="card flex flex-col p-5">
          <div className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-teal">📅 {t("mode.daily")}</div>
          <h2 className="mt-1 font-display text-lg font-bold">{t("mode.dailyDesc")}</h2>
          <div className="mt-2 space-y-1 text-xs font-bold text-muted">
            {showGreg && <div>🗓 {gregorianDate(date, lang)}</div>}
            {showJal && <div>☀️ {persianDate(date, lang)}</div>}
          </div>
          <div className="mt-3 flex-1" />
          {isDailyDone(todayKey()) ? (
            <div className="rounded-xl border border-pist/40 bg-pist/10 p-3 text-center">
              <div className="font-display text-lg font-extrabold text-pist">✓ {t("common.completed")}</div>
              <button onClick={() => nav({ name: "game", config: { mode: "daily", difficulty: "medium" } })} className="mt-1 text-xs font-bold text-muted hover:text-saffron">↻ {t("game.playAgain")}</button>
            </div>
          ) : (
            <Btn onClick={() => nav({ name: "game", config: { mode: "daily", difficulty: "medium" } })}>▶ {t("home.dailyBtn")}</Btn>
          )}
        </div>
      </section>

      {/* ── Game modes ── */}
      <section className="mb-6">
        <SectionTitle kicker="🎮" title={t("home.modes")} />
        <p className="-mt-2 mb-4 text-sm text-muted">{t("home.modesSub")}</p>

        {/* country challenge picker */}
        <div className="card mb-3 flex flex-wrap items-center gap-2 p-3">
          <span className="text-xs font-extrabold uppercase tracking-wider text-muted">🏆 {t("mode.country")}:</span>
          {["iran", "japan", "italy", "india", "mexico", "turkey", "france", "china", "usa"].map((id) => {
            const c = getCountry(id);
            if (!c) return null;
            return (
              <button key={id} onClick={() => setCountryId(id)} className={`chip px-3 py-1.5 text-xs font-bold transition-all ${countryId === id ? "border-saffron text-saffron" : "text-muted hover:text-ink"}`}>
                {c.flag} {loc(c.name, lang)}
              </button>
            );
          })}
          <Btn size="sm" className="ms-auto" onClick={() => nav({ name: "game", config: { mode: "country", difficulty: "medium", countryId } })}>▶ {t("journey.start")}</Btn>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {modes.map((m) => (
            <button
              key={m.mode}
              onClick={() => play(m.mode)}
              className="card group relative overflow-hidden p-4 text-start transition-all hover:-translate-y-1 hover:border-saffron/60"
            >
              <span aria-hidden className="absolute -top-8 -end-8 h-24 w-24 rounded-full opacity-15 blur-2xl transition-opacity group-hover:opacity-30" style={{ background: m.accent }} />
              {m.hot && <span className="chip absolute top-3 end-3 border-saffron/50 px-2 py-0.5 text-[9px] font-extrabold text-saffron">🔥 HOT</span>}
              <div className="text-3xl transition-transform group-hover:scale-110" aria-hidden>{m.icon}</div>
              <div className="mt-2 font-display text-base font-extrabold">{t(m.k)}</div>
              <div className="mt-0.5 text-[11px] leading-relaxed text-muted">{t(m.d)}</div>
            </button>
          ))}
        </div>
      </section>

      {/* ── Recent discoveries + featured ── */}
      <section className="grid gap-3 lg:grid-cols-2">
        <div className="card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-display text-lg font-bold">✨ {t("home.recent")}</h3>
            <button onClick={() => nav({ name: "collection" })} className="text-xs font-extrabold text-saffron hover:underline">{t("common.seeAll")} →</button>
          </div>
          {recent.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted">{t("home.noneYet")}</p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {recent.map((f) => f && (
                <button key={f.id} onClick={() => nav({ name: "library", foodId: f.id })} className="group flex flex-col items-center gap-1 rounded-xl border border-line bg-panel2 p-3 transition-all hover:-translate-y-0.5 hover:border-saffron/50">
                  <FoodTile emoji={f.emoji} size="md" className="transition-transform group-hover:scale-105" />
                  <span className="w-full truncate text-center text-[10px] font-bold">{foodName(f, lang)}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {featured && (
          <button onClick={() => nav({ name: "countries", countryId: featured.id })} className="card group relative overflow-hidden p-5 text-start transition-all hover:-translate-y-1 hover:border-saffron/60">
            <div aria-hidden className="absolute -top-16 -end-12 h-48 w-48 rounded-full bg-pom/10 blur-3xl" />
            <div className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-pom">⭐ {t("home.featured")}</div>
            <div className="mt-3 flex items-center gap-4">
              <span className="text-6xl transition-transform group-hover:scale-110" aria-hidden>{featured.flag}</span>
              <div>
                <div className="font-display text-2xl font-extrabold">{loc(featured.name, lang)}</div>
                <div className="text-xs font-bold text-muted">🍽 {foods.filter((f) => f.countryId === featured.id).length} {t("map.foods")} · 🏙 {citiesOfCountry(featured.id).length} {t("col.cities").toLowerCase()}</div>
              </div>
            </div>
            <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-muted">{featured.cuisine ? loc(featured.cuisine, lang) : ""}</p>
          </button>
        )}
      </section>
      <p className="mt-6 text-center font-display text-sm font-bold text-muted">{t("col.worldGoal")}</p>
    </div>
  );
}
