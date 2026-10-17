import confetti from "canvas-confetti";

let ctx: AudioContext | null = null;
export function playPopSound() {
  try {
    if (typeof window === "undefined") return;
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = ctx ?? new AC();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    const t = ctx.currentTime;
    o.type = "sine";
    o.frequency.setValueAtTime(750, t);
    o.frequency.exponentialRampToValueAtTime(300, t + 0.08);
    g.gain.setValueAtTime(0.25, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    o.connect(g).connect(ctx.destination);
    o.start(t);
    o.stop(t + 0.1);
  } catch {
    /* ignore */
  }
}

export function celebrate(big = false) {
  confetti({ particleCount: big ? 200 : 80, spread: big ? 110 : 70, origin: { y: 0.6 } });
}

/** Global: play pop on any button / interactive tap */
export function installGlobalPop() {
  if (typeof window === "undefined" || (window as unknown as { __pop?: boolean }).__pop) return;
  (window as unknown as { __pop?: boolean }).__pop = true;
  document.addEventListener("pointerdown", (e) => {
    const el = (e.target as HTMLElement)?.closest("button,a,[role=button],[data-pop]");
    if (el) playPopSound();
  });
}
