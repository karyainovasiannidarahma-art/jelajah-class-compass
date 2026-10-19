// Cheerful looping kalimba/marimba melody generated with Web Audio (no file download).
const melody = [
  523.25, 0, 659.25, 783.99, 0, 659.25, 1046.5, 0,
  987.77, 0, 880, 783.99, 659.25, 0, 587.33, 659.25,
  523.25, 0, 659.25, 783.99, 880, 0, 1046.5, 0,
  987.77, 783.99, 659.25, 0, 523.25, 0, 0, 0,
];
const bass = [130.81, 0, 174.61, 0, 196, 0, 174.61, 0];
const STEP = 0.24;

export function createBacksound() {
  let ctx: AudioContext | null = null;
  let gain: GainNode | null = null;
  let noiseBuf: AudioBuffer | null = null;
  let timer: ReturnType<typeof setInterval> | null = null;
  let step = 0;
  let next = 0;
  const pluck = (freq: number, at: number, vol: number) => {
    if (!ctx || !gain) return;
    const main = ctx.createOscillator(); const gm = ctx.createGain();
    main.type = 'triangle'; main.frequency.value = freq;
    const shimmer = ctx.createOscillator(); const gs = ctx.createGain();
    shimmer.type = 'sine'; shimmer.frequency.value = freq * 2;
    gm.gain.setValueAtTime(vol, at);
    gm.gain.exponentialRampToValueAtTime(0.0001, at + 0.38);
    gs.gain.setValueAtTime(vol * 0.35, at);
    gs.gain.exponentialRampToValueAtTime(0.0001, at + 0.18);
    main.connect(gm).connect(gain); shimmer.connect(gs).connect(gain);
    main.start(at); main.stop(at + 0.42);
    shimmer.start(at); shimmer.stop(at + 0.22);
  };
  const bassNote = (freq: number, at: number) => {
    if (!ctx || !gain) return;
    const o = ctx.createOscillator(); const g = ctx.createGain();
    o.type = 'sine'; o.frequency.value = freq;
    g.gain.setValueAtTime(0.14, at);
    g.gain.exponentialRampToValueAtTime(0.0001, at + 0.5);
    o.connect(g).connect(gain); o.start(at); o.stop(at + 0.55);
  };
  const hat = (at: number) => {
    if (!ctx || !gain || !noiseBuf) return;
    const src = ctx.createBufferSource(); const hp = ctx.createBiquadFilter(); const g = ctx.createGain();
    src.buffer = noiseBuf; hp.type = 'highpass'; hp.frequency.value = 7000;
    g.gain.setValueAtTime(0.05, at);
    g.gain.exponentialRampToValueAtTime(0.0001, at + 0.06);
    src.connect(hp).connect(g).connect(gain); src.start(at); src.stop(at + 0.08);
  };
  const schedule = () => {
    if (!ctx) return;
    while (next < ctx.currentTime + 0.6) {
      const m = melody[step % melody.length]!;
      if (m) pluck(m, next, 0.22);
      const b = bass[step % bass.length]!;
      if (b) bassNote(b, next);
      if (step % 2 === 1) hat(next);
      next += STEP; step += 1;
    }
  };
  return {
    start() {
      if (typeof window === 'undefined' || timer) return;
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!ctx) {
        ctx = new AC();
        gain = ctx.createGain(); gain.gain.value = 0.5; gain.connect(ctx.destination);
        noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 0.1, ctx.sampleRate);
        const data = noiseBuf.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      }
      void ctx.resume();
      next = ctx.currentTime + 0.05;
      timer = setInterval(schedule, 120);
    },
    stop() {
      if (timer) clearInterval(timer);
      timer = null;
      void ctx?.suspend();
    },
    dispose() { this.stop(); void ctx?.close(); ctx = null; gain = null; noiseBuf = null; },
  };
}
