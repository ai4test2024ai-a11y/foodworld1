import type { ReactNode } from "react";
import { useApp } from "../state/AppContext";
import { getAllFoods, getCities, getCountries } from "../data/store";
import { sfx } from "../sound";

/* ── tiny atoms ── */

const Key = ({ k }: { k: string }) => (
  <kbd className="inline-flex min-w-8 items-center justify-center rounded-md border border-line2 bg-panel2 px-2 py-1 font-display text-xs font-bold shadow-[0_2px_0_var(--line2)]">
    {k}
  </kbd>
);

function Section({ id, icon, title, children }: { id: string; icon: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="card scroll-mt-36 p-5 sm:p-6">
      <h2 className="mb-3 flex items-center gap-2.5 font-display font-extrabold" style={{ fontSize: "clamp(1.15rem, 1rem + 1vw, 1.5rem)" }}>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-saffron/12 text-xl" aria-hidden>{icon}</span>
        {title}
      </h2>
      <div className="text-sm leading-7 text-muted">{children}</div>
    </section>
  );
}

const LOOP = [
  { i: "🍴", k: "help.loop1" },
  { i: "❓", k: "help.loop2" },
  { i: "🏙️", k: "help.loop3" },
  { i: "🌍", k: "help.loop4" },
  { i: "📚", k: "help.loop5" },
  { i: "⭐", k: "help.loop6" },
  { i: "🔓", k: "help.loop7" },
  { i: "✅", k: "help.loop8" },
  { i: "🏆", k: "help.loop9" },
  { i: "🌎", k: "help.loop10" },
];

/** mode icon + existing mode.* / mode.*Desc keys */
const MODES = [
  { i: "🌍", k: "mode.classic", d: "mode.classicDesc" },
  { i: "⏱️", k: "mode.timeAttack", d: "mode.timeAttackDesc" },
  { i: "♾️", k: "mode.endless", d: "mode.endlessDesc" },
  { i: "🏆", k: "mode.country", d: "mode.countryDesc" },
  { i: "🌐", k: "mode.world", d: "mode.worldDesc" },
  { i: "🏙️", k: "mode.city", d: "mode.cityDesc" },
  { i: "⚡", k: "mode.speed", d: "mode.speedDesc" },
  { i: "💀", k: "mode.hardcore", d: "mode.hardcoreDesc" },
  { i: "🇮🇷", k: "mode.journey", d: "mode.journeyDesc" },
  { i: "🧭", k: "mode.geo", d: "mode.geoDesc" },
  { i: "📅", k: "mode.daily", d: "mode.dailyDesc" },
];

/** base points per difficulty (values localized to Persian digits in FA) */
const SCORES = [
  { k: "diff.easy", v: "100", c: "var(--pist)" },
  { k: "diff.medium", v: "200", c: "var(--saffron)" },
  { k: "diff.hard", v: "400", c: "#e08a3c" },
  { k: "diff.extreme", v: "800", c: "var(--pom)" },
  { k: "diff.impossible", v: "1500", c: "#b07ce8" },
];

const RARITIES = [
  { k: "rarity.common", c: "var(--muted)" },
  { k: "rarity.uncommon", c: "var(--teal)" },
  { k: "rarity.rare", c: "#6aa8e8" },
  { k: "rarity.epic", c: "#b07ce8" },
  { k: "rarity.legendary", c: "var(--saffron)" },
  { k: "rarity.mythic", c: "var(--pom)" },
];

const STEPS = [1, 2, 3, 4, 5, 6];

const FAQ = [1, 2, 3, 4, 5, 6, 7];

