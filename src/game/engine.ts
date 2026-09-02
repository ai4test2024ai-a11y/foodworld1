import { CONTINENT_LABELS, COUNTRIES } from "../data/countries";
import { CATEGORIES, MEAT_LABELS } from "../data/lexicon";
import { RECIPES, getRecipe } from "../data/recipes";
import { categoryLabel, citiesOfCountry, cityOfFood, countryFlag, countryName, getAllFoods, getCountry, getImpossiblePool, getScoring, ingredientLabel, loc } from "../data/store";
import type { AllDifficulty, Difficulty, Food, GameConfig, GameMode, Lang, LocalizedText, Question, QuestionType } from "../data/types";

/* ───────────────────────── Configurable rules ───────────────────────── */

export const CONFIG = {
  points: { easy: 100, medium: 200, hard: 400, extreme: 800, impossible: 1500 } as Record<AllDifficulty, number>,
  comboTiers: [
    { at: 10, mult: 5 },
    { at: 5, mult: 3 },
    { at: 3, mult: 2 },
  ],
  xpCorrect: { easy: 10, medium: 20, hard: 40, extreme: 80, impossible: 150 } as Record<AllDifficulty, number>,
  xpGameComplete: 40,
  xpDailyComplete: 150,
  xpPerfect: 100,
  lives: 3,
  classicQuestions: 15,
  dailyQuestions: 10,
  timeAttackSeconds: 60,
  speedBonusMax: 50,
  wrongPenalty: 20,
  /** Multiplier applied to a correct answer's points for each hint level used (index = hints used). */
  hintFactor: [1, 0.75, 0.5, 0.35, 0.25],
  maxHints: 4,
  unlocks: {
    easy: { level: 0 },
    medium: { level: 2 },
    hard: { level: 4 },
    extreme: { level: 7 },
    impossible: { level: 10 },
  } as Record<AllDifficulty, { level: number }>,
  recentMemory: 400,
  recentTtlMs: 1000 * 60 * 60 * 72,
};

export function comboMultiplier(streak: number): number {
  for (const t of CONFIG.comboTiers) if (streak >= t.at) return t.mult;
  return 1;
}

/** Admin-overridable scoring. */
export function pointsFor(d: AllDifficulty): number {
  const ov = getScoring();
  return ov[d] ?? CONFIG.points[d];
}

/** Penalty subtracted on a wrong answer (score never drops below 0). */
export function wrongPenalty(): number {
  return CONFIG.wrongPenalty;
}

/** Multiplier applied to a correct answer's points given the number of hints used. */
export function hintFactor(hintsUsed: number): number {
  return CONFIG.hintFactor[Math.min(hintsUsed, CONFIG.hintFactor.length - 1)] ?? 0.25;
}

/** Progressive hint values for a food: country → main ingredient → category → first letter. */
export function hintsFor(food: Food, lang: Lang): string[] {
  const name = (lang === "fa" ? food.name.fa : lang === "ar" ? food.name.ar : food.name.en) ?? food.name.en;
  return [
    `${countryFlag(food.countryId)} ${countryName(food.countryId, lang)}`,
    `🧂 ${ingredientLabel(food.ingredients[0] ?? "", lang)}`,
    `🗂️ ${categoryLabel(food.categories[0] ?? "traditional", lang)}`,
    `🔤 «${name.trim().charAt(0)}» …`,
  ];
}

export function levelFromXp(xp: number): number {
  return Math.floor(Math.sqrt(xp / 120)) + 1;
}

export function xpForLevel(level: number): number {
  return 120 * (level - 1) * (level - 1);
}

/* ───────────────────────── RNG ───────────────────────── */

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function todaySeed(): number {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pick<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)];
}

/* ───────────────────────── Anti-repetition memory ───────────────────────── */

const SEEN_KEY = "foodguess_seen_v1";

export function loadSeen(): Map<string, number> {
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    const now = Date.now();
    const map = new Map<string, number>();
    if (raw) {
      const arr = JSON.parse(raw) as [string, number][];
      for (const [k, t] of arr) if (now - t < CONFIG.recentTtlMs) map.set(k, t);
    }
    return map;
  } catch {
    return new Map();
  }
}

export function persistSeen(map: Map<string, number>): void {
  try {
    const now = Date.now();
    const arr = [...map.entries()].filter(([, t]) => now - t < CONFIG.recentTtlMs).slice(-CONFIG.recentMemory);
    localStorage.setItem(SEEN_KEY, JSON.stringify(arr));
  } catch {
    /* ignore */
  }
}

