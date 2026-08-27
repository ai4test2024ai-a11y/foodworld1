import { useApp } from "../state/AppContext";
import { LANGS } from "../i18n";
import { Btn, Modal, SectionTitle, Toggle } from "../components/ui";
import { sfx } from "../sound";
import { useState } from "react";

export default function Settings() {
  const { t, lang, setLang, settings, updateSettings, saveProfile } = useApp();
  const [resetAsk, setResetAsk] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  const section = "card space-y-4 p-5";

  return (
    <div className="mx-auto max-w-2xl">
      <SectionTitle kicker="⚙️" title={t("set.title")} />
      <div className="space-y-5">
        <div className={section}>
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-muted">{t("set.language")}</h3>
          <div className="grid grid-cols-3 gap-2">
            {LANGS.map((l) => (
              <button
                key={l.id}
                onClick={() => { setLang(l.id); sfx.click(); }}
                className={`rounded-xl border p-3 text-center transition-all ${lang === l.id ? "border-saffron bg-saffron/10" : "border-line bg-panel2 hover:border-line2"}`}
              >
                <div className="text-2xl" aria-hidden>{l.flag}</div>
                <div className="mt-1 text-sm font-extrabold">{l.label}</div>
                <div className="text-[10px] font-bold text-muted">{l.dir.toUpperCase()}</div>
              </button>
            ))}
          </div>
        </div>

        <div className={section}>
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-muted">{t("set.theme")}</h3>
          <div className="grid grid-cols-2 gap-2">
            {(["dark", "light"] as const).map((th) => (
              <button
                key={th}
                onClick={() => updateSettings({ theme: th })}
                className={`rounded-xl border p-3 text-sm font-extrabold transition-all ${settings.theme === th ? "border-saffron bg-saffron/10" : "border-line bg-panel2 hover:border-line2"}`}
              >
                {th === "dark" ? "🌙 " : "☀️ "}{t(th === "dark" ? "set.dark" : "set.light")}
              </button>
            ))}
          </div>
        </div>

        <div className={section}>
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-muted">{t("set.calendar")}</h3>
          <div className="grid grid-cols-3 gap-2">
            {(["gregorian", "persian", "both"] as const).map((c) => (
              <button
                key={c}
                onClick={() => updateSettings({ calendar: c })}
                className={`rounded-xl border p-3 text-xs font-extrabold transition-all ${settings.calendar === c ? "border-saffron bg-saffron/10" : "border-line bg-panel2 hover:border-line2"}`}
              >
                {t(c === "gregorian" ? "set.gregorian" : c === "persian" ? "set.persian" : "set.both")}
              </button>
            ))}
          </div>
        </div>

        <div className={`${section} divide-y divide-[var(--line)]`}>
          <div className="flex items-center justify-between pb-4">
            <Toggle on={settings.sound} onChange={(v) => { updateSettings({ sound: v }); if (v) sfx.correct(); }} label={t("set.sound")} />
            <span aria-hidden className="text-xl">🔊</span>
          </div>
          <div className="flex items-center justify-between py-4">
            <Toggle on={settings.notifications} onChange={(v) => updateSettings({ notifications: v })} label={t("set.notif")} />
            <span aria-hidden className="text-xl">🔔</span>
          </div>
          <div className="flex items-center justify-between pt-4">
            <Toggle on={settings.animations} onChange={(v) => updateSettings({ animations: v })} label={t("set.animations")} />
            <span aria-hidden className="text-xl">✨</span>
          </div>
        </div>

        <div className={section}>
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-pom">⚠️</h3>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted">{t("set.reset")}</p>
            <Btn variant="danger" size="sm" onClick={() => setResetAsk(true)}>{t("set.reset")}</Btn>
          </div>
          {resetDone && <p className="text-xs font-bold text-pist">✓ {t("adm.saved")}</p>}
        </div>

        <div className={section}>
          <h3 className="font-display text-lg font-bold">🍽️ FoodGuess</h3>
          <p className="text-xs leading-relaxed text-muted">{t("set.about")}</p>
        </div>
      </div>

      <Modal open={resetAsk} onClose={() => setResetAsk(false)}>
        <div className="text-center">
          <div className="text-4xl" aria-hidden>🧨</div>
          <p className="mt-3 font-bold">{t("set.resetConfirm")}</p>
          <div className="mt-5 flex justify-center gap-2">
            <Btn
              variant="danger"
              onClick={() => {
                try {
                  localStorage.removeItem("fg_profile_v1");
                  localStorage.removeItem("foodguess_run_v1");
                  localStorage.removeItem("foodguess_seen_v1");
                } catch { /* ignore */ }
                saveProfile({
                  name: "Guest Chef", xp: 0, gamesPlayed: 0, correct: 0, wrong: 0, bestStreak: 0, bestComboCount: 0,
                  bestGameScore: 0, perfectRounds: 0, impossibleCorrect: 0, countryChallengeCorrect: 0, dailyDates: [],
                  byCountry: {}, byContinent: {}, byFood: {}, achievements: [], history: [],
                  coins: 0, discovered: [], discoveredIngredients: [],
                });
                setResetAsk(false);
                setResetDone(true);
              }}
            >
              {t("game.yes")}
            </Btn>
            <Btn variant="ghost" onClick={() => setResetAsk(false)}>{t("game.no")}</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
