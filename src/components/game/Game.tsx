import { useCallback, useEffect, useRef, useState } from "react";
import { drawQuestions, LEVELS, type LevelId, type Question } from "@/lib/game/questions";
import { avatarSrc } from "@/lib/game/avatars";
import { BACKGROUNDS } from "@/lib/game/backgrounds";
import { Button } from "@/components/ui/button";
import { RulerPic } from "@/components/game/RulerPic";

export type RoundResult = {
  level: LevelId;
  score: number;
  total_correct: number;
  total_wrong: number;
  stars: number;
  answers_log: { question_type: string; is_correct: boolean; attempts: number; object_name?: string }[];
};

import { buildCourse, blockTop, critterX, GROUND, GAP, FIRST_CP, N_Q, FINISH_X, type Course } from "@/lib/game/course";

const P_W = 9;
const P_H = 14;
const SPEED = 38; // units / s
const JUMP_V = 70;
const GRAV = 160;
const MAX_HEARTS = 5;

function playTone(freqs: number[], dur = 0.12) {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    freqs.forEach((f, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = f;
      const t = ctx.currentTime + i * dur;
      g.gain.setValueAtTime(0.25, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur * 2);
      o.connect(g).connect(ctx.destination);
      o.start(t);
      o.stop(t + dur * 2);
    });
    setTimeout(() => ctx.close(), 1500);
  } catch {
    /* audio unavailable */
  }
}
const ting = () => playTone([1320, 1760]);
const coinSfx = () => playTone([988], 0.06);
const softBoop = () => playTone([330, 262], 0.15);

