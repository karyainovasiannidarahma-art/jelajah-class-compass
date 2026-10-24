// Course layout in world units (stage = 100 units tall, ground top at GROUND).
// Physics: jump reaches ~15 units high and ~33 units far, so every gap/step below is passable.
export const GROUND = 82;
export const GAP = 60;
export const FIRST_CP = 55;
export const N_Q = 10;
export const FINISH_X = FIRST_CP + N_Q * GAP;

export type Pit = { x: number; w: number };
export type Block = { x: number; w: number; top: number; h: number; moveY?: number; speed?: number };
export type Critter = { x0: number; x1: number; speed: number; emoji: string };
export type Coin = { x: number; y: number };

export type Course = { pits: Pit[]; blocks: Block[]; critters: Critter[]; coins: Coin[] };

type Pattern = (o: number, c: Course) => void;

const arc = (c: Course, x0: number, x1: number, peak: number, n = 3) => {
  for (let k = 0; k < n; k++) {
    const t = n === 1 ? 0.5 : k / (n - 1);
    c.coins.push({ x: x0 + (x1 - x0) * t, y: GROUND - 8 - peak * Math.sin(Math.PI * t) });
  }
};

// Each pattern uses the 40 units from o to o+40 between two gates.
const PATTERNS: Pattern[] = [
  // 1. single pit with coin arc
  (o, c) => { c.pits.push({ x: o + 14, w: 11 }); arc(c, o + 10, o + 30, 12); },
  // 2. stair blocks, top coin is hard to reach
  (o, c) => {
    c.blocks.push({ x: o + 6, w: 10, top: GROUND - 9, h: 9 });
    c.blocks.push({ x: o + 18, w: 10, top: GROUND - 19, h: 19 });
    c.coins.push({ x: o + 23, y: GROUND - 30 }, { x: o + 11, y: GROUND - 15 });
  },
  // 3. hedgehog walking back and forth
  (o, c) => { c.critters.push({ x0: o + 4, x1: o + 34, speed: 14, emoji: "🦔" }); arc(c, o + 12, o + 28, 14); },
  // 4. wide pit with floating platform in the middle
  (o, c) => {
    c.pits.push({ x: o + 4, w: 32 });
    c.blocks.push({ x: o + 15, w: 10, top: GROUND - 7, h: 4 });
    c.coins.push({ x: o + 20, y: GROUND - 22 });
  },
  // 5. double pit, needs two well-timed jumps
  (o, c) => {
    c.pits.push({ x: o + 6, w: 9 }, { x: o + 24, w: 9 });
    c.coins.push({ x: o + 10, y: GROUND - 18 }, { x: o + 28, y: GROUND - 18 });
  },
  // 6. tall wall with a crab guarding the landing
  (o, c) => {
    c.blocks.push({ x: o + 8, w: 7, top: GROUND - 12, h: 12 });
    c.critters.push({ x0: o + 20, x1: o + 36, speed: 12, emoji: "🦀" });
    c.coins.push({ x: o + 11.5, y: GROUND - 20 });
  },
  // 7. moving platform over a pit
  (o, c) => {
    c.pits.push({ x: o + 6, w: 28 });
    c.blocks.push({ x: o + 15, w: 10, top: GROUND - 8, h: 4, moveY: 8, speed: 1.6 });
    arc(c, o + 12, o + 28, 18);
  },
  // 8. high-low-high platforms with critter below
  (o, c) => {
    c.blocks.push({ x: o + 4, w: 8, top: GROUND - 11, h: 11 });
    c.blocks.push({ x: o + 28, w: 8, top: GROUND - 11, h: 11 });
    c.critters.push({ x0: o + 13, x1: o + 26, speed: 16, emoji: "🐌" });
    arc(c, o + 8, o + 32, 16, 4);
  },
  // 9. pit then step then pit
  (o, c) => {
    c.pits.push({ x: o + 4, w: 9 }, { x: o + 27, w: 9 });
    c.blocks.push({ x: o + 16, w: 8, top: GROUND - 10, h: 10 });
    c.coins.push({ x: o + 20, y: GROUND - 24 });
  },
];

export function buildCourse(): Course {
  const c: Course = { pits: [], blocks: [], critters: [], coins: [] };
  // warm-up area before gate 1
  c.coins.push({ x: 20, y: GROUND - 8 }, { x: 28, y: GROUND - 8 }, { x: 36, y: GROUND - 20 });
  c.blocks.push({ x: 40, w: 8, top: GROUND - 7, h: 7 });
  for (let i = 1; i < N_Q; i++) {
    const o = FIRST_CP + (i - 1) * GAP + 10;
    PATTERNS[(i - 1) % PATTERNS.length]!(o, c);
  }
  // last stretch to the finish flag
  const o = FIRST_CP + (N_Q - 1) * GAP + 10;
  arc(c, o + 4, o + 36, 14, 5);
  return c;
}

export function blockTop(b: Block, t: number) {
  return b.moveY ? b.top - (Math.sin(t * (b.speed ?? 1)) * 0.5 + 0.5) * b.moveY : b.top;
}

export function critterX(cr: Critter, t: number) {
  const span = cr.x1 - cr.x0;
  const p = (t * cr.speed) % (span * 2);
  return p < span ? cr.x0 + p : cr.x1 - (p - span);
}
