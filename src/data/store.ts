import { CITIES } from "./cities";
import type { City } from "./cities";
import { COUNTRIES } from "./countries";
import { CATEGORIES, INGREDIENTS, MEAT_LABELS, SPICE_LABELS } from "./lexicon";
import { EXPANSION_FOODS } from "./foodsExpansion";
import { IRAN_FOODS } from "./foodsIran";
import { WORLD_FOODS } from "./foodsWorld";
import { IMPOSSIBLE_POOL } from "./impossible";
import type { AllDifficulty, Country, Food, Lang, LocalizedText, Question, Rarity } from "./types";

/**
 * Data repository — the ONLY place UI code should read food/country data from.
 * Supports localStorage overrides (admin CRUD) merged over seed data, so the
 * schema scales to a future backend without touching the UI.
 */

interface Overrides {
  customFoods: Food[];
  deletedFoods: string[];
  editedFoods: Record<string, Partial<Food>>;
  customCountries: Country[];
  editedCountries: Record<string, Partial<Country>>;
  customQuestions: Question[];
  deletedQuestions: string[];
  scoring: Partial<Record<AllDifficulty, number>>;
}

const KEY = "foodguess_overrides_v1";

function loadOverrides(): Overrides {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return emptyOverrides();
    const parsed = JSON.parse(raw) as Partial<Overrides>;
    return {
      customFoods: parsed.customFoods ?? [],
      deletedFoods: parsed.deletedFoods ?? [],
      editedFoods: parsed.editedFoods ?? {},
      customCountries: parsed.customCountries ?? [],
      editedCountries: parsed.editedCountries ?? {},
      customQuestions: parsed.customQuestions ?? [],
      deletedQuestions: parsed.deletedQuestions ?? [],
      scoring: parsed.scoring ?? {},
    };
  } catch {
    return emptyOverrides();
  }
}

function emptyOverrides(): Overrides {
  return { customFoods: [], deletedFoods: [], editedFoods: {}, customCountries: [], editedCountries: {}, customQuestions: [], deletedQuestions: [], scoring: {} };
}

let overrides: Overrides = loadOverrides();

export function saveOverrides(next: Overrides): void {
  overrides = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable — keep in memory */
  }
}

export function getOverrides(): Overrides {
  return overrides;
}

export function getAllFoods(): Food[] {
  const seedBase = [...IRAN_FOODS, ...WORLD_FOODS];
  const knownKeys = new Set(seedBase.map((f) => `${f.countryId}|${f.name.en.trim().toLowerCase()}`));
  const seed = [...seedBase, ...EXPANSION_FOODS.filter((f) => !knownKeys.has(`${f.countryId}|${f.name.en.trim().toLowerCase()}`))];
  const merged = seed
    .filter((f) => !overrides.deletedFoods.includes(f.id))
    .map((f) => (overrides.editedFoods[f.id] ? { ...f, ...overrides.editedFoods[f.id] } : f));
  return [...merged, ...overrides.customFoods];
}

export function getFood(id: string): Food | undefined {
  return getAllFoods().find((f) => f.id === id);
}

export function getCountries(): Country[] {
  const merged = COUNTRIES.map((c) => (overrides.editedCountries[c.id] ? { ...c, ...overrides.editedCountries[c.id] } : c));
  const ids = new Set(merged.map((c) => c.id));
  return [...merged, ...overrides.customCountries.filter((c) => !ids.has(c.id))];
}

export function getCountry(id: string): Country | undefined {
  return getCountries().find((c) => c.id === id);
}

export function foodsByCountry(countryId: string): Food[] {
  return getAllFoods().filter((f) => f.countryId === countryId);
}

export function loc(t: LocalizedText | undefined, lang: Lang): string {
  if (!t) return "";
  return t[lang] ?? t.en;
}

export function foodName(f: Food, lang: Lang): string {
  return f.name[lang] ?? f.name.en;
}

export function countryName(id: string, lang: Lang): string {
  const c = getCountry(id);
  return c ? c.name[lang] ?? c.name.en : id;
}

export function countryFlag(id: string): string {
  return getCountry(id)?.flag ?? "🏳️";
}

export function cuisineText(c: Country, lang: Lang): string {
  if (c.cuisine) return loc(c.cuisine, lang);
  if (lang === "fa") return `آشپزی سنتی ${c.name.fa ?? c.name.en}`;
  if (lang === "ar") return `المطبخ التقليدي لـ${c.name.ar ?? c.name.en}`;
  return `Traditional ${c.name.en} cuisine`;
}

export function ingredientLabel(ing: string, lang: Lang): string {
  const t = INGREDIENTS[ing];
  return t ? loc(t, lang) : ing;
}

export function categoryLabel(cat: string, lang: Lang): string {
  const t = CATEGORIES[cat];
  return t ? loc(t, lang) : cat;
}

export function meatLabel(m: string, lang: Lang): string {
  const t = MEAT_LABELS[m];
  return t ? loc(t, lang) : m;
}

