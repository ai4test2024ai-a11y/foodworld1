import { useMemo, useState } from "react";
import { useApp } from "../state/AppContext";
import { CONFIG, levelFromXp, mulberry32, persianDate, gregorianDate, todayKey, todaySeed, xpForLevel } from "../game/engine";
import { foodsByCountry, foodName, getAllFoods, getCountries, countryName } from "../data/store";
import type { AllDifficulty, GameMode } from "../data/types";
import { Bar, Btn, CountUp, FoodTile, SectionTitle } from "../components/ui";
import { sfx } from "../sound";

const MODES: { id: GameMode; icon: string }[] = [
  { id: "classic", icon: "🎯" },
  { id: "timeAttack", icon: "⏱️" },
  { id: "endless", icon: "♾️" },
  { id: "country", icon: "🏁" },
  { id: "world", icon: "🌍" },
];

const DIFFS: { id: AllDifficulty; icon: string; color: string }[] = [
  { id: "easy", icon: "🌱", color: "var(--pist)" },
  { id: "medium", icon: "🌶️", color: "var(--saffron)" },
  { id: "hard", icon: "🔥", color: "#e08a3c" },
  { id: "extreme", icon: "💥", color: "var(--pom)" },
  { id: "impossible", icon: "💀", color: "#c04bd6" },
];

const HERO_URL = "https://image.qwenlm.ai/generated-images/e842b647-ebf9-419b-9dec-4675a9528453/_result.png";

function HeroBanner() {
  const { t, nav } = useApp();
  const [ok, setOk] = useState(true);
  if (!ok) return null;
  return (
    <section className="relative mt-2 overflow-hidden rounded-2xl border border-line" style={{ boxShadow: "var(--shadow)" }}>
      <img
        src={HERO_URL}
        alt={t("home.marquee")}
        loading="lazy"
        onError={() => setOk(false)}
        className="h-44 w-full object-cover sm:h-56"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#140d07]/95 via-[#140d07]/40 to-transparent ltr:bg-gradient-to-r rtl:bg-gradient-to-l ltr:from-[#140d07]/95" />
      <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-7">
        <div className="text-[10px] font-extrabold uppercase tracking-[0.3em] text-saffron">{t("home.marquee")}</div>
        <div className="mt-1 font-display text-2xl font-extrabold sm:text-3xl">{t("brand.tagline")}</div>
        <button onClick={() => nav({ name: "countries" })} className="mt-2 w-fit text-xs font-extrabold text-saffron hover:underline">
          {t("nav.countries")} · {t("common.seeAll")} →
        </button>
      </div>
    </section>
  );
}

