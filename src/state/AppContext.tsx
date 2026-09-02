import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { GameConfig, GameResult, Lang } from "../data/types";
import { makeT } from "../i18n";
import type { TFunc } from "../i18n";
import { evaluateAchievements, levelFromXp } from "../game/engine";
import type { AchievementStats } from "../game/engine";
import { setSoundEnabled } from "../sound";

export type View =
  | { name: "home" }
  | { name: "game"; config: GameConfig }
  | { name: "library"; foodId?: string }
  | { name: "countries"; countryId?: string }
  | { name: "map" }
  | { name: "collection" }
  | { name: "journey"; countryId: string; cityId?: string }
  | { name: "board" }
  | { name: "profile" }
  | { name: "settings" }
  | { name: "about" }
  | { name: "help" }
  | { name: "stats" }
  | { name: "admin" };

export interface Settings {
  sound: boolean;
  notifications: boolean;
  calendar: "both" | "gregorian" | "persian";
  animations: boolean;
  theme: "dark" | "light";
}

export interface Profile {
  name: string;
  xp: number;
  gamesPlayed: number;
  correct: number;
  wrong: number;
  bestStreak: number;
  bestComboCount: number;
  bestGameScore: number;
  perfectRounds: number;
  impossibleCorrect: number;
  countryChallengeCorrect: number;
  dailyDates: string[];
  byCountry: Record<string, number>;
  byContinent: Record<string, number>;
  byFood: Record<string, number>;
  achievements: { id: string; date: string }[];
  history: GameResult[];
  coins: number;
  discovered: string[];
  discoveredIngredients: string[];
}

const defaultProfile: Profile = {
  name: "Guest Chef",
  xp: 0,
  gamesPlayed: 0,
  correct: 0,
  wrong: 0,
  bestStreak: 0,
  bestComboCount: 0,
  bestGameScore: 0,
  perfectRounds: 0,
  impossibleCorrect: 0,
  countryChallengeCorrect: 0,
  dailyDates: [],
  byCountry: {},
  byContinent: {},
  byFood: {},
  achievements: [],
  history: [],
  coins: 0,
  discovered: [],
  discoveredIngredients: [],
};

const defaultSettings: Settings = { sound: true, notifications: true, calendar: "both", animations: true, theme: "dark" };

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? { ...fallback, ...(JSON.parse(raw) as T) } : fallback;
  } catch {
    return fallback;
  }
}

export interface GameStats {
  byCountry: Record<string, number>;
  byContinent: Record<string, number>;
  byFood: Record<string, number>;
  streak: number;
  comboCount: number;
}

interface Ctx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: TFunc;
  view: View;
  nav: (v: View) => void;
  settings: Settings;
  updateSettings: (p: Partial<Settings>) => void;
  profile: Profile;
  saveProfile: (p: Profile) => void;
  recordGame: (r: GameResult, s: GameStats) => { newAchievements: string[]; leveledUp: boolean; level: number; xpGained: number };
  discover: (foodId: string | undefined, ingredients: string[]) => { newFood: boolean; newIngredients: number };
  isDailyDone: (key: string) => boolean;
  dailyResult: (key: string) => GameResult | undefined;
  markDaily: (key: string, r: GameResult) => void;
  online: boolean;
  searchOpen: boolean;
  setSearchOpen: (b: boolean) => void;
}