/* ───────────────────────── Question templates (trilingual) ───────────────────────── */

const fill = (t: LocalizedText, vars: Record<string, string>): LocalizedText => ({
  en: t.en.replace(/\{(\w+)\}/g, (_, k: string) => vars[k] ?? ""),
  fa: t.fa?.replace(/\{(\w+)\}/g, (_, k: string) => vars[k] ?? ""),
  ar: t.ar?.replace(/\{(\w+)\}/g, (_, k: string) => vars[k] ?? ""),
});

/** Fills a template with the food's localized name per language. */
const tplFood = (tpl: LocalizedText, food: Food): LocalizedText => {
  const n = { en: food.name.en, fa: food.name.fa ?? food.name.en, ar: food.name.ar ?? food.name.en };
  return { en: tpl.en.replace("{food}", n.en), fa: tpl.fa?.replace("{food}", n.fa), ar: tpl.ar?.replace("{food}", n.ar) };
};

const TEMPLATES: Record<QuestionType, LocalizedText> = {
  country: {
    en: "{food} — which country is this dish from?",
    fa: "{food} از کدام کشور است؟",
    ar: "من أي بلد طبق «{food}»؟",
  },
  city: {
    en: "{food} — which city or region is this dish associated with?",
    fa: "{food} با کدام شهر یا منطقه مرتبط است؟",
    ar: "بأي مدينة أو منطقة يرتبط طبق {food}؟",
  },
  cityCountry: {
    en: "Which country is the city of {city} in?",
    fa: "شهر {city} در کدام کشور است؟",
    ar: "في أي بلد تقع مدينة {city}؟",
  },
  reverseCity: {
    en: "Which of these foods is associated with {city}?",
    fa: "کدام‌یک از این غذاها با {city} مرتبط است؟",
    ar: "أي من هذه الأطباق مرتبط بـ {city}؟",
  },
  recipe: {
    en: "In the traditional preparation of {food}, what happens first?",
    fa: "در تهیه سنتی {food} اولین مرحله چیست؟",
    ar: "ما الخطوة الأولى في تحضير {food} تقليدياً؟",
  },
  name: {
    en: "A dish made with {clue}. What is it called?",
    fa: "غذایی که با {clue} درست می‌شود. نامش چیست؟",
    ar: "طبق يُحضَّر من {clue}. ما اسمه؟",
  },
  ingredient: {
    en: "Which ingredient is traditionally used in {food}?",
    fa: "کدام ماده به‌طور سنتی در {food} استفاده می‌شود؟",
    ar: "أي مكوّن يُستخدم تقليدياً في {food}؟",
  },
  notIngredient: {
    en: "Which ingredient is NOT normally found in {food}?",
    fa: "کدام ماده معمولاً در {food} وجود ندارد؟",
    ar: "أي مكوّن لا يوجد عادةً في {food}؟",
  },
  meat: {
    en: "What type of meat is commonly used in {food}?",
    fa: "در {food} معمولاً از چه گوشتی استفاده می‌شود؟",
    ar: "ما نوع اللحم المستخدم عادة في {food}؟",
  },
  cuisine: {
    en: "Which cuisine does {food} belong to?",
    fa: "{food} به کدام آشپزی تعلق دارد؟",
    ar: "إلى أي مطبخ ينتمي طبق {food}؟",
  },
  region: {
    en: "Which region of the world is {food} from?",
    fa: "{food} از کدام منطقه جهان است؟",
    ar: "من أي منطقة في العالم طبق {food}؟",
  },
  category: {
    en: "What kind of dish is {food}?",
    fa: "{food} چه نوع غذایی است؟",
    ar: "ما نوع طبق {food}؟",
  },
  battle: {
    en: "Which dish matches the clue?",
    fa: "کدام غذا با سرنخ جور است؟",
    ar: "أي طبق يطابق الدليل؟",
  },
};

const cuisineOf = (countryId: string, lang: Lang): string =>
  lang === "fa" ? `آشپزی ${countryName(countryId, "fa")}` : lang === "ar" ? `المطبخ ${countryName(countryId, "ar")}` : `${countryName(countryId, "en")} cuisine`;

/* ───────────────────────── Question generation ───────────────────────── */

const TYPES_BY_DIFF: Record<Difficulty, QuestionType[]> = {
  easy: ["country", "name", "category", "cuisine"],
  medium: ["country", "city", "cityCountry", "name", "ingredient", "cuisine", "category"],
  hard: ["country", "city", "cityCountry", "reverseCity", "recipe", "name", "ingredient", "notIngredient", "meat", "cuisine", "region", "category"],
  extreme: ["country", "city", "cityCountry", "reverseCity", "recipe", "name", "ingredient", "notIngredient", "meat", "cuisine", "region", "category"],
};

