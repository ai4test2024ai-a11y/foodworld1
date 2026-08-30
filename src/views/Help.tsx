import type { ReactNode } from "react";
import { useApp } from "../state/AppContext";
import { sfx } from "../sound";

/* ── tiny atoms ── */

const Key = ({ k }: { k: string }) => (
  <kbd className="inline-flex min-w-8 items-center justify-center rounded-md border border-line2 bg-panel2 px-2 py-1 font-display text-xs font-bold shadow-[0_2px_0_var(--line2)]">
    {k}
  </kbd>
);

function Section({ id, icon, title, children }: { id: string; icon: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="card scroll-mt-36 p-5 sm:p-6">
      <h2 className="mb-3 flex items-center gap-2.5 font-display font-extrabold" style={{ fontSize: "clamp(1.15rem, 1rem + 1vw, 1.5rem)" }}>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-saffron/12 text-xl" aria-hidden>{icon}</span>
        {title}
      </h2>
      <div className="text-sm leading-7 text-muted">{children}</div>
    </section>
  );
}

const LOOP = [
  { i: "🍴", t: "کشف غذا" },
  { i: "❓", t: "حدس زدن" },
  { i: "🏙️", t: "کشف شهر" },
  { i: "🌍", t: "کشف کشور" },
  { i: "📚", t: "یادگیری" },
  { i: "⭐", t: "XP و سکه" },
  { i: "🔓", t: "باز شدن غذاها" },
  { i: "✅", t: "تکمیل شهر" },
  { i: "🏆", t: "تکمیل کشور" },
  { i: "🌎", t: "تکمیل جهان" },
];

const MODES = [
  { i: "🌍", t: "کلاسیک", d: "۱۵ سؤال و ۳ جان؛ تجربهٔ کامل بازی." },
  { i: "⏱️", t: "حمله زمانی", d: "۶۰ ثانیه وقت داری؛ هر چه سریع‌تر جواب بدهی امتیاز بیشتری می‌گیری." },
  { i: "♾️", t: "بی‌پایان", d: "بازی ادامه دارد تا جان‌هایت تمام شود؛ سختی کم‌کم بالا می‌رود." },
  { i: "🏆", t: "چالش کشوری", d: "فقط غذاهای یک کشور؛ مثلاً ایران، ژاپن یا ایتالیا." },
  { i: "🌐", t: "چالش جهانی", d: "غذاهایی از همهٔ کشورهای دنیا." },
  { i: "🏙️", t: "کوییز شهری", d: "حدس بزن هر غذا با کدام شهر مرتبط است؛ مثلاً بریانی ← اصفهان." },
  { i: "⚡", t: "حالت سرعتی", d: "جواب‌های سریع پاداش سرعت می‌گیرند." },
  { i: "💀", t: "هاردکور", d: "فقط غذاهای بسیار سخت و فقط ۱ جان!" },
  { i: "🇮🇷", t: "سفر غذایی ایران", d: "سفر شهر به شهر در آشپزی ایرانی؛ از کوفتهٔ تبریز تا فالودهٔ شیراز." },
  { i: "🧭", t: "زنجیرهٔ جغرافیا", d: "غذا ← شهر ← کشور ← منطقه؛ کل مسیر را با هم یاد بگیر." },
  { i: "📅", t: "چالش روزانه", d: "هر روز ۱۰ سؤال که در همهٔ دنیا یکسان است؛ با تقویم شمسی و میلادی." },
];

const SCORES = [
  { t: "آسان", v: "۱۰۰", c: "var(--pist)" },
  { t: "متوسط", v: "۲۰۰", c: "var(--saffron)" },
  { t: "سخت", v: "۴۰۰", c: "#e08a3c" },
  { t: "خیلی سخت", v: "۸۰۰", c: "var(--pom)" },
  { t: "غیرممکن", v: "۱٬۵۰۰", c: "#b07ce8" },
];

const RARITIES = [
  { t: "رایج", c: "var(--muted)" },
  { t: "غیررایج", c: "var(--teal)" },
  { t: "کمیاب", c: "#6aa8e8" },
  { t: "حماسی", c: "#b07ce8" },
  { t: "افسانه‌ای", c: "var(--saffron)" },
  { t: "اسطوره‌ای", c: "var(--pom)" },
];

