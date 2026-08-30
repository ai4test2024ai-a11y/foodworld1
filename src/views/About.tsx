import { useApp } from "../state/AppContext";
import { sfx } from "../sound";

/**
 * درباره سازنده — About the Creator.
 * Fixed Persian content (per spec), always RTL, works in every app language & theme.
 */
export default function About() {
  const { nav } = useApp();

  return (
    <div className="mx-auto flex w-full max-w-xl justify-center">
      <div
        dir="rtl"
        lang="fa"
        className="anim-rise relative w-full overflow-hidden rounded-[26px] border border-line p-6 text-right sm:p-9"
        style={{ background: "var(--panel)", boxShadow: "var(--shadow)" }}
      >
        {/* layered ambient background */}
        <div aria-hidden className="pointer-events-none absolute -top-24 -start-24 h-64 w-64 rounded-full bg-saffron/15 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-28 -end-20 h-64 w-64 rounded-full bg-teal/10 blur-3xl" />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              "url(\"image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='28'%3E%3Ccircle cx='2' cy='2' r='1' fill='%23f2a83b' fill-opacity='0.12'/%3E%3Ccircle cx='16' cy='15' r='0.8' fill='%2345b3a6' fill-opacity='0.10'/%3E%3C/svg%3E\")",
          }}
        />
        {/* floating garnish */}
        <span aria-hidden className="anim-floaty absolute top-5 end-6 text-2xl opacity-70">🍴</span>
        <span aria-hidden className="anim-floaty absolute bottom-24 start-6 text-xl opacity-50" style={{ animationDelay: "1.2s" }}>🌍</span>

        <div className="relative">
          {/* avatar */}
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border-2 border-saffron/60 bg-saffron/10 text-5xl shadow-[0_0_0_8px_rgba(242,168,59,0.08)]">
            <span aria-hidden>👨‍💻</span>
          </div>

          <div className="mt-4 text-center text-[10px] font-extrabold uppercase tracking-[0.3em] text-teal" dir="ltr">
            GUESS YOUR FOOD
          </div>

          <h1
            className="mt-2 text-center font-extrabold leading-tight text-saffron"
            style={{ fontSize: "clamp(1.7rem, 6vw, 2.4rem)", fontFamily: "var(--font-display)" }}
          >
            👨‍💻 درباره سازنده
          </h1>

          <div className="mx-auto mt-3 h-1 w-24 rounded-full bg-gradient-to-l from-transparent via-[var(--saffron)] to-transparent" aria-hidden />

          <p className="mt-6 text-center text-[15px] leading-8 text-ink sm:text-base sm:leading-9">
            این بازی یکی از بازی‌های ساخته‌شده توسط
            <span className="mx-1 inline-block rounded-lg border border-saffron/40 bg-saffron/10 px-2 py-0.5 font-extrabold text-saffron">
              کارن خضری، ۱۳ ساله از دبی
            </span>
            است.
          </p>

          <p className="mt-4 text-center text-sm leading-8 text-muted sm:leading-9">
            این پروژه با هدف یادگیری، خلاقیت و تجربه عملی در برنامه‌نویسی و هوش مصنوعی ساخته شده است.
          </p>

          {/* student / teacher */}
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-line bg-panel2 p-4 text-center">
              <div className="text-2xl" aria-hidden>🎓</div>
              <div className="mt-1 text-[10px] font-bold uppercase tracking-wider text-muted">از شاگردان</div>
              <div className="mt-1 font-extrabold text-ink" style={{ fontSize: "clamp(1rem, 4vw, 1.2rem)" }}>
                کارن خضری
              </div>
            </div>
            <div className="rounded-2xl border border-line bg-panel2 p-4 text-center">
              <div className="text-2xl" aria-hidden>👩‍🏫</div>
              <div className="mt-1 text-[10px] font-bold uppercase tracking-wider text-muted">استاد</div>
              <div className="mt-1 font-extrabold text-ink" style={{ fontSize: "clamp(1rem, 4vw, 1.2rem)" }}>
                دکتر ماه منیر آقایی
              </div>
            </div>
          </div>

          {/* phone — highlighted, tappable */}
          <a
            href="tel:00971551544988"
            onClick={() => sfx.click()}
            className="group mt-4 flex flex-col items-center gap-1.5 rounded-2xl border-2 border-saffron/50 bg-saffron/10 px-4 py-4 text-center transition-all hover:border-saffron hover:bg-saffron/15 active:scale-[0.98]"
          >
            <span className="text-xs font-bold text-muted">📞 شماره تماس استاد:</span>
            <span
              dir="ltr"
              className="font-extrabold tracking-[0.12em] text-saffron transition-transform group-hover:scale-105"
              style={{ fontSize: "clamp(1.15rem, 5.5vw, 1.5rem)", fontFamily: "var(--font-display)" }}
            >
              00971551544988
            </span>
            <span className="text-[10px] font-bold text-teal">برای تماس، لمس کنید</span>
          </a>

          {/* back */}
          <button
            onClick={() => {
              sfx.click();
              nav({ name: "home" });
            }}
            className="mx-auto mt-7 flex min-h-12 w-full max-w-xs items-center justify-center gap-2 rounded-xl bg-saffron px-6 text-base font-extrabold text-[#241705] shadow-[0_6px_20px_-6px_rgba(242,168,59,0.55)] transition-all hover:bg-saffron2 active:scale-[0.97]"
          >
            <span aria-hidden className="rotate-180">→</span>
            بازگشت
          </button>
        </div>
      </div>
    </div>
  );
}