export function applicableTypes(food: Food, diff: AllDifficulty): QuestionType[] {
  if (diff === "impossible") return [];
  const base = TYPES_BY_DIFF[diff];
  return base.filter((t) => {
    if (t === "meat") return food.meat.length > 0;
    if (t === "notIngredient") return food.ingredients.length >= 3;
    if (t === "name") return food.ingredients.length >= 2;
    if (t === "city" || t === "cityCountry") return !!cityOfFood(food) && citiesOfCountry(food.countryId).length >= 4;
    if (t === "reverseCity") return !!cityOfFood(food);
    if (t === "recipe") return !!getRecipe(food.name.en);
    return true;
  });
}

export function generateQuestion(food: Food, type: QuestionType, diff: AllDifficulty, rng: () => number): Question {
  const foods = getAllFoods();
  const countries = getCountriesSafe();
  const sameCountry = foods.filter((f) => f.countryId === food.countryId && f.id !== food.id);
  const me = getCountry(food.countryId);

  let prompt: LocalizedText;
  let options: LocalizedText[] = [];
  let correctText: LocalizedText;

  switch (type) {
    case "country": {
      prompt = tplFood(TEMPLATES.country, food);
      correctText = me?.name ?? { en: food.countryId };
      const others = countries.filter((c) => c.id !== food.countryId);
      const sameCont = others.filter((c) => c.continent === me?.continent);
      const picks = shuffle(others, rng).slice(0, 3);
      if (diff !== "easy" && sameCont.length >= 3) picks.push(...shuffle(sameCont, rng).slice(0, 3));
      options = [correctText, ...shuffle(picks, rng).slice(0, 3).map((c) => c.name)];
      break;
    }
    case "city": {
      prompt = tplFood(TEMPLATES.city, food);
      const correctCity = cityOfFood(food);
      correctText = correctCity?.name ?? { en: food.city ?? "" };
      const otherCities = shuffle(citiesOfCountry(food.countryId).filter((c) => c.id !== correctCity?.id), rng).slice(0, 3);
      options = [correctText, ...otherCities.map((c) => c.name)];
      break;
    }
    case "cityCountry": {
      const cty = cityOfFood(food);
      prompt = {
        en: TEMPLATES.cityCountry.en.replace("{city}", cty?.name.en ?? ""),
        fa: TEMPLATES.cityCountry.fa?.replace("{city}", cty?.name.fa ?? cty?.name.en ?? ""),
        ar: TEMPLATES.cityCountry.ar?.replace("{city}", cty?.name.ar ?? cty?.name.en ?? ""),
      };
      correctText = me?.name ?? { en: food.countryId };
      const cOthers = shuffle(countries.filter((c) => c.id !== food.countryId), rng).slice(0, 3);
      options = [correctText, ...cOthers.map((c) => c.name)];
      break;
    }
    case "reverseCity": {
      const cty = cityOfFood(food);
      prompt = {
        en: TEMPLATES.reverseCity.en.replace("{city}", cty?.name.en ?? ""),
        fa: TEMPLATES.reverseCity.fa?.replace("{city}", cty?.name.fa ?? cty?.name.en ?? ""),
        ar: TEMPLATES.reverseCity.ar?.replace("{city}", cty?.name.ar ?? cty?.name.en ?? ""),
      };
      correctText = food.name;
      const decoys = shuffle(foods.filter((f) => f.id !== food.id && f.countryId === food.countryId && !cityOfFood(f)), rng).slice(0, 3);
      options = [food.name, ...decoys.map((f) => f.name)];
      break;
    }
    case "recipe": {
      prompt = tplFood(TEMPLATES.recipe, food);
      const rec = getRecipe(food.name.en);
      const firstStep = rec?.steps[0]?.en ?? "";
      correctText = { en: firstStep };
      const wrongSteps = shuffle(
        [...new Set(Object.values(RECIPES).flatMap((r) => r.steps.map((s) => s.en)))].filter((s) => s !== firstStep),
        rng
      ).slice(0, 3);
      options = [{ en: firstStep }, ...wrongSteps.map((s) => ({ en: s }))];
      break;
    }
    case "name": {
      const ings = shuffle(food.ingredients, rng).slice(0, 3);
      const clueEn = ings.map((i) => ingredientLabel(i, "en")).join(", ");
      const clueFa = ings.map((i) => ingredientLabel(i, "fa")).join("، ");
      const clueAr = ings.map((i) => ingredientLabel(i, "ar")).join("، ");
      prompt = { en: TEMPLATES.name.en.replace("{clue}", clueEn), fa: TEMPLATES.name.fa?.replace("{clue}", clueFa), ar: TEMPLATES.name.ar?.replace("{clue}", clueAr) };
      correctText = food.name;
      const pool = sameCountry.length >= 3 ? sameCountry : foods.filter((f) => f.id !== food.id && getCountry(f.countryId)?.continent === me?.continent);
      options = [food.name, ...shuffle(pool, rng).slice(0, 3).map((f) => f.name)];
      break;
    }
    case "ingredient": {
      prompt = tplFood(TEMPLATES.ingredient, food);
      const correct = pick(food.ingredients, rng);
      correctText = { en: correct, fa: ingredientLabel(correct, "fa"), ar: ingredientLabel(correct, "ar") };
      const others = shuffle(
        [...new Set(foods.flatMap((f) => f.ingredients))].filter((i) => !food.ingredients.includes(i)),
        rng
      ).slice(0, 3);
      options = [correctText, ...others.map((i) => ({ en: i, fa: ingredientLabel(i, "fa"), ar: ingredientLabel(i, "ar") }))];
      break;
    }
    case "notIngredient": {
      prompt = tplFood(TEMPLATES.notIngredient, food);
      const inDish = shuffle(food.ingredients, rng).slice(0, 3);
      const outsider = pick(
        [...new Set(foods.flatMap((f) => f.ingredients))].filter((i) => !food.ingredients.includes(i)),
        rng
      );
      correctText = { en: outsider, fa: ingredientLabel(outsider, "fa"), ar: ingredientLabel(outsider, "ar") };
      options = [correctText, ...inDish.map((i) => ({ en: i, fa: ingredientLabel(i, "fa"), ar: ingredientLabel(i, "ar") }))];
      break;
    }
    case "meat": {
      prompt = tplFood(TEMPLATES.meat, food);
      const correct = food.meat[0];
      correctText = { en: correct, fa: ingredientLabel(correct, "fa") || correct, ar: ingredientLabel(correct, "ar") || correct };
      const meatKeys = Object.keys(MEAT_LABELS).filter((m) => !food.meat.includes(m));
      options = [correctText, ...shuffle(meatKeys, rng).slice(0, 3).map((m) => MEAT_LABELS[m])];
      break;
    }
    case "cuisine": {
      prompt = tplFood(TEMPLATES.cuisine, food);
      correctText = { en: cuisineOf(food.countryId, "en"), fa: cuisineOf(food.countryId, "fa"), ar: cuisineOf(food.countryId, "ar") };
      const otherCountries = shuffle(countries.filter((c) => c.id !== food.countryId), rng).slice(0, 3);
      options = [correctText, ...otherCountries.map((c) => ({ en: cuisineOf(c.id, "en"), fa: cuisineOf(c.id, "fa"), ar: cuisineOf(c.id, "ar") }))];
      break;
    }
    case "region": {
      prompt = tplFood(TEMPLATES.region, food);
      const cont = me?.continent ?? "asia";
      correctText = CONTINENT_LABELS[cont];
      const otherConts = shuffle(Object.keys(CONTINENT_LABELS).filter((k) => k !== cont), rng).slice(0, 3);
      options = [correctText, ...otherConts.map((k) => CONTINENT_LABELS[k as keyof typeof CONTINENT_LABELS])];
      break;
    }
    case "category": {
      prompt = tplFood(TEMPLATES.category, food);
      const correctCat = food.categories.find((c) => CATEGORIES[c]) ?? food.categories[0];
      correctText = { en: categoryLabel(correctCat, "en"), fa: categoryLabel(correctCat, "fa"), ar: categoryLabel(correctCat, "ar") };
      const others = shuffle(Object.keys(CATEGORIES).filter((k) => !food.categories.includes(k)), rng).slice(0, 3);
      options = [correctText, ...others.map((k) => CATEGORIES[k])];
      break;
    }
    case "battle": {
      // Battle questions are built by buildBattleQuestions (two foods). This stub keeps types complete.
      prompt = TEMPLATES.battle;
      correctText = food.name;
      options = [food.name];
      break;
    }
  }

  const shuffled = shuffle(options.map((o, i) => ({ o, correct: i === 0 })), rng);
  return {
    key: `${food.id}|${type}|${options[0].en}`,
    type,
    foodId: food.id,
    prompt,
    options: shuffled.map((s) => s.o),
    correct: shuffled.findIndex((s) => s.correct),
    difficulty: diff,
    showEmoji: type !== "name" && type !== "country" && type !== "cuisine",
    emoji: food.emoji,
  };
}

