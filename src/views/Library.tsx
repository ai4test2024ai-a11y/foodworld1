import { useMemo, useState } from "react";
import { useApp } from "../state/AppContext";
import { CATEGORIES, INGREDIENTS, SPICE_LABELS } from "../data/lexicon";
import {
  categoryLabel,
  countryName,
  foodName,
  getAllFoods,
  getCountries,
  getFood,
  ingredientLabel,
  loc,
  meatLabel,
  searchIngredientFoods,
  spiceLabel,
} from "../data/store";
import type { Food } from "../data/types";
import { Btn, Chip, EmptyState, FoodTile, Modal, SectionTitle } from "../components/ui";
import { sfx } from "../sound";

const PAGE = 24;

export default function Library({ initialFoodId }: { initialFoodId?: string }) {
  const { t, lang } = useApp();
  const [q, setQ] = useState("");
  const [country, setCountry] = useState("all");
  const [cat, setCat] = useState("all");
  const [diff, setDiff] = useState("all");
  const [spice, setSpice] = useState("all");
  const [diet, setDiet] = useState<"all" | "veg" | "vegan">("all");
  const [page, setPage] = useState(0);
  const [openId, setOpenId] = useState<string | undefined>(initialFoodId);
  const [ingOpen, setIngOpen] = useState<string | null>(null);

  const foods = useMemo(() => getAllFoods(), []);
  const countries = useMemo(() => getCountries(), []);

  const filtered = useMemo(() => {
    const nq = q.trim().toLowerCase();
    return foods.filter((f) => {
      if (country !== "all" && f.countryId !== country) return false;
      if (cat !== "all" && !f.categories.includes(cat)) return false;
      if (diff !== "all" && f.difficulty !== diff) return false;
      if (spice !== "all" && f.spice !== Number(spice)) return false;
      if (diet === "veg" && !f.veg) return false;
      if (diet === "vegan" && !f.vegan) return false;
      if (nq) {
        const hay = `${f.name.en} ${f.name.fa ?? ""} ${f.name.ar ?? ""} ${f.ingredients.join(" ")}`.toLowerCase();
        if (!hay.includes(nq)) return false;
      }
      return true;
    });
  }, [foods, q, country, cat, diff, spice, diet]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const pageFoods = filtered.slice(page * PAGE, page * PAGE + PAGE);
  const openFood = openId ? getFood(openId) : undefined;

  const reset = () => {
    setQ(""); setCountry("all"); setCat("all"); setDiff("all"); setSpice("all"); setDiet("all"); setPage(0);
  };

  const selectStyle = "chip appearance-none bg-panel2 px-3 py-2 text-xs font-bold text-ink outline-none";

  return (
    <div>
      <SectionTitle kicker={`${filtered.length} / ${foods.length}`} title={t("lib.title")} />
      <p className="-mt-2 mb-5 text-sm text-muted">{t("lib.sub")}</p>

      {/* search + filters */}
      <div className="card mb-5 space-y-3 p-4">
        <div className="relative">
          <span aria-hidden className="pointer-events-none absolute inset-y-0 start-3 flex items-center text-muted">🔎</span>
          <input
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(0); }}
            placeholder={t("lib.searchPh")}
            aria-label={t("lib.title")}
            className="w-full rounded-xl border border-line bg-panel2 py-3 pe-4 ps-10 text-sm font-semibold outline-none placeholder:text-muted/70 focus:border-saffron"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select value={country} onChange={(e) => { setCountry(e.target.value); setPage(0); }} className={selectStyle} aria-label={t("lib.country")}>
            <option value="all">{t("lib.country")}: {t("lib.all")}</option>
            {countries.map((c) => (
              <option key={c.id} value={c.id}>{c.flag} {loc(c.name, lang)}</option>
            ))}
          </select>
          <select value={cat} onChange={(e) => { setCat(e.target.value); setPage(0); }} className={selectStyle} aria-label={t("lib.category")}>
            <option value="all">{t("lib.category")}: {t("lib.all")}</option>
            {Object.keys(CATEGORIES).map((c) => (
              <option key={c} value={c}>{categoryLabel(c, lang)}</option>
            ))}
          </select>
          <select value={diff} onChange={(e) => { setDiff(e.target.value); setPage(0); }} className={selectStyle} aria-label={t("lib.difficulty")}>
            <option value="all">{t("lib.difficulty")}: {t("lib.all")}</option>
            {(["easy", "medium", "hard", "extreme"] as const).map((d) => (
              <option key={d} value={d}>{t(`diff.${d}`)}</option>
            ))}
          </select>
          <select value={spice} onChange={(e) => { setSpice(e.target.value); setPage(0); }} className={selectStyle} aria-label={t("lib.spice")}>
            <option value="all">{t("lib.spice")}: {t("lib.all")}</option>
            {[0, 1, 2, 3].map((s) => (
              <option key={s} value={s}>🌶 {loc(SPICE_LABELS[s], lang)}</option>
            ))}
          </select>
          <Chip active={diet === "all"} onClick={() => setDiet("all")}>{t("lib.all")}</Chip>
          <Chip active={diet === "veg"} onClick={() => setDiet("veg")}>🌿 {t("lib.veg")}</Chip>
          <Chip active={diet === "vegan"} onClick={() => setDiet("vegan")}>🌱 {t("lib.vegan")}</Chip>
          <button onClick={reset} className="ms-auto text-xs font-bold text-pom hover:underline">{t("lib.clear")}</button>
        </div>
      </div>

      {/* grid */}
      {pageFoods.length === 0 ? (
        <div className="card"><EmptyState emoji="🍽️" text={t("lib.empty")} /></div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {pageFoods.map((f) => (
            <FoodCard key={f.id} food={f} onClick={() => { setOpenId(f.id); sfx.click(); }} />
          ))}
        </div>
      )}

      {/* pagination */}
      {pages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-3">
          <Btn variant="ghost" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>←</Btn>
          <span className="text-xs font-bold text-muted">{t("lib.page", { a: page + 1, b: pages })}</span>
          <Btn variant="ghost" size="sm" disabled={page >= pages - 1} onClick={() => setPage((p) => p + 1)}>→</Btn>
        </div>
      )}

      {/* food detail modal */}
      <Modal open={!!openFood} onClose={() => setOpenId(undefined)} wide>
        {openFood && <FoodDetail food={openFood} onClose={() => setOpenId(undefined)} onIngredient={(i) => { setIngOpen(i); }} />}
      </Modal>

      {/* ingredient modal */}
      <Modal open={!!ingOpen} onClose={() => setIngOpen(null)}>
        {ingOpen && (
          <div>
            <h3 className="font-display text-xl font-bold">🧂 {ingredientLabel(ingOpen, lang)}</h3>
            {(() => {
              const users = searchIngredientFoods(ingOpen);
              return (
                <>
                  <p className="mt-1 text-xs font-bold text-saffron">{t("lib.usedIn", { n: users.length })}</p>
                  <div className="mt-4 max-h-72 space-y-2 overflow-y-auto pe-1">
                    {users.map((f) => (
                      <button key={f.id} onClick={() => { setOpenId(f.id); setIngOpen(null); }} className="flex w-full items-center gap-3 rounded-lg border border-line bg-panel2 p-2 text-start transition-colors hover:border-saffron/50">
                        <span className="text-2xl" aria-hidden>{f.emoji}</span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-bold">{foodName(f, lang)}</span>
                          <span className="text-[11px] text-muted">{countryName(f.countryId, lang)}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              );
            })()}
            <div className="mt-4 text-end">
              <Btn variant="ghost" size="sm" onClick={() => setIngOpen(null)}>{t("common.close")}</Btn>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function FoodCard({ food, onClick }: { food: Food; onClick: () => void }) {
  const { lang } = useApp();
  const diffColor = { easy: "var(--pist)", medium: "var(--saffron)", hard: "#e08a3c", extreme: "var(--pom)" }[food.difficulty];
  return (
    <button onClick={onClick} className="card group flex flex-col items-center gap-2 p-4 text-center transition-all hover:-translate-y-1 hover:border-saffron/50">
      <FoodTile emoji={food.emoji} cat={food.categories[0]} size="md" className="transition-transform group-hover:scale-105" />
      <div className="min-w-0">
        <div className="truncate text-sm font-bold">{foodName(food, lang)}</div>
        <div className="mt-0.5 flex items-center justify-center gap-1 text-[11px] text-muted">
          <span aria-hidden>{countryFlagMini(food.countryId)}</span> {countryName(food.countryId, lang)}
        </div>
      </div>
      <div className="mt-auto flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full" style={{ background: diffColor }} aria-hidden />
        <span className="text-[10px] font-bold text-muted">{food.difficulty}</span>
        {food.spice > 0 && <span className="text-[10px]">{"🌶".repeat(food.spice)}</span>}
      </div>
    </button>
  );
}

function countryFlagMini(id: string): string {
  return getCountries().find((c) => c.id === id)?.flag ?? "🏳️";
}

function FoodDetail({ food, onClose, onIngredient }: { food: Food; onClose: () => void; onIngredient: (i: string) => void }) {
  const { t, lang } = useApp();
  return (
    <div>
      <div className="flex items-start gap-4">
        <FoodTile emoji={food.emoji} cat={food.categories[0]} size="xl" />
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-2xl font-extrabold leading-tight">{foodName(food, lang)}</h3>
          {food.name.fa && <div className="mt-0.5 text-sm text-muted">{food.name.fa}{food.name.ar ? ` · ${food.name.ar}` : ""}</div>}
          <div className="mt-2 flex flex-wrap gap-1.5">
            {food.categories.map((c) => (
              <span key={c} className="chip px-2 py-0.5 text-[10px] font-bold text-saffron">{categoryLabel(c, lang)}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
        <div className="rounded-lg border border-line bg-panel2 p-2.5">
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-muted">{t("lib.origin")}</div>
          <div className="mt-0.5 font-bold">{countryFlagMini(food.countryId)} {countryName(food.countryId, lang)}</div>
        </div>
        {food.city && (
          <div className="rounded-lg border border-line bg-panel2 p-2.5">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-muted">{t("lib.city")}</div>
            <div className="mt-0.5 font-bold">📍 {food.city}</div>
          </div>
        )}
        <div className="rounded-lg border border-line bg-panel2 p-2.5">
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-muted">{t("lib.meat")}</div>
          <div className="mt-0.5 font-bold">{food.meat.length ? food.meat.map((m) => meatLabel(m, lang)).join(" / ") : t("lib.none")}</div>
        </div>
        <div className="rounded-lg border border-line bg-panel2 p-2.5">
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-muted">{t("lib.spice")}</div>
          <div className="mt-0.5 font-bold">🌶 {spiceLabel(food.spice, lang)}</div>
        </div>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-muted">{loc(food.desc, lang)}</p>

      <div className="mt-4">
        <div className="mb-1.5 text-xs font-extrabold uppercase tracking-wider text-muted">{t("lib.ingredients")}</div>
        <div className="flex flex-wrap gap-1.5">
          {food.ingredients.map((i) => (
            <button key={i} onClick={() => onIngredient(i)} className="chip px-2.5 py-1 text-[11px] font-bold text-ink transition-colors hover:border-saffron hover:text-saffron">
              {ingredientLabel(i, lang)}
            </button>
          ))}
        </div>
        <p className="mt-1.5 text-[11px] text-muted">{t("lib.tapIngredient")}</p>
      </div>

      {food.fact && (
        <div className="mt-4 rounded-lg border border-saffron/25 bg-saffron/10 px-3 py-2.5 text-xs leading-relaxed text-saffron2">
          💡 {loc(food.fact, lang)}
        </div>
      )}

      <div className="mt-5 flex justify-end gap-2">
        <Btn variant="ghost" size="sm" onClick={onClose}>{t("common.close")}</Btn>
      </div>
    </div>
  );
}

export { INGREDIENTS };