export default function Home() {
  const { t, lang, nav, profile, settings, isDailyDone, dailyResult } = useApp();
  const [mode, setMode] = useState<GameMode>("classic");
  const [diff, setDiff] = useState<AllDifficulty>("easy");
  const [countryId, setCountryId] = useState("iran");

  const level = levelFromXp(profile.xp);
  const foods = useMemo(() => getAllFoods(), []);
  const countries = useMemo(() => getCountries(), []);
  const qCombinations = useMemo(() => foods.reduce((acc, f) => acc + Math.max(1, f.ingredients.length) * 3, 0) * 4, [foods]);

  const plate = useMemo(() => {
    const rng = mulberry32(todaySeed() * 7 + 13);
    return foods[Math.floor(rng() * foods.length)];
  }, [foods]);

  const key = todayKey();
  const dailyDone = isDailyDone(key);
  const dailyRes = dailyResult(key);
  const challengeCountries = useMemo(() => {
    const withFoods = countries
      .map((c) => ({ c, n: foodsByCountry(c.id).length }))
      .filter((x) => x.n > 0)
      .sort((a, b) => b.n - a.n);
    return withFoods;
  }, [countries]);

  const xpInto = profile.xp - xpForLevel(level);
  const xpNeed = xpForLevel(level + 1) - xpForLevel(level);

  const start = () => {
    sfx.click();
    nav({ name: "game", config: { mode, difficulty: diff, countryId: mode === "country" ? countryId : undefined } });
  };

  return (
    <div className="relative">
      {/* floating ambient foods */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.10]">
        {["🍕", "🍣", "🌮", "🍲", "🥘", "🍜"].map((e, i) => (
          <span key={i} className="anim-floaty absolute text-6xl" style={{ top: `${10 + i * 14}%`, insetInlineStart: `${(i * 17 + 8) % 90}%`, animationDelay: `${i * 0.8}s` }}>
            {e}
          </span>
        ))}
      </div>

      {/* ── Brand header ── */}
      <header className="relative mb-8 grid gap-6 lg:grid-cols-[1.2fr_1fr] lg:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.25em] text-saffron">
            <span aria-hidden>🍽️</span> {t("brand.sub")}
          </div>
          <h1 className="font-display text-4xl font-extrabold leading-[1.05] sm:text-6xl">
            Food<span className="text-saffron">Guess</span>
          </h1>
          <p className="mt-3 max-w-md text-lg font-semibold text-muted">{t("brand.tagline")}</p>
          <div className="mt-5 flex flex-wrap gap-2 text-xs font-bold">
            <span className="chip px-3 py-1.5"><CountUp value={foods.length} /> {t("home.foods")}</span>
            <span className="chip px-3 py-1.5"><CountUp value={countries.length} /> {t("home.countriesCount")}</span>
            <span className="chip px-3 py-1.5"><CountUp value={qCombinations} />+ {t("home.questions")}</span>
          </div>
        </div>

        {/* Profile mini card */}
        <button onClick={() => nav({ name: "profile" })} className="card group p-4 text-start transition-transform hover:-translate-y-0.5">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-saffron/15 font-display text-xl font-extrabold text-saffron">{level}</div>
            <div className="min-w-0 flex-1">
              <div className="truncate font-bold">{profile.name}</div>
              <div className="text-xs text-muted">{t("common.level")} {level} · {t("prof.xp")} {profile.xp.toLocaleString()}</div>
              <Bar value={xpInto} max={xpNeed} className="mt-2" />
            </div>
            <span aria-hidden className="text-muted transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1">→</span>
          </div>
        </button>
      </header>

      {/* ── World table banner ── */}
      <HeroBanner />

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        {/* ── Left column: play ── */}
        <div className="space-y-6">
          <section className="card p-5 sm:p-6">
            <SectionTitle kicker={t("home.quickPlay")} title={t("home.chooseMode")} />
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5" role="radiogroup" aria-label={t("home.chooseMode")}>
              {MODES.map((m) => (
                <button
                  key={m.id}
                  role="radio"
                  aria-checked={mode === m.id}
                  onClick={() => { setMode(m.id); sfx.click(); }}
                  className={`rounded-xl border p-3 text-center transition-all ${mode === m.id ? "border-saffron bg-saffron/10 shadow-[0_0_24px_-6px_rgba(242,168,59,0.4)]" : "border-line bg-panel2 hover:border-line2"}`}
                >
                  <div className="text-2xl" aria-hidden>{m.icon}</div>
                  <div className="mt-1 text-xs font-bold leading-tight">{t(`mode.${m.id}`)}</div>
                </button>
              ))}
            </div>
            <p className="mt-2 min-h-5 text-xs text-muted">{t(`mode.${mode}Desc`)}</p>

            {mode === "country" && (
              <div className="anim-rise mt-3">
                <div className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">{t("home.pickCountry")}</div>
                <div className="flex flex-wrap gap-1.5">
                  {challengeCountries.slice(0, 12).map(({ c, n }) => (
                    <button
                      key={c.id}
                      onClick={() => { setCountryId(c.id); sfx.click(); }}
                      className={`chip flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold transition-colors ${countryId === c.id ? "border-saffron bg-saffron/15 text-saffron" : "text-muted hover:text-ink"}`}
                    >
                      <span aria-hidden>{c.flag}</span> {countryName(c.id, lang)} <span className="opacity-60">{n}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-5">
              <div className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">{t("home.chooseDifficulty")}</div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                {DIFFS.map((d) => {
                  const req = CONFIG.unlocks[d.id].level;
                  const locked = level < req;
                  return (
                    <button
                      key={d.id}
                      disabled={locked}
                      onClick={() => { setDiff(d.id); sfx.click(); }}
                      className={`relative rounded-xl border p-3 text-center transition-all ${diff === d.id && !locked ? "border-saffron bg-saffron/10" : "border-line bg-panel2"} ${locked ? "opacity-45" : "hover:border-line2"}`}
                      title={locked ? t("diff.unlockLevel", { n: req }) : t(`diff.${d.id}Desc`)}
                    >
                      <div className="text-xl" aria-hidden>{locked ? "🔒" : d.icon}</div>
                      <div className="mt-1 text-xs font-extrabold" style={{ color: locked ? undefined : d.color }}>
                        {t(`diff.${d.id}`)}
                      </div>
                      {locked && <div className="mt-0.5 text-[10px] text-muted">{t("diff.unlockLevel", { n: req })}</div>}
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 min-h-4 text-xs text-muted">{t(`diff.${diff}Desc`)}</p>
            </div>

            <Btn size="lg" onClick={start} className="mt-5 w-full text-lg tracking-wide">
              <span aria-hidden className="text-xl">▶</span> {t("home.start")}
              <span className="text-xs font-bold opacity-70">
                · {mode === "timeAttack" ? `${CONFIG.timeAttackSeconds}s` : mode === "endless" ? "∞" : `${mode === "classic" ? CONFIG.classicQuestions : mode === "country" || mode === "world" ? CONFIG.classicQuestions : CONFIG.dailyQuestions} Q`}
              </span>
            </Btn>
          </section>

          {/* Menu board links */}
          <section className="card divide-y divide-[var(--line)] overflow-hidden">
            {[
              { icon: "📚", title: t("nav.library"), desc: t("home.libraryCta"), act: () => nav({ name: "library" }), badge: String(foods.length) },
              { icon: "🗺️", title: t("nav.countries"), desc: t("home.countriesCta"), act: () => nav({ name: "countries" }), badge: String(countries.length) },
              { icon: "🏆", title: t("nav.board"), desc: t("home.boardCta"), act: () => nav({ name: "board" }), badge: "TOP 50" },
              { icon: "👨‍🍳", title: t("nav.profile"), desc: t("home.profileCta"), act: () => nav({ name: "profile" }), badge: `${profile.achievements.length}🏅` },
            ].map((row) => (
              <button key={row.title} onClick={row.act} className="group flex w-full items-center gap-4 p-4 text-start transition-colors hover:bg-panel2/60">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-line bg-panel2 text-xl" aria-hidden>{row.icon}</span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-base font-bold">{row.title}</span>
                  <span className="block truncate text-xs text-muted">{row.desc}</span>
                </span>
                <span className="chip hidden px-2.5 py-1 text-[10px] font-extrabold tracking-wide text-saffron sm:block">{row.badge}</span>
                <span aria-hidden className="text-muted transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1">→</span>
              </button>
            ))}
          </section>
        </div>

        {/* ── Right column: daily + spotlight ── */}
        <div className="space-y-6">
          <section className="card relative overflow-hidden p-5">
            <div aria-hidden className="absolute -top-10 -end-10 h-36 w-36 rounded-full bg-saffron/10 blur-2xl" />
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-xl font-bold">🗓️ {t("home.daily")}</h2>
              {dailyDone && <span className="chip px-2.5 py-1 text-[10px] font-extrabold text-pist">✓ {t("common.completed")}</span>}
            </div>
            <div className="space-y-1 text-xs text-muted">
              {(settings.calendar === "both" || settings.calendar === "gregorian") && <div>{gregorianDate(new Date(), lang)}</div>}
              {(settings.calendar === "both" || settings.calendar === "persian") && <div className="font-bold text-saffron">☀️ {persianDate(new Date(), lang)}</div>}
            </div>
            <p className="mt-3 text-sm text-muted">{t("home.dailyDesc")}</p>
            {dailyDone && dailyRes && (
              <div className="mt-3 rounded-lg border border-pist/30 bg-pist/10 px-3 py-2 text-xs font-bold text-pist">
                {t("daily.score")}: {dailyRes.score.toLocaleString()} · {dailyRes.correct}/{CONFIG.dailyQuestions} ✓
              </div>
            )}
            <Btn variant={dailyDone ? "ghost" : "primary"} className="mt-4 w-full" onClick={() => nav({ name: "game", config: { mode: "daily", difficulty: "medium" } })}>
              {dailyDone ? t("daily.done") : `▶ ${t("home.daily")}`}
            </Btn>
          </section>

          <section className="card overflow-hidden">
            <div className="p-5 pb-3">
              <h2 className="font-display text-xl font-bold">🍛 {t("home.spotlight")}</h2>
              <p className="mt-1 text-xs text-muted">{t("home.spotlightDesc")}</p>
            </div>
            {plate && (
              <button onClick={() => nav({ name: "library", foodId: plate.id })} className="group block w-full p-5 pt-2 text-start">
                <div className="flex items-center gap-4">
                  <FoodTile emoji={plate.emoji} cat={plate.categories[0]} size="lg" className="transition-transform group-hover:scale-105" />
                  <div className="min-w-0">
                    <div className="font-display text-lg font-bold leading-tight">{foodName(plate, lang)}</div>
                    <div className="mt-1 text-sm text-muted">
                      {countryName(plate.countryId, lang)} · {t(`diff.${plate.difficulty}`)}
                    </div>
                    <div className="mt-2 text-xs font-bold text-saffron">{t("common.seeAll")} →</div>
                  </div>
                </div>
              </button>
            )}
          </section>

          <section className="card p-5">
            <h2 className="font-display text-xl font-bold">🧭 {t("home.howTitle")}</h2>
            <ol className="mt-3 space-y-3">
              {[t("home.how1"), t("home.how2"), t("home.how3")].map((s, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-muted">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-saffron/15 font-display text-xs font-extrabold text-saffron">{i + 1}</span>
                  {s}
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>

      {/* ── Marquee ── */}
      <section className="mt-8 overflow-hidden rounded-xl border border-line bg-panel/60 py-3" aria-label={t("home.marquee")}>
        <div className="marquee-track flex w-max items-center gap-8 px-4">
          {[...foods.slice(0, 28), ...foods.slice(0, 28)].map((f, i) => (
            <span key={i} className="flex items-center gap-2 whitespace-nowrap text-sm text-muted">
              <span aria-hidden className="text-lg">{f.emoji}</span> {foodName(f, lang)}
              <span className="text-line2">✦</span>
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