export function Game({ level, avatar, onExit, onFinish }: { level: LevelId; avatar: string; onExit: () => void; onFinish: (r: RoundResult) => void }) {
  const meta = LEVELS.find((l) => l.id === level) ?? LEVELS[0];
  const stageRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(6);
  const [, setFrame] = useState(0);
  const st = useRef({
    x: 5, y: GROUND - P_H, vy: 0, onGround: true, face: 1,
    left: false, right: false, jump: false,
    course: buildCourse() as Course, taken: new Set<number>(), t: 0, ups: 0, cpDone: 0, paused: false, done: false,
    questions: drawQuestions(level, N_Q) as Question[],
    hearts: MAX_HEARTS, score: 0, stars: 0, correct: 0, wrong: 0,
    log: [] as RoundResult["answers_log"],
  });
  const [modal, setModal] = useState<Question | null>(null);
  const [feedback, setFeedback] = useState<"ok" | "no" | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const finished = useRef(false);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setScale(el.clientHeight / 100));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const finish = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    const s = st.current;
    s.done = true;
    onFinish({ level, score: s.score, total_correct: s.correct, total_wrong: s.wrong, stars: s.stars, answers_log: s.log });
  }, [level, onFinish]);

  // keyboard
  useEffect(() => {
    const set = (e: KeyboardEvent, v: boolean) => {
      const s = st.current;
      if (["ArrowLeft", "a", "A"].includes(e.key)) s.left = v;
      else if (["ArrowRight", "d", "D"].includes(e.key)) s.right = v;
      else if ([" ", "ArrowUp", "w", "W"].includes(e.key)) { s.jump = v; }
      else return;
      if (!modal) e.preventDefault();
    };
    const dn = (e: KeyboardEvent) => set(e, true);
    const up = (e: KeyboardEvent) => set(e, false);
    window.addEventListener("keydown", dn);
    window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", dn); window.removeEventListener("keyup", up); };
  }, [modal]);

  // loop
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const s = st.current;
      if (!s.paused && !s.done) {
        const dir = (s.right ? 1 : 0) - (s.left ? 1 : 0);
        s.t += dt;
        if (dir) s.face = dir;
        const solids = s.course.blocks.map((b) => ({ x: b.x, w: b.w, top: blockTop(b, s.t), h: b.h }));
        // horizontal move + side collisions
        s.x = Math.max(2, s.x + dir * SPEED * dt);
        for (const b of solids) {
          if (s.x + P_W > b.x && s.x < b.x + b.w && s.y + P_H > b.top + 1 && s.y < b.top + b.h) {
            s.x = dir > 0 ? b.x - P_W : dir < 0 ? b.x + b.w : s.x;
          }
        }
        if (s.jump && s.onGround) { s.vy = -JUMP_V; s.onGround = false; }
        const prevBottom = s.y + P_H;
        const prevTop = s.y;
        s.vy += GRAV * dt;
        s.y += s.vy * dt;
        s.onGround = false;
        const cx = s.x + P_W / 2;
        const overPit = s.course.pits.some((p) => cx > p.x && cx < p.x + p.w);
        if (!overPit && s.y + P_H >= GROUND && prevBottom <= GROUND + 2) { s.y = GROUND - P_H; s.vy = 0; s.onGround = true; }
        for (const b of solids) {
          if (s.x + P_W > b.x + 0.5 && s.x < b.x + b.w - 0.5) {
            if (s.vy >= 0 && prevBottom <= b.top + 2.5 && s.y + P_H >= b.top) { s.y = b.top - P_H; s.vy = 0; s.onGround = true; }
            else if (s.vy < 0 && prevTop >= b.top + b.h - 0.5 && s.y < b.top + b.h) { s.y = b.top + b.h; s.vy = 0; }
          }
        }
        // fell into a pit: gentle respawn at the last gate, no heart lost
        if (s.y > 100) {
          s.x = s.cpDone === 0 ? 5 : FIRST_CP + (s.cpDone - 1) * GAP + 3;
          s.y = GROUND - P_H - 10; s.vy = 0; s.ups = s.t; softBoop();
        }
        // critters: stomp from above bounces, otherwise knock back
        for (const cr of s.course.critters) {
          const kx = critterX(cr, s.t);
          if (s.x + P_W > kx - 3 && s.x < kx + 3 && s.y + P_H > GROUND - 6) {
            if (s.vy > 0 && prevBottom <= GROUND - 4) { s.vy = -55; s.score += 20; coinSfx(); }
            else { s.x = Math.max(2, s.x + (s.x + P_W / 2 < kx ? -12 : 12)); s.vy = -35; s.ups = s.t; softBoop(); }
          }
        }
        // gate
        if (s.cpDone < N_Q) {
          const gx = FIRST_CP + s.cpDone * GAP;
          if (s.x + P_W >= gx - 1) {
            s.x = gx - 1 - P_W;
            s.paused = true;
            s.left = s.right = s.jump = false;
            setModal(s.questions[s.cpDone] ?? null);
          }
        } else if (s.x + P_W / 2 >= FINISH_X) {
          finish();
        }
        s.course.coins.forEach((c, i) => {
          if (!s.taken.has(i) && Math.abs(c.x - cx) < 5 && Math.abs(c.y - (s.y + P_H / 2)) < 9) {
            s.taken.add(i); s.stars++; s.score += 10; coinSfx();
          }
        });
      }
      setFrame((f) => (f + 1) % 1000000);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [finish]);

  const answer = (opt: string) => {
    if (!modal || picked) return;
    const s = st.current;
    const ok = opt === modal.answer;
    setPicked(opt);
    s.log.push({ question_type: modal.type, is_correct: ok, attempts: 1, ...(modal.objectName ? { object_name: modal.objectName } : {}) });
    if (ok) { s.correct++; s.score += 100; ting(); setFeedback("ok"); }
    else { s.wrong++; s.hearts--; softBoop(); setFeedback("no"); }
    setTimeout(() => {
      setFeedback(null);
      setPicked(null);
      setModal(null);
      s.cpDone++;
      s.paused = false;
      if (s.hearts <= 0) finish();
    }, ok ? 1100 : 1600);
  };

  const s = st.current;
  const vw = stageRef.current ? stageRef.current.clientWidth / scale : 160;
  const cam = Math.max(0, Math.min(s.x - vw * 0.35, FINISH_X + 30 - vw));
  const u = (n: number) => n * scale;

  const hold = (key: "left" | "right" | "jump") => ({
    onPointerDown: (e: React.PointerEvent) => { e.preventDefault(); st.current[key] = true; },
    onPointerUp: () => { st.current[key] = false; },
    onPointerLeave: () => { st.current[key] = false; },
    onPointerCancel: () => { st.current[key] = false; },
  });

  return (
    <div className="fixed inset-0 flex flex-col bg-sky select-none touch-none">
      {/* HUD */}
      <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between gap-2 p-2 sm:p-4">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <div className="rounded-full bg-card/90 px-3 py-1 text-lg font-extrabold sm:text-2xl">{"❤️".repeat(Math.max(0, s.hearts))}<span className="opacity-30">{"🤍".repeat(MAX_HEARTS - Math.max(0, s.hearts))}</span></div>
          <div className="rounded-full bg-card/90 px-3 py-1 text-lg font-extrabold sm:text-2xl">⭐ {s.score}</div>
          <div className="hidden rounded-full bg-card/90 px-3 py-1 text-lg font-extrabold sm:block sm:text-2xl">🚩 {s.cpDone}/{N_Q}</div>
        </div>
        <button onClick={onExit} className="btn-pop shrink-0 rounded-full bg-coral px-4 py-2 text-lg font-extrabold text-primary-foreground sm:text-2xl">🏠 Keluar</button>
      </div>

      {/* Stage */}
      <div ref={stageRef} className="relative flex-1 overflow-hidden">
        <div className="absolute inset-0" style={{ backgroundImage: `url(${BACKGROUNDS[meta?.bg ?? "garden"].src})`, backgroundSize: "auto 100%", backgroundRepeat: "repeat-x", backgroundPosition: `${-cam * scale * 0.5}px 0` }} />
        <div className="absolute inset-0" style={{ transform: `translateX(${-u(cam)}px)` }}>
          <div className="absolute bg-grass" style={{ left: 0, width: u(FINISH_X + 80), top: u(GROUND), bottom: 0, boxShadow: "inset 0 8px 0 var(--secondary)" }} />
          {s.course.pits.map((p, i) => (
            <div key={i} className="absolute" style={{ left: u(p.x), width: u(p.w), top: u(GROUND), bottom: 0, background: "linear-gradient(var(--sky), oklch(0.45 0.12 245))" }}>
              <div className="absolute inset-x-0 bottom-0 text-center" style={{ fontSize: u(4) }}>〰️</div>
            </div>
          ))}
          {s.course.blocks.map((b, i) => (
            <div key={i} className="absolute rounded-lg" style={{ left: u(b.x), width: u(b.w), top: u(blockTop(b, s.t)), height: u(b.h), background: "oklch(0.55 0.08 60)", borderTop: `${u(1.6)}px solid var(--grass)`, boxShadow: "inset 0 -4px 0 oklch(0 0 0 / .2)" }} />
          ))}
          {s.course.critters.map((cr, i) => {
            const kx = critterX(cr, s.t);
            return <div key={i} className="absolute text-center" style={{ left: u(kx - 4), top: u(GROUND - 7), width: u(8), fontSize: u(6), lineHeight: 1 }}>{cr.emoji}</div>;
          })}
          {s.course.coins.map((c, i) => !s.taken.has(i) && (
            <div key={i} className="absolute text-center" style={{ left: u(c.x - 3), top: u(c.y - 3), width: u(6), fontSize: u(5) }}>⭐</div>
          ))}
          {Array.from({ length: N_Q }).map((_, i) => {
            const gx = FIRST_CP + i * GAP;
            const open = i < s.cpDone;
            return (
              <div key={i} className="absolute" style={{ left: u(gx), top: u(GROUND - 26), width: u(6), height: u(26) }}>
                <div className="absolute inset-x-0 top-0 rounded-t-full bg-sun text-center font-extrabold" style={{ height: u(7), fontSize: u(4) }}>{i + 1}</div>
                <div className="absolute inset-x-0 bottom-0 rounded-b-md transition-all duration-700" style={{ top: u(7), background: open ? "transparent" : "repeating-linear-gradient(0deg, var(--berry) 0 12%, var(--coral) 12% 24%)", transform: open ? "scaleY(0)" : "scaleY(1)", transformOrigin: "top" }} />
              </div>
            );
          })}
          <div className="absolute flex items-start justify-center" style={{ left: u(FINISH_X), top: u(GROUND - 34), width: u(4), height: u(34), background: "var(--foreground)" }}>
            <div className="absolute left-full top-0" style={{ fontSize: u(10), lineHeight: 1 }}>🏁</div>
          </div>
          {s.t - s.ups < 0.8 && s.ups > 0 && <div className="absolute font-extrabold text-coral" style={{ left: u(s.x - 2), top: u(s.y - 8), fontSize: u(4) }}>Ups!</div>}
          <img src={avatarSrc(avatar)} alt="" draggable={false} className="absolute object-contain" style={{ left: u(s.x - 2), top: u(s.y - 2), width: u(P_W + 4), height: u(P_H + 2), transform: `scaleX(${s.face})` }} />
        </div>
      </div>

      {/* Touch controls */}
      <div className="clear-badge pointer-events-none absolute inset-x-0 bottom-0 z-10 flex items-end justify-between px-3 sm:px-6">
        <div className="pointer-events-auto flex gap-3">
          <button aria-label="Kiri" {...hold("left")} className="btn-pop grid size-20 place-items-center rounded-full bg-card/90 text-4xl sm:size-24 lg:size-28">◀</button>
          <button aria-label="Kanan" {...hold("right")} className="btn-pop grid size-20 place-items-center rounded-full bg-card/90 text-4xl sm:size-24 lg:size-28">▶</button>
        </div>
        <button aria-label="Lompat" {...hold("jump")} className="btn-pop pointer-events-auto grid size-20 place-items-center rounded-full bg-sun text-4xl sm:size-24 lg:size-28">▲</button>
      </div>

      {/* Question modal */}
      {modal && (
        <div className="clear-badge absolute inset-0 z-30 grid place-items-center bg-foreground/40 px-3 pt-3">
          <div className={`relative max-h-full w-full max-w-2xl overflow-y-auto rounded-3xl bg-card p-5 text-center shadow-2xl sm:p-8 short:p-4 ${feedback === "no" ? "anim-wobble" : ""}`}>
            <div className="mb-1 text-base font-extrabold text-muted-foreground">🚩 {s.cpDone + 1}/{N_Q}</div>
            {modal.emoji && <div className="text-6xl sm:text-7xl short:text-3xl">{modal.emoji}</div>}
            {modal.ruler && <RulerPic {...modal.ruler} />}
            <h2 className="my-4 text-2xl font-extrabold sm:text-4xl short:my-2 short:text-xl">{modal.prompt}</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 short:gap-2">
              {modal.options.map((o, i) => {
                const colors = ["bg-sky", "bg-berry", "bg-grass"];
                const isAns = picked && o === modal.answer;
                const isWrongPick = picked === o && o !== modal.answer;
                return (
                  <Button key={o} disabled={picked !== null} onClick={() => answer(o)} className={`btn-pop h-auto min-h-20 min-w-0 whitespace-normal rounded-3xl px-3 py-5 text-2xl font-extrabold text-primary-foreground sm:min-h-28 sm:py-6 short:min-h-14 short:py-2 short:text-base ${modal.type === "alat_ukur" ? "sm:text-2xl" : "sm:text-3xl"} ${colors[i]} ${isAns ? "ring-8 ring-sun" : ""} ${isWrongPick ? "opacity-50" : ""}`}>{o}</Button>
                );
              })}
            </div>
            {feedback === "ok" && (
              <div className="pointer-events-none absolute inset-0 grid place-items-center"><div className="anim-star text-9xl">⭐</div><div className="absolute bottom-4 text-3xl font-extrabold text-grass">Ting! +100</div></div>
            )}
            {feedback === "no" && <div className="mt-4 text-3xl font-extrabold text-coral">💪 Coba lagi ya! −❤️</div>}
          </div>
        </div>
      )}
    </div>
  );
}

