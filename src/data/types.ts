export type Lang = "en" | "fa" | "ar";

export type Difficulty = "easy" | "medium" | "hard" | "extreme";
export type AllDifficulty = Difficulty | "impossible";

export interface LocalizedText {
  en: string;
  fa?: string;
  ar?: string;
}

export type Continent =
  | "middleEast"
  | "asia"
  | "europe"
  | "africa"
  | "northAmerica"
  | "southAmerica"
  | "oceania";

export interface Country {
  id: string;
  name: LocalizedText;
  flag: string;
  continent: Continent;
  cuisine?: LocalizedText;
}

export interface Food {
  id: string;
  name: LocalizedText;
  countryId: string;
  city?: string;
  categories: string[];
  ingredients: string[];
  meat: string[];
  veg: boolean;
  vegan: boolean;
  spice: 0 | 1 | 2 | 3;
  difficulty: Difficulty;
  emoji: string;
  desc: LocalizedText;
  fact?: LocalizedText;
}

export type QuestionType =
  | "country"
  | "city"
  | "cityCountry"
  | "reverseCity"
  | "recipe"
  | "name"
  | "ingredient"
  | "notIngredient"
  | "meat"
  | "cuisine"
  | "region"
  | "category";

export type Rarity = "common" | "uncommon" | "rare" | "epic" | "legendary" | "mythic";

export interface Question {
  key: string;
  type: QuestionType | "custom";
  foodId?: string;
  prompt: LocalizedText;
  options: LocalizedText[];
  correct: number;
  difficulty: AllDifficulty;
  showEmoji?: boolean;
  emoji?: string;
}

export type GameMode =
  | "classic"
  | "timeAttack"
  | "endless"
  | "country"
  | "world"
  | "city"
  | "speed"
  | "hardcore"
  | "journey"
  | "geo"
  | "daily";

export interface GameConfig {
  mode: GameMode;
  difficulty: AllDifficulty;
  countryId?: string;
}

export interface GameResult {
  mode: GameMode;
  difficulty: AllDifficulty;
  score: number;
  correct: number;
  total: number;
  bestCombo: number;
  bestStreak: number;
  xp: number;
  countryId?: string;
  date: string;
}