export default function Help() {
  const { nav, t, lang } = useApp();

  /* Persian digits when the UI language is Persian */
  const digs = (s: string | number): string => {
    const str = String(s);
    return lang === "fa" ? str.replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]) : str;
  };

  const foodsCount = getAllFoods().length;
  const countriesCount = getCountries().length;
  const citiesCount = getCities().length;

  const digits = lang === "fa" ? ["۱", "۲", "۳", "۴"] : ["1", "2", "3", "4"];

  return (
    <div className="mx-auto max-w-3xl">
      {/* ── header ── */}
      <section className="card relative mb-5 overflow-hidden">
        <div aria-hidden className="absolute -top-20 -start-10 h-52 w-52 rounded-full bg-teal/10 blur-3xl" />
        <div aria-hidden className="absolute -bottom-24 -end-10 h-52 w-52 rounded-full bg-saffron/10 blur-3xl" />
        <div className="relative p-6 text-center sm:p-8">
          <div className="text-[11px] font-extrabold uppercase tracking-[0.3em] text-teal">{t("help.kicker")}</div>
          <h1 className="mt-2 font-display font-extrabold" style={{ fontSize: "clamp(1.8rem, 1.4rem + 2.5vw, 2.75rem)" }}>
            {t("nav.help")} <span className="text-saffron">Guess Your Food</span> ❔
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-muted sm:text-base">{t("help.intro")}</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2 text-[11px] font-extrabold">
            <span className="chip px-3 py-1.5">🍽️ {t("help.chipFoods", { n: digs(foodsCount) })}</span>
            <span className="chip px-3 py-1.5">🌍 {t("help.chipCountries", { n: digs(countriesCount) })}</span>
            <span className="chip px-3 py-1.5">🏙️ {t("help.chipCities", { n: digs(citiesCount) })}</span>
            <span className="chip px-3 py-1.5">🎮 {t("help.chipModes", { n: digs(11) })}</span>
            <span className="chip px-3 py-1.5">🗣️ فارسی · English · العربية</span>
          </div>
        </div>
      </section>

      {/* ── mini TOC ── */}
      <nav aria-label={t("nav.help")} className="mb-5 flex flex-wrap justify-center gap-1.5">
        {[
          ["#what", t("help.tocWhat")],
          ["#goal", t("help.tocGoal")],
          ["#how", t("help.tocHow")],
          ["#modes", t("help.tocModes")],
          ["#score", t("help.tocScore")],
          ["#rewards", t("help.tocRewards")],
          ["#keys", t("help.tocKeys")],
          ["#faq", t("help.tocFaq")],
        ].map(([href, label]) => (
          <a key={href} href={href} onClick={() => sfx.click()} className="chip px-3 py-1.5 text-xs font-bold text-muted transition-colors hover:border-saffron hover:text-saffron">
            {label}
          </a>
        ))}
      </nav>

      <div className="space-y-5">
        {/* ── 1. what ── */}
        <Section id="what" icon="🍽️" title={t("help.whatTitle")}>
          <p>
            <strong className="text-ink">Guess Your Food</strong> — {t("help.whatBody")}
          </p>
          {/* gameplay loop */}
          <div className="mt-4 rounded-xl border border-line bg-panel2 p-4">
            <div className="mb-2.5 text-center text-[10px] font-extrabold uppercase tracking-[0.2em] text-saffron">🔁 {t("help.loopTitle")}</div>
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              {LOOP.map((s, i) => (
                <span key={s.k} className="flex items-center gap-1.5">
                  <span className="chip flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-bold text-ink transition-colors hover:border-saffron">
                    <span aria-hidden>{s.i}</span> {t(s.k)}
                  </span>
                  {i < LOOP.length - 1 && <span aria-hidden className="text-saffron rtl:rotate-180">→</span>}
                </span>
              ))}
            </div>
          </div>
        </Section>

        {/* ── 2. goal ── */}
        <Section id="goal" icon="🎯" title={t("help.goalTitle")}>
          <ul className="space-y-2.5">
            {["help.goal1", "help.goal2", "help.goal3", "help.goal4", "help.goal5"].map((k, i) => (
              <li key={k} className="flex items-start gap-3">
                <span className="mt-0.5 text-lg" aria-hidden>{["🌎", "🏆", "🧭", "📚", "🔥"][i]}</span>
                <span>{t(k)}</span>
              </li>
            ))}
          </ul>
        </Section>

        {/* ── 3. how to play ── */}
        <Section id="how" title={t("help.howTitle")} icon="🕹️">
          <p className="mb-4">{t("help.howIntro")}</p>
          <ol className="space-y-3">
            {STEPS.map((n) => (
              <li key={n} className="flex items-start gap-3 rounded-xl border border-line bg-panel2 p-3.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-saffron font-display text-base font-extrabold text-[#241705]">{digs(n)}</span>
                <span>
                  <span className="block text-sm font-extrabold text-ink">{t(`help.step${n}t`)}</span>
                  <span className="block text-[13px] leading-6 text-muted">{t(`help.step${n}d`)}</span>
                </span>
              </li>
            ))}
          </ol>
          <p className="mt-4 rounded-xl border border-teal/30 bg-teal/5 p-3.5 text-[13px] leading-6">💡 {t("help.tip")}</p>
        </Section>

        {/* ── 4. modes ── */}
        <Section id="modes" icon="🎮" title={t("home.modes")}>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {MODES.map((m) => (
              <div key={m.k} className="rounded-xl border border-line bg-panel2 p-3.5 transition-all hover:-translate-y-0.5 hover:border-saffron/50">
                <div className="flex items-center gap-2 font-extrabold text-ink">
                  <span aria-hidden className="text-xl">{m.i}</span> {t(m.k)}
                </div>
                <div className="mt-1 text-[13px] leading-6">{t(m.d)}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* ── 5. difficulty & scoring ── */}
        <Section id="score" icon="💯" title={t("help.scoreTitle")}>
          <p className="mb-3">{t("help.scoreIntro")}</p>
          <div className="mb-4 flex flex-wrap gap-2">
            {SCORES.map((s) => (
              <span key={s.k} className="chip flex items-center gap-2 px-3 py-2 text-xs font-extrabold">
                <span className="text-muted">{t(s.k)}</span>
                <span style={{ color: s.c }}>{t("help.pts", { n: digs(s.v) })}</span>
              </span>
            ))}
          </div>
          <ul className="space-y-2.5">
            {["help.scoreLives", "help.scoreCombo", "help.scoreSpeed", "help.scoreDiff"].map((k, i) => (
              <li key={k} className="flex items-start gap-3">
                <span className="mt-0.5 text-lg" aria-hidden>{["❤️", "🔥", "⚡", "📈"][i]}</span>
                <span>{t(k)}</span>
              </li>
            ))}
          </ul>
        </Section>

        {/* ── 6. outputs / rewards ── */}
        <Section id="rewards" icon="🎁" title={t("help.rewardsTitle")}>
          <ul className="space-y-2.5">
            {["help.reward1", "help.reward2", "help.reward3", "help.reward4", "help.reward5", "help.reward6", "help.reward7", "help.reward8"].map((k, i) => (
              <li key={k} className="flex items-start gap-3">
                <span className="mt-0.5 text-lg" aria-hidden>{["⭐", "🪙", "📖", "🧂", "🌟", "🏆", "📊", "📅"][i]}</span>
                <span>{t(k)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4">
            <div className="mb-2 text-[10px] font-extrabold uppercase tracking-[0.2em] text-saffron">⭐ {t("help.rarTitle")}</div>
            <div className="flex flex-wrap gap-1.5">
              {RARITIES.map((r) => (
                <span key={r.k} className="chip px-3 py-1.5 text-xs font-extrabold" style={{ color: r.c }}>{t(r.k)}</span>
              ))}
            </div>
          </div>
        </Section>

        {/* ── 7. keyboard ── */}
        <Section id="keys" icon="⌨️" title={t("help.keysTitle")}>
          <div className="flex flex-col gap-3">
            {[
              { keys: digits, d: t("help.keyRow1") },
              { keys: ["Enter", "Space"], d: t("help.keyRow2") },
              { keys: ["Esc"], d: t("help.keyRow3") },
            ].map((row) => (
              <div key={row.d} className="flex flex-wrap items-center gap-2.5">
                <span className="flex gap-1.5">
                  {row.keys.map((k) => <Key key={k} k={k} />)}
                </span>
                <span className="text-[13px]">{row.d}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[13px]">📱 {t("help.keysMobile")}</p>
        </Section>

        {/* ── 8. settings / save ── */}
        <Section id="settings" icon="⚙️" title={t("help.settingsTitle")}>
          <ul className="space-y-2.5">
            {["help.setItem1", "help.setItem2", "help.setItem3", "help.setItem4"].map((k, i) => (
              <li key={k} className="flex items-start gap-3">
                <span className="mt-0.5 text-lg" aria-hidden>{["🗣️", "🗓️", "🌙", "💾"][i]}</span>
                <span>{t(k)}</span>
              </li>
            ))}
          </ul>
        </Section>

        {/* ── 9. FAQ ── */}
        <Section id="faq" icon="💬" title={t("help.faqTitle")}>
          <div className="space-y-2.5">
            {FAQ.map((n) => (
              <details key={n} className="group rounded-xl border border-line bg-panel2 p-4 open:border-saffron/40">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-extrabold text-ink [&::-webkit-details-marker]:hidden">
                  {t(`help.faq${n}q`)}
                  <span aria-hidden className="shrink-0 text-lg font-bold text-saffron transition-transform duration-200 group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-[13px] leading-7">{t(`help.faq${n}a`)}</p>
              </details>
            ))}
          </div>
        </Section>

        {/* ── back ── */}
        <div className="pt-1 pb-2 text-center">
          <button
            onClick={() => { nav({ name: "home" }); sfx.click(); }}
            className="inline-flex min-h-12 w-full max-w-xs items-center justify-center gap-2 rounded-xl bg-saffron px-6 text-base font-extrabold text-[#241705] shadow-[0_6px_20px_-6px_rgba(242,168,59,0.55)] transition-all hover:bg-saffron2 active:scale-[0.97]"
          >
            🏠 {t("help.backHome")}
          </button>
        </div>
      </div>
    </div>
  );
}
