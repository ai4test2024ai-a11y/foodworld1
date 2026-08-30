import { useMemo, useState } from "react";
import { useApp } from "../state/AppContext";
import { ACHIEVEMENTS, levelFromXp, xpForLevel } from "../game/engine";
import { foodName, getCountry, getFood, loc } from "../data/store";
import { Bar, Btn, CountUp, SectionTitle } from "../components/ui";
import { sfx } from "../sound";

export default function Profile() {
  const { t, lang, profile, saveProfile } = useApp();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile.name);

  const level = levelFromXp(profile.xp);
  const xpInto = profile.xp - xpForLevel(level);
  const xpNeed = xpForLevel(level + 1) - xpForLevel(level);
  const accuracy = profile.correct + profile.wrong > 0 ? Math.round((profile.correct / (profile.correct + profile.wrong)) * 100) : 0;

  const favCountry = useMemo(() => {
    const entries = Object.entries(profile.byCountry).sort((a, b) => b[1] - a[1]);
    return entries.length ? getCountry(entries[0][0]) : undefined;
  }, [profile.byCountry]);
  const favFood = useMemo(() => {
    const entries = Object.entries(profile.byFood).sort((a, b) => b[1] - a[1]);
    return entries.length ? getFood(entries[0][0]) : undefined;
  }, [profile.byFood]);

  const save = () => {
    saveProfile({ ...profile, name: name.trim() || profile.name });
    setEditing(false);
    sfx.correct();
  };

  return (
    <div>
      <SectionTitle kicker={`${t("common.level")} ${level}`} title={t("prof.title")} />

      {/* header card */}
      <div className="card relative mb-6 overflow-hidden p-6">
        <div aria-hidden className="absolute -top-20 -end-10 h-52 w-52 rounded-full bg-saffron/10 blur-3xl" />
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="relative h-24 w-24 shrink-0">
            <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
              <circle cx="50" cy="50" r="44" fill="none" stroke="var(--line)" strokeWidth="8" />
              <circle
                cx="50" cy="50" r="44" fill="none" stroke="var(--saffron)" strokeWidth="8" strokeLinecap="round"
                strokeDasharray={`${(xpInto / Math.max(xpNeed, 1)) * 276} 276`}
                className="transition-all duration-700"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display text-2xl font-extrabold text-saffron">{level}</span>
              <span className="text-[9px] font-bold uppercase tracking-wider text-muted">{t("common.level")}</span>
            </div>
          </div>
          <div className="min-w-0 flex-1">
            {editing ? (
              <div className="flex items-center gap-2">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-lg border border-line bg-panel2 px-3 py-2 text-sm font-bold outline-none focus:border-saffron"
                  aria-label={t("prof.editName")}
                  maxLength={24}
                />
                <Btn size="sm" onClick={save}>{t("prof.save")}</Btn>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h2 className="font-display text-2xl font-extrabold">{profile.name}</h2>
                <button onClick={() => setEditing(true)} className="text-xs font-bold text-saffron hover:underline" aria-label={t("prof.editName")}>✏️</button>
              </div>
            )}
            <div className="mt-1 text-sm text-muted">
              {t("prof.xp")}: <CountUp value={profile.xp} className="font-display font-extrabold text-saffron" />
            </div>
            <Bar value={xpInto} max={xpNeed} className="mt-3 max-w-sm" />
            <div className="mt-1 text-[11px] font-bold text-muted">{t("prof.nextLevel", { a: xpInto, b: xpNeed, n: level + 1 })}</div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-center sm:w-56">
            {[
              { icon: favCountry ? favCountry.flag : "🌍", label: t("prof.favCountry"), value: favCountry ? loc(favCountry.name, lang) : "—" },
              { icon: favFood?.emoji ?? "🍽️", label: t("prof.favFood"), value: favFood ? foodName(favFood, lang) : "—" },
            ].map((x) => (
              <div key={x.label} className="rounded-xl border border-line bg-panel2 p-3">
                <div className="text-2xl" aria-hidden>{x.icon}</div>
                <div className="mt-1 truncate text-xs font-bold">{x.value}</div>
                <div className="text-[9px] font-bold uppercase tracking-wider text-muted">{x.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* stats */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {[
          { v: profile.gamesPlayed, l: t("prof.games"), i: "🎮" },
          { v: profile.correct, l: t("prof.correct"), i: "✅" },
          { v: `${accuracy}%`, l: t("prof.accuracy"), i: "🎯" },
          { v: profile.bestStreak, l: t("prof.bestStreak"), i: "⚡" },
          { v: profile.bestComboCount, l: t("prof.bestCombo"), i: "🔥" },
          { v: profile.dailyDates.length, l: t("prof.dailyDone"), i: "📅" },
        ].map((s) => (
          <div key={s.l} className="card p-4 text-center">
            <div className="text-xl" aria-hidden>{s.i}</div>
            <div className="mt-1 font-display text-xl font-extrabold">{s.v}</div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted">{s.l}</div>
          </div>
        ))}
      </div>

      {/* achievements */}
      <div className="mb-4 flex items-end justify-between">
        <h3 className="font-display text-2xl font-bold">🏆 {t("prof.achievements")}</h3>
        <span className="chip px-3 py-1.5 text-xs font-extrabold text-saffron">{t("prof.unlockedOf", { a: profile.achievements.length, b: ACHIEVEMENTS.length })}</span>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {ACHIEVEMENTS.map((a) => {
          const got = profile.achievements.some((x) => x.id === a.id);
          return (
            <div key={a.id} className={`card p-4 transition-all ${got ? "border-saffron/50" : "opacity-55"}`}>
              <div className={`text-3xl ${got ? "" : "grayscale"}`} aria-hidden>{got ? a.icon : "🔒"}</div>
              <div className="mt-2 text-sm font-extrabold">{loc(a.name, lang)}</div>
              <div className="mt-0.5 text-[11px] leading-relaxed text-muted">{loc(a.desc, lang)}</div>
              {got && <div className="mt-2 text-[10px] font-extrabold text-pist">✓ {t("common.completed")}</div>}
            </div>
          );
        })}
      </div>
      {!favCountry && <p className="mt-4 text-center text-xs text-muted">{t("prof.noFav")}</p>}
    </div>
  );
}