export function spiceLabel(level: number, lang: Lang): string {
  const t = SPICE_LABELS[level];
  return t ? loc(t, lang) : String(level);
}

function norm(s: string): string {
  return s.toLowerCase().replace(/[\u200c\u200f\u064b-\u0652]/g, "").trim();
}

export interface SearchResults {
  foods: Food[];
  countries: Country[];
  ingredients: string[];
}

/** Global search across foods, countries and ingredients in all three languages. */
export function searchAll(query: string, lang: Lang, limit = 12): SearchResults {
  const q = norm(query);
  if (!q) return { foods: [], countries: [], ingredients: [] };
  const foods = getAllFoods()
    .filter((f) => norm(foodName(f, lang)) .includes(q) || norm(f.name.en).includes(q) || (f.name.fa && norm(f.name.fa).includes(q)) || (f.name.ar && norm(f.name.ar).includes(q)))
    .slice(0, limit);
  const countries = getCountries()
    .filter((c) => norm(c.name.en).includes(q) || (c.name.fa && norm(c.name.fa).includes(q)) || (c.name.ar && norm(c.name.ar).includes(q)))
    .slice(0, limit);
  const ingredients = Object.keys(INGREDIENTS)
    .filter((k) => norm(k).includes(q) || (INGREDIENTS[k].fa && norm(INGREDIENTS[k].fa!).includes(q)) || (INGREDIENTS[k].ar && norm(INGREDIENTS[k].ar!).includes(q)))
    .slice(0, limit);
  return { foods, countries, ingredients };
}

export function searchIngredientFoods(ing: string): Food[] {
  return getAllFoods().filter((f) => f.ingredients.includes(ing));
}

/** Impossible pool = curated seed + admin custom questions, minus deletions. */
export function getImpossiblePool(): Question[] {
  const base = IMPOSSIBLE_POOL.filter((q) => !overrides.deletedQuestions.includes(q.key));
  return [...base, ...overrides.customQuestions];
}

export function addCustomQuestion(q: Question): void {
  saveOverrides({ ...overrides, customQuestions: [...overrides.customQuestions, q] });
}

export function deleteCustomQuestion(key: string): void {
  saveOverrides({ ...overrides, customQuestions: overrides.customQuestions.filter((x) => x.key !== key) });
}

export function getScoring(): Partial<Record<AllDifficulty, number>> {
  return overrides.scoring;
}

/* ── City food system ── */

export function getCities(): City[] {
  return CITIES;
}

export function citiesOfCountry(countryId: string): City[] {
  return CITIES.filter((c) => c.countryId === countryId);
}

export function cityName(city: City, lang: Lang): string {
  return loc(city.name, lang);
}

export function foodsOfCity(city: City): Food[] {
  const names = new Set(city.foods.map(norm));
  return getAllFoods().filter((f) => f.countryId === city.countryId && (f.city === city.id || names.has(norm(f.name.en))));
}

export function cityOfFood(food: Food): City | undefined {
  if (food.city) {
    const c = CITIES.find((x) => x.id === food.city);
    if (c) return c;
  }
  const en = norm(food.name.en);
  return CITIES.find((c) => c.countryId === food.countryId && c.foods.some((n) => norm(n) === en));
}

export function searchCities(q: string, lang: Lang, limit = 8): City[] {
  const nq = norm(q);
  if (!nq) return [];
  return CITIES.filter((c) => norm(c.name.en).includes(nq) || (c.name.fa && norm(c.name.fa).includes(nq)) || (c.name.ar && norm(c.name.ar).includes(nq))).slice(0, limit);
}

/* ── Rarity ── */

const MYTHIC_FOODS = new Set(["Hákarl", "Surströmming", "Century Egg", "Lutefisk", "Tea Leaf Salad", "Kumis", "Salo", "Fish Ambul Thiyal", "Sopa Paraguaya"]);
const LEGENDARY_FOODS = new Set(["Peka", "Pachamanca", "Hallaca", "Chiles en Nogada", "Khuushuur", "Nom Banh Chok", "Gheimeh Nesar", "Sholeh Ghalamkar", "Kalleh Gunjishki", "Torsh Tareh", "Çiğ Köfte", "Balaleet", "Muhammara", "Morgh-e Torsh"]);

const RARITY_BY_DIFF: Record<string, Rarity> = { easy: "common", medium: "uncommon", hard: "rare", extreme: "epic" };

export function rarityOf(food: Food): Rarity {
  if (MYTHIC_FOODS.has(food.name.en)) return "mythic";
  if (LEGENDARY_FOODS.has(food.name.en)) return "legendary";
  return RARITY_BY_DIFF[food.difficulty] ?? "common";
}

export const RARITY_ORDER: Rarity[] = ["common", "uncommon", "rare", "epic", "legendary", "mythic"];

export function allIngredients(): string[] {
  return [...new Set(getAllFoods().flatMap((f) => f.ingredients))].sort();
}