function getCountriesSafe() {
  return COUNTRIES;
}

/* ───────────────────────── Round building ───────────────────────── */

function poolFor(cfg: GameConfig): Food[] {
  const all = getAllFoods();
  if (cfg.mode === "country") return all.filter((f) => f.countryId === cfg.countryId);
  if (cfg.mode === "journey") return all.filter((f) => f.countryId === "iran");
  if (cfg.mode === "city") {
    const withCity = all.filter((f) => !!cityOfFood(f));
    return cfg.countryId ? withCity.filter((f) => f.countryId === cfg.countryId) : withCity;
  }
  if (cfg.mode === "hardcore") return all.filter((f) => f.difficulty === "extreme");
  if (cfg.mode === "speed") return all.filter((f) => f.difficulty === "easy" || f.difficulty === "medium");
  if (cfg.difficulty === "impossible") return all;
  if (cfg.mode === "endless") return all;
  if (cfg.mode === "world") return all;
  return all.filter((f) => f.difficulty === cfg.difficulty);
}

/**
 * GEOGRAPHY CHAIN — for every selected food, generate 3 chained questions:
 *   1) food → city   2) city → country   3) country → continent
 * Returned as a flat sequence so the Game screen plays them back-to-back.
 */
export function buildGeoChains(count: number, rng: () => number, countryId?: string): Question[] {
  const foods = getAllFoods().filter((f) => !!cityOfFood(f) && (!countryId || f.countryId === countryId));
  const out: Question[] = [];
  const now = Date.now();
  const seenKeys = loadSeen();
  let guard = 0;
  while (out.length < count * 3 && guard < count * 30 && foods.length > 0) {
    guard++;
    const food = pick(foods, rng);
    const chain: Question[] = [
      generateQuestion(food, "city", "medium", rng),
      generateQuestion(food, "cityCountry", "easy", rng),
      generateQuestion(food, "region", "easy", rng),
    ];
    if (seenKeys.has(chain[0].key) && guard < count * 15) continue;
    seenKeys.set(chain[0].key, now);
    out.push(...chain);
  }
  persistSeen(seenKeys);
  return out;
}

