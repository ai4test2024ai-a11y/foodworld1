import { useMemo, useState } from "react";
import { AppProvider, useApp } from "./state/AppContext";
import type { View } from "./state/AppContext";
import { LANGS } from "./i18n";
import type { Lang } from "./data/types";
import { countryName, foodName, loc, searchAll, searchIngredientFoods, ingredientLabel } from "./data/store";
import { levelFromXp } from "./game/engine";
import Home from "./views/Home";
import Game from "./views/Game";
import Library from "./views/Library";
import Countries from "./views/Countries";
import WorldMap from "./views/WorldMap";
import Collection from "./views/Collection";
import Board from "./views/Board";
import Profile from "./views/Profile";
import Settings from "./views/Settings";
import Admin from "./views/Admin";
import { Modal } from "./components/ui";
import { sfx } from "./sound";

/* ── tiny inline icon set ── */
const I = {
  home: <path d="M3 11.5 12 4l9 7.5M5.5 10v9.5h13V10" />,
  book: <path d="M5 4.5h11A2.5 2.5 0 0 1 18.5 7v12.5H7A2 2 0 0 1 5 17.5v-13zM18.5 17H7a2 2 0 0 0 0 4h11.5v-4z" />,
  globe: <path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zm0 0c-3 2.5-3 15.5 0 18m0-18c3 2.5 3 15.5 0 18M3.5 9h17M3.5 15h17" />,
  trophy: <path d="M7 4h10v4a5 5 0 0 1-10 0V4zm10 1h3v2a4 4 0 0 1-4 4M7 5H4v2a4 4 0 0 0 4 4m4-1v4m-3.5 4h7M9 20.5c0-2 1-2.5 3-2.5s3 .5 3 2.5" />,
  user: <path d="M12 4a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm-7 16a7 7 0 0 1 14 0" />,
  gear: <path d="M12 9.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zm8-1.2-1.8-.6a6.6 6.6 0 0 0-.5-1.3l.9-1.7-1.7-1.7-1.7.9c-.4-.2-.8-.4-1.3-.5L13.3 1h-2.6l-.6 1.8c-.5.1-.9.3-1.3.5l-1.7-.9-1.7 1.7.9 1.7c-.2.4-.4.8-.5 1.3L4 8.3v2.6l1.8.6c.1.5.3.9.5 1.3l-.9 1.7 1.7 1.7 1.7-.9c.4.2.8.4 1.3.5l.6 1.8h2.6l.6-1.8c.5-.1.9-.3 1.3-.5l1.7.9 1.7-1.7-.9-1.7c.2-.4.4-.8.5-1.3l1.8-.6V8.3z" />,
  search: <path d="M10.5 4a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13zm5 11.5L20 20" />,
  grid: <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" />,
};

function Icon({ d, className = "h-5 w-5" }: { d: keyof typeof I; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      {I[d]}
    </svg>
  );
}

