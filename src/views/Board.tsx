import { useMemo, useState } from "react";
import { useApp } from "../state/AppContext";
import { getCountries, countryName, loc } from "../data/store";
import { levelFromXp, mulberry32 } from "../game/engine";
import { SectionTitle } from "../components/ui";

type Tab = "global" | "daily" | "weekly" | "monthly" | "country";

const NAMES = [
  "SaffronSultan", "TahdigHunter", "GhormehGuru", "UmamiYuki", "PastaPia", "TacoTornado", "CurryNinja", "MezzeMaster",
  "BorschtBella", "KimchiKing", "FalafelFox", "RamenRider", "SushiSana", "PierogiPiotr", "HarissaHana", "BaoBoss",
  "DolmaDina", "KebabKai", "MoleMarco", "InjeraIda", "PaellaPau", "BibimbapBo", "SashimiSol", "GoulashGreta",
  "ZereshkZara", "PhoFinn", "MasalaMira", "CevicheCiro", "BaguetteBea", "ShawarmaShay",
];

interface Row {
  name: string;
  flag: string;
  countryId: string;
  score: number;
  level: number;
  streak: number;
  correct: number;
  you?: boolean;
}

function genBots(tab: Tab, count: number): Row[] {
  const seedBase = { global: 11, daily: 22, weekly: 33, monthly: 44, country: 55 }[tab];
  const rng = mulberry32(seedBase * 1000 + new Date().getDate());
  const countries = getCountries();
  const scale = { global: 9, daily: 2, weekly: 5, monthly: 7, country: 3 }[tab];
  return Array.from({ length: count }, (_, i) => {
    const c = countries[Math.floor(rng() * countries.length)];
    const score = Math.round((14000 - i * 420 + rng() * 300) * (scale / 4));
    return {
      name: NAMES[(i * 7 + Math.floor(rng() * 5)) % NAMES.length],
      flag: c.flag,
      countryId: c.id,
      score,
      level: Math.max(2, Math.round(score / 2400)),
      streak: Math.floor(rng() * 30) + 4,
      correct: Math.floor(rng() * 300) + 40,
    };
  });
}

export default function Board() {
  const { t, lang, profile } = useApp();
  const [tab, setTab] = useState<Tab>("global");
  const [countryId, setCountryId] = useState("iran");

  const rows = useMemo<Row[]>(() => {
    const bots = genBots(tab, 20);
    let yourScore = 0;
    if (tab === "global") yourScore = profile.bestGameScore;
    else if (tab === "daily") {
      const today = new Date().toISOString().slice(0, 10);
      yourScore = profile.history.find((h) => h.mode === "daily" && h.date.startsWith(today))?.score ?? 0;
    } else {
      const days = tab === "weekly" ? 7 : 30;
      const since = Date.now() - days * 86400000;
      yourScore = profile.history.filter((h) => new Date(h.date).getTime() >= since).reduce((m, h) => Math.max(m, h.score), 0);
    }
    const you: Row = {
      name: profile.name,
      flag: countryId ? getCountries().find((c) => c.id === (profile.byCountry && Object.keys(profile.byCountry).sort((a, b) => profile.byCountry[b] - profile.byCountry[a])[0]))?.flag ?? "🏳️" : "🏳️",
      countryId: Object.keys(profile.byCountry).sort((a, b) => (profile.byCountry[b] ?? 0) - (profile.byCountry[a] ?? 0))[0] ?? "iran",
      score: yourScore,
      level: levelFromXp(profile.xp),
      streak: profile.bestStreak,
      correct: profile.correct,
      you: true,
    };
    const all = [...bots, ...(yourScore > 0 ? [you] : [])].sort((a, b) => b.score - a.score);
    if (tab === "country") return all.filter((r) => r.you || r.countryId === countryId);
    return all;
  }, [tab, profile, countryId]);

  const tabs: { id: Tab; label: string }[] = [
    { id: "global", label: t("board.global") },
    { id: "daily", label: t("board.daily") },
    { id: "weekly", label: t("board.weekly") },
    { id: "monthly", label: t("board.monthly") },
    { id: "country", label: t("board.countryTab") },
  ];

  return (
    <div>
      <SectionTitle kicker="TOP 50" title={t("board.title")} />
      <div className="card overflow-hidden">
        <div className="flex flex-wrap gap-1 border-b border-line bg-panel2/50 p-2">
          {tabs.map((x) => (
            <button key={x.id} onClick={() => setTab(x.id)} className={`rounded-lg px-4 py-2 text-xs font-extrabold transition-colors ${tab === x.id ? "bg-saffron text-[#241705]" : "text-muted hover:text-ink"}`}>
              {x.label}
            </button>
          ))}
        </div>

        {tab === "country" && (
          <div className="flex flex-wrap gap-1.5 border-b border-line p-3">
            {getCountries().slice(0, 16).map((c) => (
              <button key={c.id} onClick={() => setCountryId(c.id)} className={`chip px-2.5 py-1 text-xs font-bold ${countryId === c.id ? "border-saffron text-saffron" : "text-muted"}`}>
                {c.flag} {countryName(c.id, lang)}
              </button>
            ))}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-line text-[10px] uppercase tracking-wider text-muted">
                <th className="px-4 py-3 text-start font-extrabold">{t("board.rank")}</th>
                <th className="px-4 py-3 text-start font-extrabold">{t("board.player")}</th>
                <th className="px-4 py-3 text-end font-extrabold">{t("board.score")}</th>
                <th className="px-4 py-3 text-end font-extrabold">{t("board.level")}</th>
                <th className="px-4 py-3 text-end font-extrabold">⚡ {t("board.streak")}</th>
                <th className="hidden px-4 py-3 text-end font-extrabold sm:table-cell">✓ {t("board.player") === "" ? "" : t("prof.correct")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={`${r.name}-${i}`} className={`border-b border-line/60 transition-colors ${r.you ? "bg-saffron/10" : "hover:bg-panel2/40"}`}>
                  <td className="px-4 py-2.5 font-display font-extrabold">
                    <span className={i === 0 ? "text-saffron" : i === 1 ? "text-muted" : i === 2 ? "text-[#cd8b4a]" : "text-muted"}>
                      {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2 font-bold">
                      <span aria-hidden>{r.flag}</span>
                      {r.name}
                      {r.you && <span className="chip px-2 py-0.5 text-[9px] font-extrabold text-saffron">{t("board.you")}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-end font-display font-extrabold text-saffron">{r.score.toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-end font-bold">{r.level}</td>
                  <td className="px-4 py-2.5 text-end font-bold">{r.streak}</td>
                  <td className="hidden px-4 py-2.5 text-end font-bold text-muted sm:table-cell">{r.correct}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="border-t border-line px-4 py-3 text-[11px] text-muted">🔐 {t("board.note")}</p>
      </div>
    </div>
  );
}
