/** Tiny WebAudio synth — no assets, instant, toggleable. */

let ctx: AudioContext | null = null;
let enabled = true;

export function setSoundEnabled(on: boolean): void {
  enabled = on;
}

function ac(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!ctx) ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(freq: number, dur: number, type: OscillatorType = "sine", vol = 0.12, when = 0, slide = 0): void {
  if (!enabled) return;
  const a = ac();
  if (!a) return;
  const t = a.currentTime + when;
  const osc = a.createOscillator();
  const gain = a.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), t + dur);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(vol, t + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(gain).connect(a.destination);
  osc.start(t);
  osc.stop(t + dur + 0.05);
}

export const sfx = {
  click(): void {
    tone(520, 0.06, "triangle", 0.05);
  },
  correct(): void {
    tone(523, 0.09, "triangle", 0.1);
    tone(659, 0.1, "triangle", 0.1, 0.07);
    tone(784, 0.16, "triangle", 0.1, 0.14);
  },
  wrong(): void {
    tone(220, 0.18, "sawtooth", 0.07, 0, -80);
    tone(160, 0.22, "sawtooth", 0.07, 0.1, -60);
  },
  combo(): void {
    tone(440, 0.07, "square", 0.05);
    tone(660, 0.07, "square", 0.05, 0.06);
    tone(880, 0.1, "square", 0.05, 0.12);
  },
  levelup(): void {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.14, "triangle", 0.09, i * 0.09));
  },
  achievement(): void {
    [660, 880, 990, 1320].forEach((f, i) => tone(f, 0.12, "sine", 0.09, i * 0.08));
  },
  gameover(): void {
    [392, 330, 262, 196].forEach((f, i) => tone(f, 0.22, "triangle", 0.09, i * 0.16));
  },
  tick(): void {
    tone(880, 0.04, "square", 0.03);
  },
};
