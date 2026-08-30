import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useApp } from "../state/AppContext";
import type { GameConfig, GameResult, Lang, Question } from "../data/types";
import {
  CONFIG,
  buildDaily,
  buildQuestions,
  comboMultiplier,
  createStream,
  levelFromXp,
  loadSeen,
  persistSeen,
  pointsFor,
  todayKey,
  xpForLevel,
} from "../game/engine";
import { CONTINENT_LABELS } from "../data/countries";
import { categoryLabel, cityOfFood, countryName, foodName, getCountry, getFood, ingredientLabel, loc, meatLabel, spiceLabel } from "../data/store";
import { Bar, Btn, CountUp, FoodTile, Modal } from "../components/ui";
import { sfx } from "../sound";

const RUN_KEY = "foodguess_run_v1";

function loadRun(): number {
  try {
    return Number(localStorage.getItem(RUN_KEY) ?? "0") || 0;
  } catch {
    return 0;
  }
}
function saveRun(n: number): void {
  try {
    localStorage.setItem(RUN_KEY, String(n));
  } catch { /* ignore */ }
}

type Phase = "playing" | "feedback" | "done";

const REACTIONS_OK = ["r.ok1", "r.ok2", "r.ok3", "r.ok4"];
const REACTIONS_NO = ["r.no1", "r.no2", "r.no3"];
const pickReaction = (arr: string[]): string => arr[Math.floor(Math.random() * arr.length)];