const STEPS = [
  { n: "۱", t: "یک حالت بازی انتخاب کن", d: "از صفحهٔ خانه یکی از حالت‌ها را بزن؛ مثلاً «کلاسیک» یا «سفر غذایی ایران»." },
  { n: "۲", t: "سؤال را بخوان", d: "عکس/ایموجی غذا، مواد تشکیل‌دهنده یا توضیحات را می‌بینی." },
  { n: "۳", t: "از ۴ گزینه جواب درست را انتخاب کن", d: "با کلیک/لمس، یا با کلیدهای ۱ تا ۴ روی کیبورد." },
  { n: "۴", t: "بازخورد فوری بگیر", d: "اگر درست باشد امتیاز و کمبو می‌گیری؛ اگر اشتباه باشد یک جان از دست می‌دهی و جواب درست نشان داده می‌شود." },
  { n: "۵", t: "کارت اطلاعات غذا را ببین", d: "کشور، شهر، مواد اولیه، دسته‌بندی و یک دانستنی جالب دربارهٔ غذا." },
  { n: "۶", t: "ادامه بده", d: "با Enter یا Space یا دکمهٔ بعدی، به سؤال بعدی برو تا بازی تمام شود." },
];

const FAQ = [
  { q: "اگر جواب اشتباه بدهم چه می‌شود؟", a: "یک جان (❤️) از دست می‌دهی، کمبو صفر می‌شود و جواب درست با توضیح نشان داده می‌شود. وقتی هر ۳ جان تمام شود، بازی تمام می‌شود و نتیجه‌ات را می‌بینی." },
  { q: "چطور حالت‌های سخت‌تر باز می‌شوند؟", a: "با کسب XP سطح (Level) بالا می‌روی: متوسط از سطح ۲، سخت از سطح ۴، خیلی سخت از سطح ۷ و حالت غیرممکن از سطح ۱۰ باز می‌شود." },
  { q: "کمبو و استریک چه فرقی دارند؟", a: "کمبو ضریب امتیاز است: ۳ جواب درست پیاپی ×۲، ۵ تا ×۳ و ۱۰ تا ×۵. استریک یعنی چند جواب درست پشت سر هم داده‌ای و در پروفایل و دستاوردها ثبت می‌شود." },
  { q: "چالش روزانه چطور کار می‌کند؟", a: "هر روز ۱۰ سؤال ثابت برای همهٔ بازیکن‌های دنیا ساخته می‌شود (بر اساس تاریخ). تاریخ هم به میلادی و هم به شمسی نمایش داده می‌شود؛ مثلاً ۱۴۰۵/۰۶/۰۴." },
  { q: "آیا برای بازی به اینترنت نیاز دارم؟", a: "نه. همهٔ داده‌های بازی (غذاها، کشورها، سؤال‌ها) داخل خود برنامه است و آفلاین هم می‌توانی بازی کنی. فقط فونت‌ها و تصویر صفحهٔ خانه از اینترنت بارگذاری می‌شوند." },
  { q: "پیشرفتم کجا ذخیره می‌شود؟", a: "به‌صورت خودکار در مرورگر خودت (LocalStorage). با رفرش کردن صفحه چیزی پاک نمی‌شود؛ اما اگر از حالت incognito استفاده کنی یا داده‌های مرورگر را پاک کنی، پیشرفت هم پاک می‌شود." },
  { q: "چطور پیشرفتم را از اول شروع کنم؟", a: "به تنظیمات برو و دکمهٔ «بازنشانی» را بزن." },
];

