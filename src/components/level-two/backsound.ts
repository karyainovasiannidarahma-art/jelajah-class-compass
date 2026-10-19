// Cheerful looping marimba-like melody generated with Web Audio (no file download).
const melody = [523.25, 659.25, 783.99, 659.25, 587.33, 698.46, 880, 698.46, 523.25, 659.25, 783.99, 1046.5, 987.77, 783.99, 659.25, 587.33];
const bass = [130.81, 174.61, 196, 130.81];
const STEP = 0.32;

export function createBacksound() {
  let ctx: AudioContext | null = null;
  let gain: GainNode | null = null;
  let timer: ReturnType<typeof setInterval> | null = null;
  let step = 0;
  let next = 0;
  const note = (freq: number, at: number, len: number, vol: number, type: OscillatorType) => {
    if (!ctx || !gain) return;
    const o = ctx.createOscillator(); const g = ctx.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(vol, at + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, at + len);
    o.connect(g).connect(gain); o.start(at); o.stop(at + len + 0.05);
  };
  const schedule = () => {
    if (!ctx) return;
    while (next < ctx.currentTime + 0.6) {
      note(melody[step % melody.length], next, 0.45, 0.18, 'triangle');
      if (step % 4 === 0) note(bass[(step / 4) % bass.length], next, 1.1, 0.12, 'sine');
      next += STEP; step += 1;
    }
  };
  return {
    start() {
      if (typeof window === 'undefined' || timer) return;
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!ctx) { ctx = new AC(); gain = ctx.createGain(); gain.gain.value = 0.35; gain.connect(ctx.destination); }
      void ctx.resume();
      next = ctx.currentTime + 0.05;
      timer = setInterval(schedule, 150);
    },
    stop() {
      if (timer) clearInterval(timer);
      timer = null;
      void ctx?.suspend();
    },
    dispose() { this.stop(); void ctx?.close(); ctx = null; gain = null; },
  };
}