/* ───────────────────────── Food-vs-Food battle ───────────────────────── */

const BATTLE_KINDS = ["spicy", "country", "dessert", "veg"] as const;
const isDessert = (f: Food): boolean => f.categories.includes("dessert") || f.categories.includes("sweet");

export function buildBattleQuestions(count: number, rng: () => number): Question[] {
  const all = getAllFoods();
  const out: Question[] = [];
  let guard = 0;
  while (out.length < count && guard < count * 40 && all.length > 1) {
    guard++;
    const kind = BATTLE_KINDS[Math.floor(rng() * BATTLE_KINDS.length)];
    const a = pick(all, rng);
    const b = pick(all, rng);
    if (a.id === b.id) continue;
    let prompt: LocalizedText;
    let correctFood: Food;
    switch (kind) {
      case "spicy": {
        if (a.spice === b.spice) continue;
        correctFood = a.spice > b.spice ? a : b;
        prompt = { en: "Which of these dishes is spicier?", fa: "کدام‌یک از این غذاها تندتر است؟", ar: "أي من هذين الطبقين أكثر حدة؟" };
        break;
      }
      case "country": {
        if (a.countryId === b.countryId) continue;
        correctFood = a;
        prompt = {
          en: `Which dish is from ${countryName(a.countryId, "en")}?`,
          fa: `کدام غذا از ${countryName(a.countryId, "fa")} است؟`,
          ar: `أي طبق من ${countryName(a.countryId, "ar")}؟`,
        };
        break;
      }
      case "dessert": {
        if (isDessert(a) === isDessert(b)) continue;
        correctFood = isDessert(a) ? a : b;
        prompt = { en: "Which of these is a dessert?", fa: "کدام‌یک از این غذاها دسر است؟", ar: "أي من هذين الطبقين حلوى؟" };
        break;
      }
      default: {
        if (a.veg === b.veg) continue;
        correctFood = a.veg ? a : b;
        prompt = { en: "Which of these is vegetarian?", fa: "کدام‌یک از این غذاها گیاهی است؟", ar: "أي من هذين الطبقين نباتي؟" };
        break;
      }
    }
    const other = correctFood.id === a.id ? b : a;
    const flip = rng() < 0.5;
    const first = flip ? other : correctFood;
    const second = flip ? correctFood : other;
    out.push({
      key: `battle|${a.id}|${b.id}|${kind}`,
      type: "battle",
      foodId: first.id,
      foodIdB: second.id,
      prompt,
      options: [first.name, second.name],
      correct: flip ? 1 : 0,
      difficulty: "medium",
      showEmoji: false,
    });
  }
  return out;
}

