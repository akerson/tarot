// ─────────────────────────────────────────────────────────────────────────────
//  Procedural sound — every effect is synthesized with the Web Audio API.
//  Zero audio assets shipped; the whole soundscape is math. Lazily inits on the
//  first user gesture (autoplay-policy friendly) and respects the sound setting.
// ─────────────────────────────────────────────────────────────────────────────

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let enabled = true;

export function setSfxEnabled(v: boolean) {
  enabled = v;
  if (master) master.gain.value = v ? 0.5 : 0;
}

function ac(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = enabled ? 0.5 : 0;
    master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

type Wave = OscillatorType;

function tone(freq: number, dur: number, opts: { type?: Wave; gain?: number; delay?: number; sweepTo?: number; pan?: number } = {}) {
  const c = ac();
  if (!c || !master) return;
  const t = c.currentTime + (opts.delay ?? 0);
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = opts.type ?? "sine";
  osc.frequency.setValueAtTime(freq, t);
  if (opts.sweepTo) osc.frequency.exponentialRampToValueAtTime(Math.max(1, opts.sweepTo), t + dur);
  const peak = opts.gain ?? 0.3;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g);
  if (opts.pan !== undefined && c.createStereoPanner) {
    const p = c.createStereoPanner();
    p.pan.value = opts.pan;
    g.connect(p); p.connect(master);
  } else {
    g.connect(master);
  }
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

function noise(dur: number, gain = 0.2, hp = 800) {
  const c = ac();
  if (!c || !master) return;
  const t = c.currentTime;
  const buf = c.createBuffer(1, c.sampleRate * dur, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  const src = c.createBufferSource();
  src.buffer = buf;
  const filter = c.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.value = hp;
  const g = c.createGain();
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(filter); filter.connect(g); g.connect(master);
  src.start(t);
}

const chord = (freqs: number[], dur: number, type: Wave = "triangle", gain = 0.18, stagger = 0.05) =>
  freqs.forEach((f, i) => tone(f, dur, { type, gain, delay: i * stagger }));

/** Haptic buzz on supporting devices; respects the sound toggle. */
function buzz(pattern: number | number[]) {
  if (enabled && typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(pattern);
}

export const sfx = {
  tap: () => tone(520, 0.06, { type: "triangle", gain: 0.12, sweepTo: 700 }),
  nav: () => tone(380, 0.09, { type: "sine", gain: 0.14, sweepTo: 520 }),
  select: () => { tone(640, 0.07, { type: "triangle", gain: 0.16 }); tone(960, 0.06, { type: "sine", gain: 0.08, delay: 0.04 }); },
  hit: () => { noise(0.12, 0.25, 500); tone(180, 0.12, { type: "sawtooth", gain: 0.18, sweepTo: 60 }); buzz(12); },
  crit: () => { noise(0.18, 0.32, 400); tone(220, 0.16, { type: "sawtooth", gain: 0.22, sweepTo: 50 }); tone(880, 0.1, { type: "square", gain: 0.1 }); buzz([20, 30, 20]); },
  heal: () => chord([523, 659, 784], 0.4, "sine", 0.12, 0.06),
  shield: () => { tone(300, 0.25, { type: "triangle", gain: 0.16, sweepTo: 500 }); tone(450, 0.2, { type: "sine", gain: 0.08, delay: 0.05 }); },
  buff: () => { tone(440, 0.2, { type: "triangle", gain: 0.14, sweepTo: 660 }); tone(660, 0.18, { type: "sine", gain: 0.08, delay: 0.06 }); },
  debuff: () => { tone(330, 0.22, { type: "sawtooth", gain: 0.12, sweepTo: 180 }); },
  death: () => { tone(200, 0.5, { type: "sawtooth", gain: 0.2, sweepTo: 40 }); noise(0.3, 0.15, 300); buzz(40); },
  ability: () => { tone(700, 0.1, { type: "triangle", gain: 0.12, sweepTo: 1100 }); },
  victory: () => { chord([523, 659, 784, 1047], 0.7, "triangle", 0.16, 0.1); buzz([30, 50, 30, 50, 60]); },
  defeat: () => chord([392, 311, 233], 0.8, "sine", 0.16, 0.12),
  summon: () => { chord([330, 494, 659, 988], 0.9, "sine", 0.1, 0.08); tone(1320, 0.4, { type: "triangle", gain: 0.08, delay: 0.4 }); },
  reveal: (rarity: "epic" | "legendary" | "mythic") => {
    const sets = { epic: [523, 659, 784], legendary: [523, 659, 784, 1047], mythic: [523, 659, 784, 1047, 1319] };
    chord(sets[rarity], 0.8, "triangle", 0.18, 0.07);
    if (rarity !== "epic") tone(1760, 0.5, { type: "sine", gain: 0.1, delay: 0.3 });
  },
  reward: () => { tone(784, 0.12, { type: "triangle", gain: 0.14 }); tone(1047, 0.18, { type: "sine", gain: 0.1, delay: 0.08 }); },
  levelUp: () => chord([523, 698, 880], 0.4, "triangle", 0.14, 0.05),
  ascend: () => chord([392, 523, 659, 880, 1047], 0.9, "sine", 0.14, 0.08),
  climb: () => { tone(440, 0.18, { type: "triangle", gain: 0.14, sweepTo: 880 }); },
  error: () => tone(180, 0.15, { type: "square", gain: 0.1, sweepTo: 120 }),
};

/** Prime the audio context on first gesture. */
export function primeAudio() { ac(); }
