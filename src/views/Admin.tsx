import { useMemo, useState } from "react";
import { useApp } from "../state/AppContext";
import {
  addCustomQuestion,
  countryName,
  deleteCustomQuestion,
  foodName,
  getAllFoods,
  getCountries,
  getImpossiblePool,
  getOverrides,
  getScoring,
  loc,
  saveOverrides,
} from "../data/store";
import { CATEGORIES } from "../data/lexicon";
import type { AllDifficulty, Difficulty, Food, Question } from "../data/types";
import { Btn, Modal, SectionTitle } from "../components/ui";
import { CONFIG, pointsFor } from "../game/engine";
import { sfx } from "../sound";

const PIN = "1234";

type Tab = "stats" | "foods" | "pool" | "scoring";

export default function Admin() {
  const { t, lang } = useApp();
  const [authed, setAuthed] = useState(false);
  const [pin, setPin] = useState("");
  const [err, setErr] = useState(false);
  const [tab, setTab] = useState<Tab>("stats");
  const [bump, setBump] = useState(0);
  const refresh = () => setBump((b) => b + 1);

  if (!authed) {
    return (
      <div className="card mx-auto max-w-sm p-8 text-center">
        <div className="text-5xl" aria-hidden>🔐</div>
        <h2 className="mt-3 font-display text-2xl font-bold">{t("adm.title")}</h2>
        <p className="mt-1 text-xs text-muted">{t("adm.hint")}</p>
        <input
          type="password"
          value={pin}
          onChange={(e) => { setPin(e.target.value); setErr(false); }}
          onKeyDown={(e) => e.key === "Enter" && (pin === PIN ? setAuthed(true) : setErr(true))}
          placeholder={t("adm.pin")}
          aria-label={t("adm.pin")}
          className={`mt-4 w-full rounded-xl border bg-panel2 px-4 py-3 text-center font-display text-2xl tracking-[0.5em] outline-none ${err ? "border-pom anim-shake" : "border-line focus:border-saffron"}`}
        />
        {err && <p className="mt-2 text-xs font-bold text-pom">{t("adm.wrong")}</p>}
        <Btn className="mt-4 w-full" onClick={() => (pin === PIN ? setAuthed(true) : setErr(true))}>{t("adm.title")}</Btn>
      </div>
    );
  }

  return (
    <div key={bump}>
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <SectionTitle kicker="🛠" title={t("adm.title")} />
        <Btn variant="ghost" size="sm" className="mb-4" onClick={() => setAuthed(false)}>{t("adm.logout")}</Btn>
      </div>
      <div className="mb-5 flex flex-wrap gap-1.5">
        {(["stats", "foods", "pool", "scoring"] as Tab[]).map((x) => (
          <button key={x} onClick={() => { setTab(x); sfx.click(); }} className={`chip px-4 py-2 text-xs font-extrabold ${tab === x ? "border-saffron text-saffron" : "text-muted"}`}>
            {t(`adm.${x}`)}
          </button>
        ))}
      </div>
      {tab === "stats" && <StatsTab />}
      {tab === "foods" && <FoodsTab onChanged={refresh} />}
      {tab === "pool" && <PoolTab onChanged={refresh} />}
      {tab === "scoring" && <ScoringTab onChanged={refresh} />}
    </div>
  );
}

function StatsTab() {
  const { t } = useApp();
  const foods = useMemo(() => getAllFoods(), []);
  const byDiff = (d: Difficulty) => foods.filter((f) => f.difficulty === d).length;
  const cells = [
    { l: t("home.foods"), v: foods.length, i: "🍽️" },
    { l: t("home.countriesCount"), v: getCountries().length, i: "🗺️" },
    { l: "🇮🇷 Iran", v: foods.filter((f) => f.countryId === "iran").length, i: "🏺" },
    { l: t("diff.impossible"), v: getImpossiblePool().length, i: "💀" },
    { l: t("diff.easy"), v: byDiff("easy"), i: "🌱" },
    { l: t("diff.medium"), v: byDiff("medium"), i: "🌶️" },
    { l: t("diff.hard"), v: byDiff("hard"), i: "🔥" },
    { l: t("diff.extreme"), v: byDiff("extreme"), i: "💥" },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cells.map((c) => (
        <div key={c.l} className="card p-4 text-center">
          <div className="text-2xl" aria-hidden>{c.i}</div>
          <div className="mt-1 font-display text-2xl font-extrabold">{c.v}</div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted">{c.l}</div>
        </div>
      ))}
    </div>
  );
}

