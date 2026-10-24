// Cheerful looping background music synthesized with Web Audio — no audio file needed.
// startMusic() must be called from a user gesture (button click) so the AudioContext may run.

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let timer: number | null = null;
let step = 0;
let nextTime = 0;

const STEP = 0.21; // eighth note at ~143 bpm
const LOOKAHEAD = 0.25;

// Happy C-major loop, 16 eighth-note steps (0 = rest)
const MELODY = [
  523.25, 659.25, 783.99, 659.25, // C5 E5 G5 E5
  587.33, 698.46, 880.0, 698.46, // D5 F5 A5 F5
  659.25, 783.99, 1046.5, 783.99, // E5 G5 C6 G5
  587.33, 659.25, 523.25, 0, // D5 E5 C5 rest
];
const BASS = [
  261.63, 0, 196.0, 0, // C3 G2
  220.0, 0, 196.0, 0, // A2 G2
  174.61, 0, 196.0, 0, // F2 G2
  261.63, 0, 196.0, 0, // C3 G2
];

function note(freq: number, at: number, dur: number, type: OscillatorType, vol: number) {
  if (!ctx || !master || freq <= 0) return;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(vol, at + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  o.connect(g).connect(master);
  o.start(at);
  o.stop(at + dur + 0.05);
}

function schedule() {
  if (!ctx) return;
  while (nextTime < ctx.currentTime + LOOKAHEAD) {
    const i = step % MELODY.length;
    note(MELODY[i]!, nextTime, STEP * 0.95, "triangle", 0.5);
    note(BASS[i]!, nextTime, STEP * 1.8, "sine", 0.35);
    step++;
    nextTime += STEP;
  }
}

export function startMusic() {
  if (ctx) return;
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new Ctx();
    void ctx.resume();
    master = ctx.createGain();
    master.gain.value = 0.12;
    master.connect(ctx.destination);
    step = 0;
    nextTime = ctx.currentTime + 0.05;
    schedule();
    timer = window.setInterval(schedule, 100);
  } catch {
    ctx = null;
  }
}

export function stopMusic() {
  if (timer !== null) {
    clearInterval(timer);
    timer = null;
  }
  if (ctx) {
    void ctx.close().catch(() => undefined);
    ctx = null;
    master = null;
  }
}