export function buildQuestions(cfg: GameConfig, count: number, rng: () => number, seen: Map<string, number>): Question[] {
  if (cfg.mode === "battle") return buildBattleQuestions(count, rng);
  if (cfg.mode === "geo") {
    const chains = buildGeoChains(Math.ceil(count / 3), rng, cfg.countryId);
    if (chains.length >= 3) return chains.slice(0, count);
    // fallback: not enough city-linked foods for this scope — serve classic questions
    return buildQuestions({ ...cfg, mode: "classic" }, count, rng, seen);
  }
  if (cfg.difficulty === "impossible") {
    const impossiblePool = getImpossiblePool();
    const pool = shuffle(impossiblePool, rng).slice(0, Math.min(count, impossiblePool.length));
    return pool.map((q) => ({ ...q, difficulty: "impossible" as AllDifficulty }));
  }
  const pool = poolFor(cfg);
  const out: Question[] = [];
  const now = Date.now();
  let guard = 0;
  while (out.length < count && guard < count * 40 && pool.length > 0) {
    guard++;
    const food = pick(pool, rng);
    let diff: Difficulty = cfg.difficulty;
    if (cfg.mode === "country" || cfg.mode === "world") {
      // use the food's own difficulty when playing cross-difficulty modes
      diff = food.difficulty;
    }
    const types = applicableTypes(food, diff);
    if (types.length === 0) continue;
    const type = pick(types, rng);
    const q = generateQuestion(food, type, diff, rng);
    if (seen.has(q.key) && guard < count * 20) continue;
    seen.set(q.key, now);
    out.push(q);
  }
  return out;
}

/** Endless / time-attack streaming generator with ramping difficulty. */
export function createStream(cfg: GameConfig) {
  const seen = loadSeen();
  const rng = mulberry32(Date.now() % 100000);
  let answered = 0;
  return {
    next(): Question | null {
      answered++;
      let diff: Difficulty = "easy";
      if (answered > 5) diff = "medium";
      if (answered > 12) diff = "hard";
      if (answered > 22) diff = "extreme";
      const sub: GameConfig = { ...cfg, difficulty: diff };
      const qs = buildQuestions(sub, 1, rng, seen);
      persistSeen(seen);
      return qs[0] ?? null;
    },
  };
}

export function buildDaily(): { questions: Question[]; seed: number } {
  const seed = todaySeed();
  const rng = mulberry32(seed);
  const all = getAllFoods();
  const mk = (diff: Difficulty, n: number): Question[] => {
    const pool = all.filter((f) => f.difficulty === diff);
    const out: Question[] = [];
    for (let i = 0; i < n && pool.length; i++) {
      const food = pool[Math.floor(rng() * pool.length)];
      const types = applicableTypes(food, diff);
      const type = types[Math.floor(rng() * types.length)];
      out.push(generateQuestion(food, type, diff, rng));
    }
    return out;
  };
  const questions = shuffle([...mk("easy", 3), ...mk("medium", 3), ...mk("hard", 2), ...mk("extreme", 2)], rng);
  return { questions, seed };
}

/* ───────────────────────── Calendar helpers ───────────────────────── */