interface FoodForm {
  id: string | null;
  en: string; fa: string; ar: string;
  emoji: string;
  countryId: string;
  difficulty: Difficulty;
  ingredients: string;
  categories: string;
  desc: string;
}

function FoodsTab({ onChanged }: { onChanged: () => void }) {
  const { t, lang } = useApp();
  const [q, setQ] = useState("");
  const [form, setForm] = useState<FoodForm | null>(null);
  const [confirmDel, setConfirmDel] = useState<Food | null>(null);
  const foods = useMemo(() => getAllFoods(), []);
  const countries = useMemo(() => getCountries(), []);

  const filtered = foods.filter((f) => {
    const nq = q.trim().toLowerCase();
    return !nq || `${f.name.en} ${f.name.fa ?? ""} ${f.id}`.toLowerCase().includes(nq);
  });

  const openEdit = (f?: Food) => {
    setForm(
      f
        ? { id: f.id, en: f.name.en, fa: f.name.fa ?? "", ar: f.name.ar ?? "", emoji: f.emoji, countryId: f.countryId, difficulty: f.difficulty, ingredients: f.ingredients.join(", "), categories: f.categories.join(", "), desc: f.desc.en }
        : { id: null, en: "", fa: "", ar: "", emoji: "🍲", countryId: "iran", difficulty: "medium", ingredients: "", categories: "traditional", desc: "" }
    );
  };

  const save = () => {
    if (!form || !form.en.trim()) return;
    const o = getOverrides();
    const ingredients = form.ingredients.split(",").map((s) => s.trim()).filter(Boolean);
    const categories = form.categories.split(",").map((s) => s.trim()).filter((c) => CATEGORIES[c] !== undefined);
    const patch: Partial<Food> = {
      name: { en: form.en.trim(), fa: form.fa.trim() || undefined, ar: form.ar.trim() || undefined },
      emoji: form.emoji || "🍲",
      difficulty: form.difficulty,
      ingredients: ingredients.length ? ingredients : ["Salt"],
      categories: categories.length ? categories : ["traditional"],
      desc: { en: form.desc || `A ${form.difficulty} dish from ${form.countryId}.` },
    };
    if (form.id && !form.id.startsWith("cf_")) {
      saveOverrides({ ...o, editedFoods: { ...o.editedFoods, [form.id]: patch } });
    } else if (form.id) {
      saveOverrides({ ...o, customFoods: o.customFoods.map((f) => (f.id === form.id ? { ...f, ...patch } : f)) });
    } else {
      const nf: Food = {
        id: `cf_${Date.now()}`,
        name: patch.name!,
        countryId: form.countryId,
        categories: patch.categories!,
        ingredients: patch.ingredients!,
        meat: [],
        veg: true,
        vegan: true,
        spice: 0,
        difficulty: patch.difficulty!,
        emoji: patch.emoji!,
        desc: patch.desc!,
      };
      saveOverrides({ ...o, customFoods: [...o.customFoods, nf] });
    }
    setForm(null);
    onChanged();
    sfx.correct();
  };

  const del = (f: Food) => {
    const o = getOverrides();
    if (f.id.startsWith("cf_")) saveOverrides({ ...o, customFoods: o.customFoods.filter((x) => x.id !== f.id) });
    else saveOverrides({ ...o, deletedFoods: [...o.deletedFoods, f.id] });
    setConfirmDel(null);
    onChanged();
  };

  const input = "w-full rounded-lg border border-line bg-panel2 px-3 py-2 text-sm font-semibold outline-none focus:border-saffron";

  return (
    <div className="card p-4">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("adm.searchPh")} className={`${input} max-w-xs`} />
        <span className="text-xs font-bold text-muted">{filtered.length}</span>
        <Btn size="sm" className="ms-auto" onClick={() => openEdit()}>+ {t("adm.add")}</Btn>
      </div>
      <div className="max-h-[480px] divide-y divide-[var(--line)] overflow-y-auto">
        {filtered.slice(0, 200).map((f) => (
          <div key={f.id} className="flex items-center gap-3 py-2">
            <span className="text-xl" aria-hidden>{f.emoji}</span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-bold">{foodName(f, lang)} <span className="text-[10px] font-semibold text-muted">({f.name.en})</span></div>
              <div className="text-[11px] text-muted">{countryName(f.countryId, lang)} · {t(`diff.${f.difficulty}`)}</div>
            </div>
            <Btn variant="ghost" size="sm" onClick={() => openEdit(f)}>{t("adm.edit")}</Btn>
            <Btn variant="danger" size="sm" onClick={() => setConfirmDel(f)}>{t("adm.delete")}</Btn>
          </div>
        ))}
      </div>

      <Modal open={!!form} onClose={() => setForm(null)} wide>
        {form && (
          <div>
            <h3 className="mb-4 font-display text-xl font-bold">{form.id ? t("adm.edit") : t("adm.add")} 🍽️</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-xs font-bold">{t("adm.name")}<input className={`${input} mt-1`} value={form.en} onChange={(e) => setForm({ ...form, en: e.target.value })} /></label>
              <label className="text-xs font-bold">{t("adm.nameFa")}<input className={`${input} mt-1`} dir="rtl" value={form.fa} onChange={(e) => setForm({ ...form, fa: e.target.value })} /></label>
              <label className="text-xs font-bold">{t("adm.nameAr")}<input className={`${input} mt-1`} dir="rtl" value={form.ar} onChange={(e) => setForm({ ...form, ar: e.target.value })} /></label>
              <label className="text-xs font-bold">Emoji<input className={`${input} mt-1`} value={form.emoji} onChange={(e) => setForm({ ...form, emoji: e.target.value })} /></label>
              <label className="text-xs font-bold">{t("lib.country")}
                <select className={`${input} mt-1`} value={form.countryId} onChange={(e) => setForm({ ...form, countryId: e.target.value })}>
                  {countries.map((c) => <option key={c.id} value={c.id}>{c.flag} {loc(c.name, lang)}</option>)}
                </select>
              </label>
              <label className="text-xs font-bold">{t("lib.difficulty")}
                <select className={`${input} mt-1`} value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value as Difficulty })}>
                  {(["easy", "medium", "hard", "extreme"] as Difficulty[]).map((d) => <option key={d} value={d}>{t(`diff.${d}`)}</option>)}
                </select>
              </label>
              <label className="text-xs font-bold sm:col-span-2">{t("lib.ingredients")} (CSV)<input className={`${input} mt-1`} value={form.ingredients} onChange={(e) => setForm({ ...form, ingredients: e.target.value })} /></label>
              <label className="text-xs font-bold sm:col-span-2">{t("lib.category")} (keys: stew, rice, kabab…)<input className={`${input} mt-1`} value={form.categories} onChange={(e) => setForm({ ...form, categories: e.target.value })} /></label>
              <label className="text-xs font-bold sm:col-span-2">Description (EN)<textarea className={`${input} mt-1`} rows={2} value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} /></label>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Btn variant="ghost" onClick={() => setForm(null)}>{t("adm.cancel")}</Btn>
              <Btn onClick={save}>{t("adm.save")}</Btn>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={!!confirmDel} onClose={() => setConfirmDel(null)}>
        <div className="text-center">
          <div className="text-4xl" aria-hidden>🗑️</div>
          <p className="mt-3 font-bold">{t("adm.confirmDel")} {confirmDel && foodName(confirmDel, lang)}</p>
          <div className="mt-5 flex justify-center gap-2">
            <Btn variant="danger" onClick={() => confirmDel && del(confirmDel)}>{t("adm.delete")}</Btn>
            <Btn variant="ghost" onClick={() => setConfirmDel(null)}>{t("adm.cancel")}</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function PoolTab({ onChanged }: { onChanged: () => void }) {
  const { t, lang } = useApp();
  const [adding, setAdding] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [opts, setOpts] = useState(["", "", "", ""]);
  const [correct, setCorrect] = useState(0);
  const pool = useMemo(() => getImpossiblePool(), []);
  const input = "w-full rounded-lg border border-line bg-panel2 px-3 py-2 text-sm font-semibold outline-none focus:border-saffron";

  const save = () => {
    if (!prompt.trim() || opts.some((o) => !o.trim())) return;
    addCustomQuestion({
      key: `cq_${Date.now()}`,
      type: "custom",
      prompt: { en: prompt.trim() },
      options: opts.map((o) => ({ en: o.trim() })),
      correct,
      difficulty: "impossible",
      showEmoji: false,
    });
    setAdding(false);
    setPrompt("");
    setOpts(["", "", "", ""]);
    onChanged();
    sfx.correct();
  };

  return (
    <div className="card p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-xs font-bold text-muted">💀 {pool.length}</span>
        <Btn size="sm" className="ms-auto" onClick={() => setAdding(true)}>+ {t("adm.add")}</Btn>
      </div>
      <div className="max-h-[480px] divide-y divide-[var(--line)] overflow-y-auto">
        {pool.map((qq) => (
          <div key={qq.key} className="py-2.5">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-bold">{loc(qq.prompt, lang)}</p>
              {qq.key.startsWith("cq_") && (
                <Btn variant="danger" size="sm" onClick={() => { deleteCustomQuestion(qq.key); onChanged(); }}>{t("adm.delete")}</Btn>
              )}
            </div>
            <div className="mt-1 flex flex-wrap gap-1">
              {qq.options.map((o, i) => (
                <span key={i} className={`rounded-md border px-2 py-0.5 text-[11px] font-semibold ${i === qq.correct ? "border-pist text-pist" : "border-line text-muted"}`}>{loc(o, lang)}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <Modal open={adding} onClose={() => setAdding(false)}>
        <h3 className="mb-4 font-display text-xl font-bold">💀 {t("adm.add")}</h3>
        <label className="text-xs font-bold">{t("adm.prompt")}<input className={`${input} mt-1`} value={prompt} onChange={(e) => setPrompt(e.target.value)} /></label>
        <div className="mt-3 space-y-2">
          {[0, 1, 2, 3].map((i) => (
            <label key={i} className="flex items-center gap-2 text-xs font-bold">
              <input type="radio" name="correct" checked={correct === i} onChange={() => setCorrect(i)} aria-label={t("adm.correctOpt")} />
              <input className={input} placeholder={t("adm.option", { n: i + 1 })} value={opts[i]} onChange={(e) => setOpts(opts.map((o, j) => (j === i ? e.target.value : o)))} />
            </label>
          ))}
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Btn variant="ghost" onClick={() => setAdding(false)}>{t("adm.cancel")}</Btn>
          <Btn onClick={save}>{t("adm.save")}</Btn>
        </div>
      </Modal>
    </div>
  );
}

function ScoringTab({ onChanged }: { onChanged: () => void }) {
  const { t } = useApp();
  const [vals, setVals] = useState<Record<AllDifficulty, number>>({
    easy: pointsFor("easy"),
    medium: pointsFor("medium"),
    hard: pointsFor("hard"),
    extreme: pointsFor("extreme"),
    impossible: pointsFor("impossible"),
  });
  const save = () => {
    saveOverrides({ ...getOverrides(), scoring: { ...getScoring(), ...vals } });
    onChanged();
    sfx.correct();
  };
  return (
    <div className="card max-w-md p-5">
      <h3 className="mb-1 font-display text-lg font-bold">⚖️ {t("adm.basePoints")}</h3>
      <p className="mb-4 text-[11px] text-muted">{t("board.note")}</p>
      <div className="space-y-2">
        {(Object.keys(vals) as AllDifficulty[]).map((d) => (
          <label key={d} className="flex items-center justify-between gap-3 text-sm font-bold">
            {t(`diff.${d}`)}
            <input
              type="number"
              value={vals[d]}
              min={10}
              step={10}
              onChange={(e) => setVals({ ...vals, [d]: Math.max(10, Number(e.target.value) || 10) })}
              className="w-24 rounded-lg border border-line bg-panel2 px-3 py-2 text-end font-display font-extrabold outline-none focus:border-saffron"
            />
          </label>
        ))}
      </div>
      <div className="mt-4 text-xs font-bold text-muted">
        {t("game.combo")}: {CONFIG.comboTiers.slice().reverse().map((c) => `${c.at}+ → ×${c.mult}`).join(" · ")}
      </div>
      <Btn className="mt-5 w-full" onClick={save}>{t("adm.save")}</Btn>
    </div>
  );
}