export default function Game({ config }: { config: GameConfig }) {
  const { t, lang, nav, profile, recordGame, markDaily, discover } = useApp();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>("playing");
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(
    config.mode === "timeAttack" || config.mode === "speed" ? Infinity : config.mode === "hardcore" ? 1 : CONFIG.lives
  );
  const [streak, setStreak] = useState(0);
  const [bestStreakRun, setBestStreakRun] = useState(0);
  const [comboCount, setComboCount] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [lastGain, setLastGain] = useState(0);
  const [timeLeft, setTimeLeft] = useState(CONFIG.timeAttackSeconds);
  const [quitAsk, setQuitAsk] = useState(false);
  const [lastWasCorrect, setLastWasCorrect] = useState(false);
  const [reaction, setReaction] = useState("");
  const [lastDiscovery, setLastDiscovery] = useState<{ newFood: boolean; newIngredients: number } | null>(null);
  const discoveredCountRef = useRef(0);

  const streamRef = useRef<ReturnType<typeof createStream> | null>(null);
  const questionStartRef = useRef(Date.now());
  // level before this game started — used for level-up detection on results
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const [fromLevel] = useState(() => levelFromXp(profile.xp));
  const statsRef = useRef({ byCountry: {} as Record<string, number>, byContinent: {} as Record<string, number>, byFood: {} as Record<string, number> });
  const finishedRef = useRef(false);

  const isTimed = config.mode === "timeAttack" || config.mode === "speed";
  const isStream = config.mode === "timeAttack" || config.mode === "endless" || config.mode === "speed";
  const total = isStream ? 0 : questions.length;
  const current: Question | null = isStream ? (questions[idx] ?? null) : (questions[idx] ?? null);
  const mult = comboMultiplier(streak);

  /* ── Init questions ── */
  useEffect(() => {
    const seen = loadSeen();
    if (config.mode === "daily") {
      setQuestions(buildDaily().questions);
    } else if (isStream) {
      streamRef.current = createStream(config);
      const first = streamRef.current.next();
      if (first) setQuestions([first]);
    } else {
      const rngSeed = Date.now() % 1000000;
      const rng = (() => { let s = rngSeed; return () => { s = (s * 16807) % 2147483647; return s / 2147483647; }; })();
      setQuestions(buildQuestions(config, config.mode === "classic" ? CONFIG.classicQuestions : CONFIG.classicQuestions, rng, seen));
    }
    persistSeen(seen);
    questionStartRef.current = Date.now();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Timer ── */
  useEffect(() => {
    if (!isTimed || phase === "done") return;
    const iv = setInterval(() => {
      setTimeLeft((tl) => {
        if (tl <= 0.25) {
          clearInterval(iv);
          return 0;
        }
        if (tl <= 6) sfx.tick();
        return +(tl - 0.25).toFixed(2);
      });
    }, 250);
    return () => clearInterval(iv);
  }, [isTimed, phase]);

  const finish = useCallback(
    (finalScore: number, finalCorrect: number, finalTotal: number, finalStreakRun: number, finalComboCount: number) => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      const perfect = finalTotal >= 5 && finalCorrect === finalTotal;
      let xp = finalCorrect * (CONFIG.xpCorrect[config.difficulty] ?? 20);
      if (finalTotal > 0) xp += CONFIG.xpGameComplete;
      if (config.mode === "daily") xp += CONFIG.xpDailyComplete;
      if (perfect) xp += CONFIG.xpPerfect;
      const result: GameResult = {
        mode: config.mode,
        difficulty: config.difficulty,
        score: finalScore,
        correct: finalCorrect,
        total: finalTotal,
        bestCombo: comboMultiplier(finalComboCount),
        bestStreak: finalStreakRun,
        xp,
        countryId: config.countryId,
        date: new Date().toISOString(),
      };
      recordGame(result, { byCountry: statsRef.current.byCountry, byContinent: statsRef.current.byContinent, byFood: statsRef.current.byFood, streak: finalStreakRun, comboCount: finalComboCount });
      if (config.mode === "daily") markDaily(todayKey(), result);
      setPhase("done");
      sfx.gameover();
    },
    [config, recordGame, markDaily]
  );

  /* timed out */
  useEffect(() => {
    if (isTimed && timeLeft <= 0 && phase !== "done") {
      finish(score, correct, idx + (selected !== null ? 1 : 0), bestStreakRun, comboCount);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, isTimed]);

  const advance = useCallback(() => {
    if (!isTimed && lives <= 0) {
      finish(score, correct, Math.max(idx + 1, correct), bestStreakRun, comboCount);
      return;
    }
    const nextIdx = idx + 1;
    if (!isStream && nextIdx >= total) {
      finish(score, correct, total, bestStreakRun, comboCount);
      return;
    }
    if (isStream) {
      const q = streamRef.current?.next() ?? null;
      if (!q) {
        finish(score, correct, idx + 1, bestStreakRun, comboCount);
        return;
      }
      setQuestions((qs) => [...qs, q]);
    }
    setIdx(nextIdx);
    setSelected(null);
    setPhase("playing");
    questionStartRef.current = Date.now();
  }, [idx, isStream, isTimed, lives, total, finish, score, correct, bestStreakRun, comboCount]);

  const answer = useCallback(
    (i: number) => {
      if (phase !== "playing" || !current) return;
      const ok = i === current.correct;
      setSelected(i);
      setLastWasCorrect(ok);
      const food = current.foodId ? getFood(current.foodId) : undefined;
      if (ok) {
        sfx.correct();
        const base = pointsFor(current.difficulty);
        const newStreak = streak + 1;
        const newMult = comboMultiplier(newStreak);
        let gain = base * newMult;
        if (isTimed) {
          const elapsed = (Date.now() - questionStartRef.current) / 1000;
          gain += Math.max(0, Math.round(CONFIG.speedBonusMax - elapsed * 5));
        }
        setLastGain(gain);
        setScore((s) => s + gain);
        setCorrect((c) => c + 1);
        setStreak(newStreak);
        setComboCount((c) => Math.max(c, newStreak));
        setBestStreakRun((b) => Math.max(b, loadRun() + newStreak));
        saveRun(loadRun() + 1);
        if (newMult > comboMultiplier(streak) && newMult > 1) sfx.combo();
        if (food) {
          statsRef.current.byCountry[food.countryId] = (statsRef.current.byCountry[food.countryId] ?? 0) + 1;
          statsRef.current.byFood[food.id] = (statsRef.current.byFood[food.id] ?? 0) + 1;
          const cont = getCountry(food.countryId)?.continent;
          if (cont) statsRef.current.byContinent[cont] = (statsRef.current.byContinent[cont] ?? 0) + 1;
          const d = discover(food.id, food.ingredients);
          setLastDiscovery(d);
          if (d.newFood) discoveredCountRef.current += 1;
        } else {
          setLastDiscovery(null);
        }
        setReaction(t(pickReaction(REACTIONS_OK)));
      } else {
        sfx.wrong();
        saveRun(0);
        setStreak(0);
        setLastGain(0);
        setLastDiscovery(null);
        setReaction(t(pickReaction(REACTIONS_NO)));
        if (!isTimed) setLives((l) => l - 1);
      }
      setPhase("feedback");
    },
    [phase, current, streak, isTimed]
  );

  /* lives out */
  useEffect(() => {
    if (!isStream && phase === "feedback" && lives <= 0 && !lastWasCorrect) {
      const timer = setTimeout(() => finish(score, correct, idx + 1, bestStreakRun, comboCount), 1400);
      return () => clearTimeout(timer);
    }
  }, [lives, phase, isStream, lastWasCorrect, finish, score, correct, idx, bestStreakRun, comboCount]);

  /* keyboard */
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (phase === "playing" && ["1", "2", "3", "4"].includes(e.key)) answer(Number(e.key) - 1);
      if (phase === "feedback" && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        if (lives <= 0 && !isTimed && !lastWasCorrect) return;
        advance();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [phase, answer, advance, lives, isTimed, lastWasCorrect]);

  const food = current?.foodId ? getFood(current.foodId) : undefined;
  const country = food ? getCountry(food.countryId) : undefined;

  const letters = ["A", "B", "C", "D"];

  if (questions.length === 0 && !isStream) {
    return (
      <div className="card mx-auto max-w-md p-8 text-center">
        <div className="text-5xl" aria-hidden>🍽️</div>
        <p className="mt-4 text-muted">{t("cn.empty")}</p>
        <Btn className="mt-5" onClick={() => nav({ name: "home" })}>{t("results.home")}</Btn>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      {/* ── HUD ── */}
      <div className="sticky top-16 z-30 -mx-1 mb-4 rounded-xl border border-line bg-bg/90 px-3 py-2.5 backdrop-blur-md sm:top-20">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
          <div className="flex items-center gap-1.5 text-sm font-bold">
            <span className="text-[10px] uppercase tracking-wider text-muted">{t("game.score")}</span>
            <CountUp value={score} className="font-display text-lg text-saffron" />
            {phase === "feedback" && lastWasCorrect && (
              <span className="anim-pop font-display text-xs font-extrabold text-pist">+{lastGain}</span>
            )}
          </div>
          {isTimed ? (
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase tracking-wider text-muted">⏱ {t("game.timeLeft")}</span>
              <span className={`font-display text-lg font-extrabold ${timeLeft < 10 ? "text-pom anim-flicker" : "text-ink"}`}>{Math.ceil(timeLeft)}s</span>
            </div>
          ) : (
            <div className="flex items-center gap-0.5" aria-label={`${t("game.lives")}: ${lives}`}>
              {Array.from({ length: CONFIG.lives }).map((_, i) => (
                <span key={i} aria-hidden className={`text-base transition-all duration-300 ${i < lives ? "" : "scale-75 opacity-20 grayscale"}`}>❤️</span>
              ))}
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase tracking-wider text-muted">{t("game.combo")}</span>
            <span className={`font-display text-lg font-extrabold ${mult > 1 ? "anim-combo text-saffron" : "text-muted"}`}>×{mult}</span>
            {streak >= 3 && <span aria-hidden className="anim-flicker">🔥</span>}
          </div>
          <div className="ms-auto flex items-center gap-2 text-xs font-bold text-muted">
            <span className="chip px-2 py-0.5 text-[10px] text-saffron">🪙 {profile.coins.toLocaleString()}</span>
            {config.mode === "geo" ? (
              <span className="chip px-2 py-0.5 text-[10px] text-teal">🧭 {t("chain.step", { a: (idx % 3) + 1 })}</span>
            ) : (
              <span className="chip px-2 py-0.5 text-[10px] text-saffron">{t(`diff.${config.difficulty}`)}</span>
            )}
            {!isStream && <span>{t("game.question")} {Math.min(idx + 1, total)}/{total}</span>}
            {isStream && <span>#{idx + 1}</span>}
            <Btn variant="ghost" size="sm" onClick={() => setQuitAsk(true)}>{t("game.quit")}</Btn>
          </div>
        </div>
        {!isTimed && (
          <Bar value={phase === "done" ? 1 : idx + (phase === "feedback" ? 1 : 0)} max={Math.max(total, 1)} className="mt-2" color={mult > 1 ? "var(--pom)" : "var(--saffron)"} />
        )}
        {isTimed && <Bar value={timeLeft} max={CONFIG.timeAttackSeconds} className="mt-2" color={timeLeft < 10 ? "var(--pom)" : "var(--teal)"} />}
      </div>

      {/* ── Question card ── */}
      {phase !== "done" && current && (
        <div key={idx} className="card anim-rise overflow-hidden">
          <div className="flex flex-col items-center gap-3 p-6 pb-4 text-center">
            {current.showEmoji !== false ? (
              <FoodTile emoji={current.emoji ?? "🍽️"} size="xl" className="anim-floaty" />
            ) : (
              <div className="flex h-40 w-40 items-center justify-center rounded-xl border-2 border-dashed border-line2 bg-panel2 font-display text-6xl font-extrabold text-line2 select-none" aria-hidden>?</div>
            )}
            <div className="chip px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.15em] text-saffron">
              {t(`diff.${current.difficulty}`)} · {pointsFor(current.difficulty)} pts
            </div>
            <h2 className="max-w-xl font-display text-xl font-bold leading-snug sm:text-2xl">{loc(current.prompt, lang)}</h2>
          </div>

          <div className="grid gap-2.5 p-5 pt-1 sm:grid-cols-2">
            {current.options.map((opt, i) => {
              const isCorrect = i === current.correct;
              const isSel = i === selected;
              let cls = "border-line bg-panel2 hover:border-saffron/60 hover:bg-saffron/5";
              if (phase === "feedback") {
                if (isCorrect) cls = "border-pist bg-pist/15 text-pist anim-pop";
                else if (isSel) cls = "border-pom bg-pom/15 text-pom anim-shake";
                else cls = "border-line bg-panel2 opacity-40";
              }
              return (
                <button
                  key={i}
                  disabled={phase !== "playing"}
                  onClick={() => answer(i)}
                  className={`flex min-h-14 items-center gap-3 rounded-xl border-2 px-4 py-3 text-start text-sm font-bold transition-all sm:text-base ${cls}`}
                >
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border font-display text-sm font-extrabold ${phase === "feedback" && isCorrect ? "border-pist bg-pist text-[#1c2b0a]" : phase === "feedback" && isSel ? "border-pom bg-pom text-[#2b0a0a]" : "border-line2 bg-bg text-muted"}`}>
                    {phase === "feedback" && isCorrect ? "✓" : phase === "feedback" && isSel && !isCorrect ? "✕" : letters[i]}
                  </span>
                  {loc(opt, lang)}
                </button>
              );
            })}
          </div>

          {/* ── Feedback: food info card ── */}
          {phase === "feedback" && (
            <div className="anim-rise border-t border-line bg-panel2/50 p-5">
              <div className={`mb-3 flex items-center gap-2 font-display text-lg font-extrabold ${lastWasCorrect ? "text-pist" : "text-pom"}`}>
                <span aria-hidden className="text-2xl">{lastWasCorrect ? "✅" : "❌"}</span>
                {lastWasCorrect ? t("game.correct") : t("game.wrong")}
                {!lastWasCorrect && current.options[current.correct] && (
                  <span className="text-sm font-bold text-ink">
                    {" "}{t("game.answerWas")} <span className="text-pist">{loc(current.options[current.correct], lang)}</span>
                  </span>
                )}
              </div>
              {reaction && <p className="anim-fade -mt-1 mb-3 text-sm font-bold text-muted">{reaction}</p>}
              {lastWasCorrect && lastDiscovery && (lastDiscovery.newFood || lastDiscovery.newIngredients > 0) && (
                <div className="anim-pop mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-saffron/40 bg-saffron/10 px-3 py-2 text-xs font-extrabold text-saffron">
                  <span aria-hidden className="text-base">✨</span>
                  {lastDiscovery.newFood ? t("game.discovery") : t("game.already")}
                  {lastDiscovery.newIngredients > 0 && <span className="chip border-saffron/40 px-2 py-0.5">🧂 {t("game.discoveryIng", { n: lastDiscovery.newIngredients })}</span>}
                  <span className="chip border-saffron/40 px-2 py-0.5">🪙 +{lastDiscovery.newFood ? 50 : 0}{lastDiscovery.newIngredients > 0 ? ` +${lastDiscovery.newIngredients * 5}` : ""}</span>
                </div>
              )}
              {config.mode === "geo" && food && <GeoRoute food={food} lang={lang} />}
              {food && (
                <div className="mb-4 grid gap-4 rounded-xl border border-line bg-panel p-4 sm:grid-cols-[auto_1fr]">
                  <FoodTile emoji={food.emoji} cat={food.categories[0]} size="lg" />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display text-lg font-bold">{foodName(food, lang)}</h3>
                      <span className="chip px-2 py-0.5 text-[10px] font-bold">{country?.flag} {countryName(food.countryId, lang)}</span>
                    </div>
                    <p className="mt-1.5 text-sm text-muted">{loc(food.desc, lang)}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {food.categories.map((c) => (
                        <span key={c} className="chip px-2 py-0.5 text-[10px] font-bold text-saffron">{categoryLabel(c, lang)}</span>
                      ))}
                      <span className="chip px-2 py-0.5 text-[10px] font-bold">{food.meat.length ? food.meat.map((m) => meatLabel(m, lang)).join(" / ") : food.vegan ? t("lib.vegan") : t("lib.veg")}</span>
                      <span className="chip px-2 py-0.5 text-[10px] font-bold">🌶 {spiceLabel(food.spice, lang)}</span>
                    </div>
                    <div className="mt-2.5">
                      <div className="mb-1 text-[10px] font-extrabold uppercase tracking-wider text-muted">{t("game.mainIngredients")}</div>
                      <div className="flex flex-wrap gap-1">
                        {food.ingredients.map((ing) => (
                          <span key={ing} className="rounded-md border border-line bg-bg px-2 py-0.5 text-[11px] font-semibold text-muted">{ingredientLabel(ing, lang)}</span>
                        ))}
                      </div>
                    </div>
                    {(food.fact || !lastWasCorrect) && (
                      <div className="mt-3 rounded-lg border border-saffron/25 bg-saffron/8 px-3 py-2 text-xs leading-relaxed text-saffron2">
                        <span className="font-extrabold">💡 {t("game.fact")}: </span>
                        {food.fact ? loc(food.fact, lang) : loc(food.desc, lang)}
                      </div>
                    )}
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between gap-3">
                <span className="hidden text-[11px] text-muted sm:block">{t("game.tapHint")}</span>
                <Btn size="lg" onClick={advance} className="ms-auto">
                  {t("game.next")} <span aria-hidden>→</span>
                </Btn>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Results ── */}
      {phase === "done" && (
        <Results
          score={score}
          correct={correct}
          total={Math.max(idx + (selected !== null ? 1 : 0), correct)}
          bestCombo={comboMultiplier(comboCount)}
          bestStreak={bestStreakRun}
          config={config}
          fromLevel={fromLevel}
          onAgain={() => nav({ name: "game", config })}
          onHome={() => nav({ name: "home" })}
        />
      )}

      <Modal open={quitAsk} onClose={() => setQuitAsk(false)}>
        <div className="text-center">
          <div className="text-4xl" aria-hidden>🏳️</div>
          <p className="mt-3 font-bold">{t("game.quitAsk")}</p>
          <div className="mt-5 flex justify-center gap-2">
            <Btn variant="danger" onClick={() => nav({ name: "home" })}>{t("game.yes")}</Btn>
            <Btn variant="ghost" onClick={() => setQuitAsk(false)}>{t("game.no")}</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}

/* ── Results screen ── */

function GeoRoute({ food, lang }: { food: NonNullable<ReturnType<typeof getFood>>; lang: Lang }) {
  const { t } = useApp();
  const city = cityOfFood(food);
  const country = getCountry(food.countryId);
  const cont = country ? CONTINENT_LABELS[country.continent] : undefined;
  const steps = [
    { i: "🍜", v: foodName(food, lang) },
    { i: "🏙️", v: city ? loc(city.name, lang) : "—" },
    { i: country?.flag ?? "🏳️", v: country ? loc(country.name, lang) : "—" },
    { i: "🌍", v: cont ? loc(cont, lang) : "—" },
  ];
  return (
    <div className="anim-rise mb-4 rounded-xl border border-teal/40 bg-teal/5 px-3 py-2.5">
      <div className="mb-1.5 text-[10px] font-extrabold uppercase tracking-wider text-teal">🧭 {t("chain.route")}</div>
      <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
        {steps.map((s, i) => (
          <span key={i} className="flex items-center gap-1.5">
            <span className="chip flex items-center gap-1 px-2 py-1">
              <span aria-hidden>{s.i}</span> {s.v}
            </span>
            {i < steps.length - 1 && <span aria-hidden className="text-muted rtl:rotate-180">→</span>}
          </span>
        ))}
      </div>
    </div>
  );
}

function Results({ score, correct, total, bestCombo, bestStreak, config, fromLevel, onAgain, onHome }: {
  score: number; correct: number; total: number; bestCombo: number; bestStreak: number; config: GameConfig; fromLevel: number; onAgain: () => void; onHome: () => void;
}) {
  const { t, profile } = useApp();
  const level = levelFromXp(profile.xp);
  const leveledUp = level > fromLevel;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
  const newAch = useMemo(() => {
    const recent = profile.achievements.slice(-3);
    return recent.filter((a) => Date.now() - new Date(a.date).getTime() < 60_000);
  }, [profile.achievements]);

  useEffect(() => {
    if (leveledUp) sfx.levelup();
    if (newAch.length > 0) sfx.achievement();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const xpInto = profile.xp - xpForLevel(level);
  const xpNeed = xpForLevel(level + 1) - xpForLevel(level);

  return (
    <div className="card anim-pop mx-auto max-w-xl overflow-hidden">
      <div className="relative border-b border-line bg-gradient-to-b from-saffron/15 to-transparent p-6 text-center">
        <div className="anim-floaty text-6xl" aria-hidden>🏁</div>
        <h2 className="mt-2 font-display text-3xl font-extrabold">{t("results.title")}</h2>
        <div className="mt-1 text-xs font-bold uppercase tracking-[0.2em] text-muted">
          {t(`mode.${config.mode}`)} · {t(`diff.${config.difficulty}`)}
        </div>
        <div className="mt-4 font-display text-5xl font-extrabold text-saffron">
          <CountUp value={score} duration={1200} />
        </div>
        {leveledUp && (
          <div className="anim-pop mx-auto mt-3 inline-flex items-center gap-2 rounded-full border border-saffron/50 bg-saffron/15 px-4 py-1.5 font-display text-sm font-extrabold text-saffron">
            ⭐ {t("results.levelUp")} {t("results.toLevel", { n: level })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 p-6 sm:grid-cols-3">
        {[
          { label: t("results.correct"), value: `${correct}/${total}`, icon: "✅" },
          { label: t("results.accuracy"), value: `${accuracy}%`, icon: "🎯" },
          { label: t("results.bestCombo"), value: `×${bestCombo}`, icon: "🔥" },
          { label: t("results.bestStreak"), value: String(bestStreak), icon: "⚡" },
          { label: t("results.xp"), value: `+${correct * (CONFIG.xpCorrect[config.difficulty] ?? 20) + CONFIG.xpGameComplete}`, icon: "✨" },
          { label: t("common.level"), value: String(level), icon: "🏅" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-line bg-panel2 p-3 text-center">
            <div className="text-xl" aria-hidden>{s.icon}</div>
            <div className="mt-1 font-display text-lg font-extrabold">{s.value}</div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="px-6 pb-2">
        <Bar value={xpInto} max={xpNeed} />
        <div className="mt-1 text-center text-[11px] font-bold text-muted">{t("prof.nextLevel", { a: xpInto, b: xpNeed, n: level + 1 })}</div>
      </div>

      {newAch.length > 0 && (
        <div className="mx-6 mb-2 space-y-2">
          {newAch.map((a) => (
            <div key={a.id} className="anim-rise flex items-center gap-2 rounded-lg border border-saffron/40 bg-saffron/10 px-3 py-2 text-sm font-bold text-saffron">
              🏆 {t("results.achievement")}
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2 p-6">
        <Btn size="lg" onClick={onAgain} className="flex-1">▶ {t("results.playAgain")}</Btn>
        <Btn size="lg" variant="ghost" onClick={onHome} className="flex-1">{t("results.home")}</Btn>
      </div>
    </div>
  );
}