export function gregorianDate(d: Date, lang: Lang): string {
  try {
    return new Intl.DateTimeFormat(lang === "fa" ? "fa-IR-u-ca-gregory" : lang === "ar" ? "ar-EG-u-ca-gregory" : "en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(d);
  } catch {
    return d.toDateString();
  }
}

export function persianDate(d: Date, lang: Lang): string {
  try {
    return new Intl.DateTimeFormat(lang === "fa" ? "fa-IR" : lang === "ar" ? "ar-EG-u-ca-persian" : "en-GB-u-ca-persian", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(d);
  } catch {
    return d.toDateString();
  }
}

export function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/* ───────────────────────── Achievements ───────────────────────── */

export interface AchievementDef {
  id: string;
  icon: string;
  name: LocalizedText;
  desc: LocalizedText;
  test: (p: AchievementStats) => boolean;
}

export interface AchievementStats {
  correct: number;
  gamesPlayed: number;
  perfectRounds: number;
  bestStreak: number;
  bestComboCount: number;
  bestGameScore: number;
  impossibleCorrect: number;
  dailyCount: number;
  countryChallengeCorrect: number;
  countriesCorrect: number;
  iranCorrect: number;
  asiaCorrect: number;
  europeCorrect: number;
  level: number;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: "first-bite", icon: "🍴", name: { en: "First Bite", fa: "اولین لقمه", ar: "أول قضمة" }, desc: { en: "Answer your first question correctly.", fa: "اولین پاسخ درست.", ar: "أجب على أول سؤال بشكل صحيح." }, test: (p) => p.correct >= 1 },
  { id: "taster", icon: "😋", name: { en: "Taster", fa: "چشنده", ar: "متذوق" }, desc: { en: "Reach 10 correct answers.", fa: "به ۱۰ پاسخ درست برسید.", ar: "حقق 10 إجابات صحيحة." }, test: (p) => p.correct >= 10 },
  { id: "gourmet", icon: "🍽️", name: { en: "Gourmet", fa: "خوش‌خوراک", ar: "ذوّاق" }, desc: { en: "Reach 100 correct answers.", fa: "به ۱۰۰ پاسخ درست برسید.", ar: "حقق 100 إجابة صحيحة." }, test: (p) => p.correct >= 100 },
  { id: "grand-chef", icon: "👨‍🍳", name: { en: "Grand Chef", fa: "سرآشپز بزرگ", ar: "الشيف الكبير" }, desc: { en: "Reach 500 correct answers.", fa: "به ۵۰۰ پاسخ درست برسید.", ar: "حقق 500 إجابة صحيحة." }, test: (p) => p.correct >= 500 },
  { id: "perfect-round", icon: "💯", name: { en: "Perfect Round", fa: "دور بی‌نقص", ar: "جولة مثالية" }, desc: { en: "Finish a game with 100% accuracy.", fa: "یک بازی را با دقت ۱۰۰٪ تمام کنید.", ar: "أنهِ جولة بدقة 100%." }, test: (p) => p.perfectRounds >= 1 },
  { id: "combo-fire", icon: "🔥", name: { en: "Combo Fire", fa: "آتیش کمبو", ar: "نار الكومبو" }, desc: { en: "Hit a 10-answer streak in one game.", fa: "۱۰ پاسخ درست پیاپی در یک بازی.", ar: "حقق 10 إجابات متتالية في جولة." }, test: (p) => p.bestComboCount >= 10 },
  { id: "streak-20", icon: "⚡", name: { en: "Lightning", fa: "صاعقه", ar: "البرق" }, desc: { en: "Reach a 20 lifetime streak.", fa: "به ۲۰ پاسخ پیاپی در مجموع برسید.", ar: "حقق سلسلة 20 إجابة." }, test: (p) => p.bestStreak >= 20 },
  { id: "streak-50", icon: "🌩️", name: { en: "Thunderstorm", fa: "رعدوبرق", ar: "العاصفة" }, desc: { en: "Reach a 50 lifetime streak.", fa: "به ۵۰ پاسخ پیاپی در مجموع برسید.", ar: "حقق سلسلة 50 إجابة." }, test: (p) => p.bestStreak >= 50 },
  { id: "world-traveler", icon: "🧭", name: { en: "World Traveler", fa: "جهانگرد", ar: "رحّالة العالم" }, desc: { en: "Correctly identify dishes from 25 countries.", fa: "غذاهای ۲۵ کشور را درست شناسایی کنید.", ar: "تعرّف على أطباق من 25 دولة." }, test: (p) => p.countriesCorrect >= 25 },
  { id: "iran-expert", icon: "🇮🇷", name: { en: "Iran Food Expert", fa: "کارشناس غذای ایران", ar: "خبير الطعام الإيراني" }, desc: { en: "50 correct answers about Iranian dishes.", fa: "۵۰ پاسخ درست درباره غذاهای ایرانی.", ar: "50 إجابة صحيحة عن الأطباق الإيرانية." }, test: (p) => p.iranCorrect >= 50 },
  { id: "asia-explorer", icon: "🏮", name: { en: "Asia Explorer", fa: "کاوشگر آسیا", ar: "مستكشف آسيا" }, desc: { en: "30 correct answers about Asian dishes.", fa: "۳۰ پاسخ درست درباره غذاهای آسیایی.", ar: "30 إجابة صحيحة عن الأطباق الآسيوية." }, test: (p) => p.asiaCorrect >= 30 },
  { id: "europe-master", icon: "🏰", name: { en: "European Food Master", fa: "استاد غذای اروپا", ar: "سيد المطبخ الأوروبي" }, desc: { en: "30 correct answers about European dishes.", fa: "۳۰ پاسخ درست درباره غذاهای اروپایی.", ar: "30 إجابة صحيحة عن الأطباق الأوروبية." }, test: (p) => p.europeCorrect >= 30 },
  { id: "impossible-survivor", icon: "💀", name: { en: "Impossible Survivor", fa: "بازمانده غیرممکن", ar: "ناجي المستحيل" }, desc: { en: "5 correct answers on Impossible mode.", fa: "۵ پاسخ درست در حالت غیرممکن.", ar: "5 إجابات صحيحة في الوضع المستحيل." }, test: (p) => p.impossibleCorrect >= 5 },
  { id: "daily-3", icon: "📅", name: { en: "Regular", fa: "مشتری همیشگی", ar: "المنتظم" }, desc: { en: "Complete 3 Daily Challenges.", fa: "۳ چالش روزانه را کامل کنید.", ar: "أكمل 3 تحديات يومية." }, test: (p) => p.dailyCount >= 3 },
  { id: "challenger", icon: "🏆", name: { en: "100 Country Challenge", fa: "۱۰۰ چالش کشوری", ar: "100 تحدٍ وطني" }, desc: { en: "100 correct answers in Country Challenges.", fa: "۱۰۰ پاسخ درست در چالش‌های کشوری.", ar: "100 إجابة صحيحة في التحديات الوطنية." }, test: (p) => p.countryChallengeCorrect >= 100 },
  { id: "score-10k", icon: "💎", name: { en: "Diamond Plate", fa: "بشقاب الماس", ar: "الطبق الماسي" }, desc: { en: "Score 10,000+ in a single game.", fa: "در یک بازی بیش از ۱۰٬۰۰۰ امتیاز بگیرید.", ar: "سجّل أكثر من 10,000 نقطة في جولة." }, test: (p) => p.bestGameScore >= 10000 },
  { id: "level-10", icon: "⭐", name: { en: "Rising Star", fa: "ستاره نوظهور", ar: "النجم الصاعد" }, desc: { en: "Reach level 10.", fa: "به سطح ۱۰ برسید.", ar: "ابلغ المستوى 10." }, test: (p) => p.level >= 10 },
  { id: "veteran", icon: "🎖️", name: { en: "Veteran", fa: "کهنه‌کار", ar: "المخضرم" }, desc: { en: "Play 25 games.", fa: "۲۵ بازی انجام دهید.", ar: "العب 25 جولة." }, test: (p) => p.gamesPlayed >= 25 },
];

export function evaluateAchievements(stats: AchievementStats, unlocked: string[]): string[] {
  return ACHIEVEMENTS.filter((a) => !unlocked.includes(a.id) && a.test(stats)).map((a) => a.id);
}

export function modeLabel(mode: GameMode): LocalizedText {
  const map: Record<GameMode, LocalizedText> = {
    classic: { en: "Classic", fa: "کلاسیک", ar: "كلاسيكي" },
    timeAttack: { en: "Time Attack", fa: "حمله زمانی", ar: "هجوم الوقت" },
    endless: { en: "Endless", fa: "بی‌پایان", ar: "لا نهائي" },
    country: { en: "Country Challenge", fa: "چالش کشوری", ar: "تحدٍّ وطني" },
    world: { en: "World Challenge", fa: "چالش جهانی", ar: "تحدٍّ عالمي" },
    city: { en: "City Quiz", fa: "کوییز شهری", ar: "اختبار المدينة" },
    speed: { en: "Speed Mode", fa: "حالت سرعتی", ar: "وضع السرعة" },
    hardcore: { en: "Hardcore", fa: "هاردکور", ar: "الوضع القاسي" },
    journey: { en: "Iran Food Journey", fa: "سفر غذایی ایران", ar: "رحلة الطعام الإيراني" },
    geo: { en: "Geography Chain", fa: "زنجیره جغرافیا", ar: "سلسلة الجغرافيا" },
    battle: { en: "Food vs Food", fa: "غذا در برابر غذا", ar: "طعام ضد طعام" },
    streak: { en: "Streak Mode", fa: "حالت استریک", ar: "وضع السلسلة" },
    daily: { en: "Daily Challenge", fa: "چالش روزانه", ar: "التحدي اليومي" },
  };
  return map[mode];
}

export function flagOf(countryId: string): string {
  return countryFlag(countryId);
}

export { loc };