const AppCtx = createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => load<Lang>("fg_lang_v1", "en"));
  const [view, setView] = useState<View>({ name: "home" });
  const [settings, setSettings] = useState<Settings>(() => load("fg_settings_v1", defaultSettings));
  const [profile, setProfile] = useState<Profile>(() => load("fg_profile_v1", defaultProfile));
  const [online, setOnline] = useState<boolean>(typeof navigator === "undefined" ? true : navigator.onLine);
  const [searchOpen, setSearchOpen] = useState(false);
  const t = useMemo(() => makeT(lang), [lang]);
  const firstRender = useRef(true);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "en" ? "ltr" : "rtl";
    try {
      localStorage.setItem("fg_lang_v1", JSON.stringify(lang));
    } catch { /* ignore */ }
  }, [lang]);

  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme;
    document.documentElement.classList.toggle("no-anim", !settings.animations);
    setSoundEnabled(settings.sound);
    try {
      localStorage.setItem("fg_settings_v1", JSON.stringify(settings));
    } catch { /* ignore */ }
  }, [settings]);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    try {
      localStorage.setItem("fg_profile_v1", JSON.stringify(profile));
    } catch { /* ignore */ }
  }, [profile]);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  const setLang = useCallback((l: Lang) => setLangState(l), []);
  const nav = useCallback((v: View) => {
    setView(v);
    setSearchOpen(false);
    window.scrollTo({ top: 0 });
  }, []);
  const updateSettings = useCallback((p: Partial<Settings>) => setSettings((s) => ({ ...s, ...p })), []);
  const saveProfile = useCallback((p: Profile) => setProfile(p), []);

  const recordGame = useCallback(
    (r: GameResult, s: GameStats) => {
      let leveledUp = false;
      let newAch: string[] = [];
      let level = levelFromXp(profile.xp);
      setProfile((prev) => {
        const next: Profile = {
          ...prev,
          xp: prev.xp + r.xp,
          gamesPlayed: prev.gamesPlayed + 1,
          correct: prev.correct + r.correct,
          wrong: prev.wrong + (r.total - r.correct),
          bestStreak: Math.max(prev.bestStreak, s.streak),
          bestComboCount: Math.max(prev.bestComboCount, s.comboCount),
          bestGameScore: Math.max(prev.bestGameScore, r.score),
          perfectRounds: prev.perfectRounds + (r.total >= 5 && r.correct === r.total ? 1 : 0),
          impossibleCorrect: prev.impossibleCorrect + (r.difficulty === "impossible" ? r.correct : 0),
          countryChallengeCorrect: prev.countryChallengeCorrect + (r.mode === "country" ? r.correct : 0),
          byCountry: mergeCount(prev.byCountry, s.byCountry),
          byContinent: mergeCount(prev.byContinent, s.byContinent),
          byFood: mergeCount(prev.byFood, s.byFood),
          history: [r, ...prev.history].slice(0, 30),
        };
        const newLevel = levelFromXp(next.xp);
        leveledUp = newLevel > levelFromXp(prev.xp);
        level = newLevel;
        const stats: AchievementStats = {
          correct: next.correct,
          gamesPlayed: next.gamesPlayed,
          perfectRounds: next.perfectRounds,
          bestStreak: next.bestStreak,
          bestComboCount: next.bestComboCount,
          bestGameScore: next.bestGameScore,
          impossibleCorrect: next.impossibleCorrect,
          dailyCount: next.dailyDates.length,
          countryChallengeCorrect: next.countryChallengeCorrect,
          countriesCorrect: Object.keys(next.byCountry).length,
          iranCorrect: next.byCountry["iran"] ?? 0,
          asiaCorrect: next.byContinent["asia"] ?? 0,
          europeCorrect: next.byContinent["europe"] ?? 0,
          level: newLevel,
        };
        newAch = evaluateAchievements(stats, prev.achievements.map((a) => a.id));
        if (newAch.length) {
          next.achievements = [...prev.achievements, ...newAch.map((id) => ({ id, date: new Date().toISOString() }))];
        }
        return next;
      });
      return { newAchievements: newAch, leveledUp, level, xpGained: r.xp };
    },
    []
  );

  const isDailyDone = useCallback(
    (key: string) => profile.history.some((h) => h.mode === "daily" && h.date.startsWith(key)) || profile.dailyDates.includes(key),
    [profile]
  );
  const dailyResult = useCallback(
    (key: string) => profile.history.find((h) => h.mode === "daily" && h.date.startsWith(key)),
    [profile]
  );
  const markDaily = useCallback((key: string, r: GameResult) => {
    setProfile((p) => (p.dailyDates.includes(key) ? p : { ...p, dailyDates: [...p.dailyDates, key] }));
    void r;
  }, []);

  /** Collection system: discovering a food also collects its ingredients. */
  const discover = useCallback(
    (foodId: string | undefined, ingredients: string[]): { newFood: boolean; newIngredients: number } => {
      if (!foodId) return { newFood: false, newIngredients: 0 };
      const hadFood = profile.discovered.includes(foodId);
      const newIngs = ingredients.filter((i) => !profile.discoveredIngredients.includes(i));
      if (!hadFood || newIngs.length > 0) {
        setProfile((p) => ({
          ...p,
          discovered: p.discovered.includes(foodId) ? p.discovered : [...p.discovered, foodId],
          discoveredIngredients: [...new Set([...p.discoveredIngredients, ...ingredients])],
          coins: p.coins + (p.discovered.includes(foodId) ? 0 : 50) + newIngs.length * 5,
        }));
      }
      return { newFood: !hadFood, newIngredients: newIngs.length };
    },
    [profile.discovered, profile.discoveredIngredients]
  );

  const value: Ctx = {
    lang,
    setLang,
    t,
    view,
    nav,
    settings,
    updateSettings,
    profile,
    saveProfile,
    recordGame,
    discover,
    isDailyDone,
    dailyResult,
    markDaily,
    online,
    searchOpen,
    setSearchOpen,
  };

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

function mergeCount(a: Record<string, number>, b: Record<string, number>): Record<string, number> {
  const out = { ...a };
  for (const [k, v] of Object.entries(b)) out[k] = (out[k] ?? 0) + v;
  return out;
}

export function useApp(): Ctx {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp outside provider");
  return ctx;
}