function Shell() {
  const { t, lang, setLang, view, nav, settings, updateSettings, online, searchOpen, setSearchOpen, profile } = useApp();

  const navItems: { key: string; icon: keyof typeof I; v: View }[] = [
    { key: "nav.home", icon: "home", v: { name: "home" } },
    { key: "nav.map", icon: "globe", v: { name: "map" } },
    { key: "nav.countries", icon: "book", v: { name: "countries" } },
    { key: "nav.collection", icon: "grid", v: { name: "collection" } },
    { key: "nav.board", icon: "trophy", v: { name: "board" } },
    { key: "nav.profile", icon: "user", v: { name: "profile" } },
  ];

  const activeKey = view.name === "home" ? "nav.home" : view.name === "library" ? "nav.countries" : view.name === "countries" ? "nav.countries" : view.name === "map" ? "nav.map" : view.name === "collection" ? "nav.collection" : view.name === "board" ? "nav.board" : view.name === "profile" ? "nav.profile" : view.name === "settings" ? "nav.settings" : "";

  return (
    <div className="ambient min-h-screen">
      {/* ── Top bar ── */}
      <header className="sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-2.5">
          <button onClick={() => nav({ name: "home" })} className="flex items-center gap-2" aria-label="FoodGuess">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-saffron text-lg shadow-[0_4px_14px_-4px_rgba(242,168,59,0.7)]" aria-hidden>🍽️</span>
            <span className="font-display text-lg font-extrabold tracking-tight">
              Guess <span className="text-saffron">Your Food</span>
            </span>
            <span className="chip hidden px-2 py-0.5 text-[9px] font-extrabold text-muted md:block">LVL {levelFromXp(profile.xp)}</span>
          </button>

          <div className="ms-auto flex items-center gap-1.5">
            <button onClick={() => setSearchOpen(true)} className="flex items-center gap-2 rounded-lg border border-line bg-panel2 px-3 py-2 text-xs font-bold text-muted transition-colors hover:border-saffron/50 hover:text-ink" aria-label={t("nav.search")}>
              <Icon d="search" className="h-4 w-4" />
              <span className="hidden sm:block">{t("nav.search")}</span>
            </button>
            <div className="flex overflow-hidden rounded-lg border border-line">
              {LANGS.map((l) => (
                <button
                  key={l.id}
                  onClick={() => { setLang(l.id as Lang); sfx.click(); }}
                  className={`px-2.5 py-2 text-[11px] font-extrabold transition-colors ${lang === l.id ? "bg-saffron text-[#241705]" : "bg-panel2 text-muted hover:text-ink"}`}
                  aria-label={l.label}
                >
                  {l.id === "en" ? "EN" : l.id === "fa" ? "فا" : "ع"}
                </button>
              ))}
            </div>
            <button
              onClick={() => updateSettings({ theme: settings.theme === "dark" ? "light" : "dark" })}
              className="rounded-lg border border-line bg-panel2 px-2.5 py-2 text-sm transition-colors hover:border-saffron/50"
              aria-label={t("set.theme")}
            >
              {settings.theme === "dark" ? "☀️" : "🌙"}
            </button>
            <button
              onClick={() => updateSettings({ sound: !settings.sound })}
              className="rounded-lg border border-line bg-panel2 px-2.5 py-2 text-sm transition-colors hover:border-saffron/50"
              aria-label={t("set.sound")}
            >
              {settings.sound ? "🔊" : "🔇"}
            </button>
            <button
              onClick={() => nav({ name: view.name === "settings" ? "home" : "settings" })}
              className={`rounded-lg border px-2.5 py-2 transition-colors ${view.name === "settings" ? "border-saffron bg-saffron/15 text-saffron" : "border-line bg-panel2 text-muted hover:text-ink"}`}
              aria-label={t("nav.settings")}
            >
              <Icon d="gear" className="h-4 w-4" />
            </button>
          </div>
        </div>
        {!online && (
          <div className="border-t border-line bg-pom/15 px-4 py-1.5 text-center text-xs font-bold text-pom">📡 {t("common.offline")}</div>
        )}
      </header>

      <div className="relative z-10 mx-auto flex max-w-6xl gap-6 px-4 pb-28 pt-6 lg:pb-10">
        {/* ── Sidebar (desktop) ── */}
        <nav className="sticky top-24 hidden h-fit w-44 shrink-0 flex-col gap-1 lg:flex" aria-label="Main">
          {navItems.map((n) => (
            <button
              key={n.key}
              onClick={() => { nav(n.v); sfx.click(); }}
              className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-bold transition-all ${activeKey === n.key ? "border-saffron/60 bg-saffron/10 text-saffron" : "border-transparent text-muted hover:bg-panel hover:text-ink"}`}
            >
              <Icon d={n.icon} className="h-[18px] w-[18px]" />
              {t(n.key)}
            </button>
          ))}
          <button
            onClick={() => { nav({ name: "admin" }); sfx.click(); }}
            className={`mt-4 flex items-center gap-3 rounded-xl border px-3 py-2.5 text-xs font-bold transition-all ${view.name === "admin" ? "border-saffron/60 bg-saffron/10 text-saffron" : "border-transparent text-muted/70 hover:bg-panel hover:text-ink"}`}
          >
            🛠 {t("nav.admin")}
          </button>
        </nav>

        {/* ── Main ── */}
        <main className="min-w-0 flex-1">
          {view.name === "home" && <Home />}
          {view.name === "game" && <Game key={JSON.stringify(view.config)} config={view.config} />}
          {view.name === "library" && <Library key={view.foodId ?? "lib"} initialFoodId={view.foodId} />}
          {view.name === "countries" && <Countries key={view.countryId ?? "cn"} countryId={view.countryId} />}
          {view.name === "map" && <WorldMap />}
          {view.name === "collection" && <Collection />}
          {view.name === "board" && <Board />}
          {view.name === "profile" && <Profile />}
          {view.name === "settings" && <Settings />}
          {view.name === "admin" && <Admin />}
        </main>
      </div>

      {/* ── Bottom nav (mobile) ── */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/92 backdrop-blur-md lg:hidden" aria-label="Main mobile">
        <div className="mx-auto grid max-w-md grid-cols-6">
          {navItems.map((n) => (
            <button
              key={n.key}
              onClick={() => { nav(n.v); sfx.click(); }}
              className={`flex flex-col items-center gap-0.5 py-2.5 text-[9px] font-extrabold ${activeKey === n.key ? "text-saffron" : "text-muted"}`}
            >
              <Icon d={n.icon} className="h-5 w-5" />
              {t(n.key)}
            </button>
          ))}
        </div>
      </nav>

      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}

function GlobalSearch({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t, lang, nav } = useApp();
  const [q, setQ] = useState("");
  const [ingFoods, setIngFoods] = useState<string | null>(null);

  const res = useMemo(() => searchAll(q, lang, 8), [q, lang]);
  const ingList = useMemo(() => (ingFoods ? searchIngredientFoods(ingFoods).slice(0, 8) : []), [ingFoods]);

  return (
    <Modal open={open} onClose={() => { onClose(); setQ(""); setIngFoods(null); }}>
      <div className="relative">
        <span aria-hidden className="pointer-events-none absolute inset-y-0 start-3 flex items-center text-muted">🔎</span>
        <input
          autoFocus
          value={q}
          onChange={(e) => { setQ(e.target.value); setIngFoods(null); }}
          placeholder={t("search.ph")}
          aria-label={t("nav.search")}
          className="w-full rounded-xl border border-line bg-panel2 py-3 pe-4 ps-10 text-sm font-semibold outline-none placeholder:text-muted/70 focus:border-saffron"
        />
      </div>

      {!q.trim() && (
        <div className="py-8 text-center text-sm text-muted">🍜 🌮 🍣 🥘 🍕</div>
      )}

      {ingFoods && (
        <div className="mt-4">
          <button onClick={() => setIngFoods(null)} className="mb-2 text-xs font-bold text-saffron hover:underline">← {ingredientLabel(ingFoods, lang)}</button>
          <div className="space-y-1.5">
            {ingList.map((f) => (
              <button key={f.id} onClick={() => { nav({ name: "library", foodId: f.id }); onClose(); setQ(""); setIngFoods(null); }} className="flex w-full items-center gap-3 rounded-lg border border-line bg-panel2 p-2 text-start hover:border-saffron/50">
                <span className="text-xl" aria-hidden>{f.emoji}</span>
                <span className="text-sm font-bold">{foodName(f, lang)}</span>
                <span className="ms-auto text-[11px] text-muted">{countryName(f.countryId, lang)}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {q.trim() && !ingFoods && (
        <div className="mt-4 max-h-[50vh] space-y-4 overflow-y-auto pe-1">
          {res.foods.length > 0 && (
            <div>
              <div className="mb-1.5 text-[10px] font-extrabold uppercase tracking-wider text-saffron">{t("search.foods")}</div>
              <div className="space-y-1.5">
                {res.foods.map((f) => (
                  <button key={f.id} onClick={() => { nav({ name: "library", foodId: f.id }); onClose(); setQ(""); }} className="flex w-full items-center gap-3 rounded-lg border border-line bg-panel2 p-2 text-start hover:border-saffron/50">
                    <span className="text-xl" aria-hidden>{f.emoji}</span>
                    <span className="min-w-0 flex-1 truncate text-sm font-bold">{foodName(f, lang)}</span>
                    <span className="text-[11px] text-muted">{countryName(f.countryId, lang)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          {res.countries.length > 0 && (
            <div>
              <div className="mb-1.5 text-[10px] font-extrabold uppercase tracking-wider text-saffron">{t("search.countries")}</div>
              <div className="space-y-1.5">
                {res.countries.map((c) => (
                  <button key={c.id} onClick={() => { nav({ name: "countries", countryId: c.id }); onClose(); setQ(""); }} className="flex w-full items-center gap-3 rounded-lg border border-line bg-panel2 p-2 text-start hover:border-saffron/50">
                    <span className="text-xl" aria-hidden>{c.flag}</span>
                    <span className="text-sm font-bold">{loc(c.name, lang)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          {res.ingredients.length > 0 && (
            <div>
              <div className="mb-1.5 text-[10px] font-extrabold uppercase tracking-wider text-saffron">{t("search.ingredients")}</div>
              <div className="flex flex-wrap gap-1.5">
                {res.ingredients.map((i) => (
                  <button key={i} onClick={() => setIngFoods(i)} className="chip px-3 py-1.5 text-xs font-bold text-ink hover:border-saffron hover:text-saffron">
                    🧂 {ingredientLabel(i, lang)}
                  </button>
                ))}
              </div>
            </div>
          )}
          {res.foods.length === 0 && res.countries.length === 0 && res.ingredients.length === 0 && (
            <p className="py-6 text-center text-sm text-muted">{t("search.noResults")}</p>
          )}
        </div>
      )}
    </Modal>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}