export default function Help() {
  const { nav } = useApp();

  return (
    <div dir="rtl" className="mx-auto max-w-3xl">
      {/* ── header ── */}
      <section className="card relative mb-5 overflow-hidden">
        <div aria-hidden className="absolute -top-20 -start-10 h-52 w-52 rounded-full bg-teal/10 blur-3xl" />
        <div aria-hidden className="absolute -bottom-24 -end-10 h-52 w-52 rounded-full bg-saffron/10 blur-3xl" />
        <div className="relative p-6 text-center sm:p-8">
          <div className="text-[11px] font-extrabold uppercase tracking-[0.3em] text-teal">GAME GUIDE · HOW TO PLAY</div>
          <h1 className="mt-2 font-display font-extrabold" style={{ fontSize: "clamp(1.8rem, 1.4rem + 2.5vw, 2.75rem)" }}>
            راهنمای بازی <span className="text-saffron">Guess Your Food</span> ❔
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-muted sm:text-base">
            هر چیزی که برای شروع لازم داری: بازی چیست، چطور بازی می‌شود، چه ورودی‌هایی دارد و چه چیزهایی به دست می‌آوری.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2 text-[11px] font-extrabold">
            <span className="chip px-3 py-1.5">🍽️ +۵۵۰ غذای واقعی</span>
            <span className="chip px-3 py-1.5">🌍 ۱۱۴ کشور</span>
            <span className="chip px-3 py-1.5">🏙️ +۱۳۰ شهر</span>
            <span className="chip px-3 py-1.5">🎮 ۱۱ حالت بازی</span>
            <span className="chip px-3 py-1.5">🗣️ فارسی · English · العربية</span>
          </div>
        </div>
      </section>

      {/* ── mini TOC ── */}
      <nav aria-label="فهرست راهنما" className="mb-5 flex flex-wrap justify-center gap-1.5">
        {[
          ["#what", "بازی چیست"],
          ["#goal", "هدف"],
          ["#how", "روش بازی"],
          ["#modes", "حالت‌ها"],
          ["#score", "امتیازها"],
          ["#rewards", "خروجی‌ها"],
          ["#keys", "کیبورد"],
          ["#faq", "سوالات"],
        ].map(([href, label]) => (
          <a key={href} href={href} onClick={() => sfx.click()} className="chip px-3 py-1.5 text-xs font-bold text-muted transition-colors hover:border-saffron hover:text-saffron">
            {label}
          </a>
        ))}
      </nav>

      <div className="space-y-5">
        {/* ── 1. what ── */}
        <Section id="what" icon="🍽️" title="این بازی چیست؟">
          <p>
            <strong className="text-ink">Guess Your Food</strong> یک بازی کشف و حدس غذاهای جهان است. تو در نقش یک جهانگردِ خوش‌خوراک، شهر به شهر و کشور به کشور سفر می‌کنی، غذاهای واقعی هر منطقه را می‌شناسی، دربارهٔ مواد اولیه و فرهنگشان یاد می‌گیری و با جواب دادن به سؤال‌ها، آن‌ها را به کلکسیون‌ات اضافه می‌کنی.
          </p>
          {/* gameplay loop */}
          <div className="mt-4 rounded-xl border border-line bg-panel2 p-4">
            <div className="mb-2.5 text-center text-[10px] font-extrabold uppercase tracking-[0.2em] text-saffron">🔁 چرخهٔ اصلی بازی</div>
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              {LOOP.map((s, i) => (
                <span key={s.t} className="flex items-center gap-1.5">
                  <span className="chip flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-bold text-ink transition-colors hover:border-saffron">
                    <span aria-hidden>{s.i}</span> {s.t}
                  </span>
                  {i < LOOP.length - 1 && <span aria-hidden className="text-saffron">←</span>}
                </span>
              ))}
            </div>
          </div>
        </Section>

        {/* ── 2. goal ── */}
        <Section id="goal" icon="🎯" title="هدف بازی">
          <ul className="space-y-2.5">
            {[
              ["🌎", "تکمیل کلکسیون غذاهای جهان؛ از غذاهای خیابانی تا غذاهای افسانه‌ای و اسطوره‌ای."],
              ["🏆", "رساندن تکمیل هر کشور به ۱۰۰٪؛ غذا به غذا، شهر به شهر."],
              ["🧭", "یادگیری جغرافیای غذا: هر غذا از کدام شهر، کدام کشور و کدام منطقهٔ دنیاست."],
              ["📚", "آشنایی با فرهنگ غذایی کشورها؛ مواد اولیه، دستور پخت و دانستنی‌های واقعی."],
              ["🔥", "رکورد زدن: طولانی‌ترین استریک، بزرگ‌ترین کمبو و بالاترین امتیاز در جدول رده‌بندی."],
            ].map(([i, txt]) => (
              <li key={txt} className="flex items-start gap-3">
                <span className="mt-0.5 text-lg" aria-hidden>{i}</span>
                <span>{txt}</span>
              </li>
            ))}
          </ul>
        </Section>

        {/* ── 3. how to play ── */}
        <Section id="how" title="چطور بازی کنیم؟ (ورودی‌ها)" icon="🕹️">
          <p className="mb-4">
            ورودی‌های بازی همان کارهایی است که انجام می‌دهی: انتخاب حالت و سختی، لمس/کلیک روی گزینه‌ها (یا کلیدهای <Key k="۱" /> تا <Key k="۴" />)، جست‌وجو و فیلتر در کتابخانهٔ غذاها، و تغییر زبان و تنظیمات.
          </p>
          <ol className="space-y-3">
            {STEPS.map((s) => (
              <li key={s.n} className="flex items-start gap-3 rounded-xl border border-line bg-panel2 p-3.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-saffron font-display text-base font-extrabold text-[#241705]">{s.n}</span>
                <span>
                  <span className="block text-sm font-extrabold text-ink">{s.t}</span>
                  <span className="block text-[13px] leading-6 text-muted">{s.d}</span>
                </span>
              </li>
            ))}
          </ol>
          <p className="mt-4 rounded-xl border border-teal/30 bg-teal/5 p-3.5 text-[13px] leading-6">
            💡 بعد از هر جواب، <strong className="text-ink">کارت اطلاعات غذا</strong> نشان داده می‌شود: کشور، شهر، مواد اولیه، تندی، دسته‌بندی و یک دانستنی. اگر غذا را درست حدس زده باشی، به‌صورت خودکار به <strong className="text-saffron">کلکسیون‌ات</strong> اضافه می‌شود و مواد اولیه‌اش هم کشف می‌شوند.
          </p>
        </Section>

        {/* ── 4. modes ── */}
        <Section id="modes" icon="🎮" title="حالت‌های بازی">
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {MODES.map((m) => (
              <div key={m.t} className="rounded-xl border border-line bg-panel2 p-3.5 transition-all hover:-translate-y-0.5 hover:border-saffron/50">
                <div className="flex items-center gap-2 font-extrabold text-ink">
                  <span aria-hidden className="text-xl">{m.i}</span> {m.t}
                </div>
                <div className="mt-1 text-[13px] leading-6">{m.d}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* ── 5. difficulty & scoring ── */}
        <Section id="score" icon="💯" title="سختی، امتیاز و جان‌ها">
          <p className="mb-3">هر سؤال بر اساس سختی‌اش امتیاز پایه دارد و کمبو آن را چند برابر می‌کند:</p>
          <div className="mb-4 flex flex-wrap gap-2">
            {SCORES.map((s) => (
              <span key={s.t} className="chip flex items-center gap-2 px-3 py-2 text-xs font-extrabold">
                <span className="text-muted">{s.t}</span>
                <span style={{ color: s.c }}>{s.v} امتیاز</span>
              </span>
            ))}
          </div>
          <ul className="space-y-2.5">
            {[
              ["❤️", "۳ جان داری؛ هر جواب اشتباه یکی کم می‌شود. در هاردکور فقط ۱ جان!"],
              ["🔥", "کمبو: ۳ جواب پیاپی ×۲ · ۵ جواب ×۳ · ۱۰ جواب ×۵ — با جواب اشتباه صفر می‌شود."],
              ["⚡", "در حالت‌های زمانی، هر چه سریع‌تر جواب بدهی پاداش سرعت بیشتری می‌گیری."],
              ["📈", "سختی سؤال‌ها واقعی است: آسان غذاهای معروف (پیتزا ← ایتالیا)، و غیرممکن سؤال‌های تخصصی برای خبره‌ها."],
            ].map(([i, txt]) => (
              <li key={txt} className="flex items-start gap-3">
                <span className="mt-0.5 text-lg" aria-hidden>{i}</span>
                <span>{txt}</span>
              </li>
            ))}
          </ul>
        </Section>

        {/* ── 6. outputs / rewards ── */}
        <Section id="rewards" icon="🎁" title="چه چیزهایی به دست می‌آوری؟ (خروجی‌ها)">
          <ul className="space-y-2.5">
            {[
              ["⭐", "XP و سطح: هر جواب درست XP می‌دهد؛ با بالا رفتن سطح، حالت‌های سخت‌تر باز می‌شوند."],
              ["🪙", "سکه: کشف هر غذای جدید ۵۰ سکه و هر مادهٔ جدید ۵ سکه."],
              ["📖", "کلکسیون غذا: غذاهای کشف‌شده با عکس، نام، شهر، کمیابی و دستور پخت کامل در «کتاب غذا» باز می‌شوند."],
              ["🧂", "کلکسیون مواد اولیه: با کشف غذاها، موادشان هم جمع می‌شود."],
              ["🌟", "کمیابی غذاها: از رایج تا اسطوره‌ای — غذاهای کمیاب‌تر سخت‌تر پیدا می‌شوند."],
              ["🏆", "دستاوردها: از «اولین لقمه» تا «کارشناس غذای ایران» و «بازماندهٔ غیرممکن»."],
              ["📊", "جدول رده‌بندی: امتیازت در رده‌بندی جهانی، روزانه، هفتگی و ماهانه ثبت می‌شود."],
              ["📅", "تکمیل چالش روزانه با تاریخ شمسی و میلادی در پروفایل‌ات ثبت می‌شود."],
            ].map(([i, txt]) => (
              <li key={txt} className="flex items-start gap-3">
                <span className="mt-0.5 text-lg" aria-hidden>{i}</span>
                <span>{txt}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4">
            <div className="mb-2 text-[10px] font-extrabold uppercase tracking-[0.2em] text-saffron">⭐ درجهٔ کمیابی غذاها</div>
            <div className="flex flex-wrap gap-1.5">
              {RARITIES.map((r) => (
                <span key={r.t} className="chip px-3 py-1.5 text-xs font-extrabold" style={{ color: r.c }}>{r.t}</span>
              ))}
            </div>
          </div>
        </Section>

        {/* ── 7. keyboard ── */}
        <Section id="keys" icon="⌨️" title="میانبرهای کیبورد">
          <div className="flex flex-col gap-3">
            {[
              { keys: ["۱", "۲", "۳", "۴"], d: "انتخاب گزینهٔ اول تا چهارم" },
              { keys: ["Enter", "Space"], d: "رفتن به سؤال بعدی" },
              { keys: ["Esc"], d: "بستن پنجره‌ها و جست‌وجو" },
            ].map((row) => (
              <div key={row.d} className="flex flex-wrap items-center gap-2.5">
                <span className="flex gap-1.5">
                  {row.keys.map((k) => <Key key={k} k={k} />)}
                </span>
                <span className="text-[13px]">{row.d}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[13px]">📱 روی موبایل همه‌چیز با لمس کار می‌کند؛ دکمه‌ها بزرگ و راحت طراحی شده‌اند.</p>
        </Section>

        {/* ── 8. settings / save ── */}
        <Section id="settings" icon="⚙️" title="زبان، تقویم و ذخیره‌سازی">
          <ul className="space-y-2.5">
            {[
              ["🗣️", "سه زبان کامل: فارسی (راست‌به‌چپ)، انگلیسی و عربی — کل چیدمان با تغییر زبان خودش را وفق می‌دهد."],
              ["🗓️", "دو تقویم: میلادی و هجری شمسی؛ در تنظیمات انتخاب می‌کنی کدام نمایش داده شود."],
              ["🌙", "پوستهٔ روشن و تاریک، صدا و انیمیشن‌ها هم قابل تنظیم‌اند."],
              ["💾", "پیشرفت به‌صورت خودکار در مرورگر ذخیره می‌شود و با رفرش پاک نمی‌شود."],
            ].map(([i, txt]) => (
              <li key={txt} className="flex items-start gap-3">
                <span className="mt-0.5 text-lg" aria-hidden>{i}</span>
                <span>{txt}</span>
              </li>
            ))}
          </ul>
        </Section>

        {/* ── 9. FAQ ── */}
        <Section id="faq" icon="💬" title="سوالات متداول">
          <div className="space-y-2.5">
            {FAQ.map((f) => (
              <details key={f.q} className="group rounded-xl border border-line bg-panel2 p-4 open:border-saffron/40">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-extrabold text-ink [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span aria-hidden className="shrink-0 text-lg font-bold text-saffron transition-transform duration-200 group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-[13px] leading-7">{f.a}</p>
              </details>
            ))}
          </div>
        </Section>

        {/* ── back ── */}
        <div className="pt-1 pb-2 text-center">
          <button
            onClick={() => { nav({ name: "home" }); sfx.click(); }}
            className="inline-flex min-h-12 w-full max-w-xs items-center justify-center gap-2 rounded-xl bg-saffron px-6 text-base font-extrabold text-[#241705] shadow-[0_6px_20px_-6px_rgba(242,168,59,0.55)] transition-all hover:bg-saffron2 active:scale-[0.97]"
          >
            🏠 بازگشت به صفحهٔ اصلی
          </button>
        </div>
      </div>
    </div>
  );
}
