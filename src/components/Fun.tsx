import { useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function PageTitle({ emoji, title, sub }: { emoji: string; title: string; sub?: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-3xl font-bold md:text-4xl">
        <span className="mr-2">{emoji}</span>
        {title}
      </h1>
      {sub && <p className="mt-1 text-lg text-muted-foreground">{sub}</p>}
    </div>
  );
}

export function Tabs({ tabs }: { tabs: { label: string; content: ReactNode }[] }) {
  const [i, setI] = useState(0);
  return (
    <div>
      <div className="mb-5 flex flex-wrap gap-2">
        {tabs.map((t, idx) => (
          <button
            key={t.label}
            onClick={() => setI(idx)}
            className={`rounded-full px-5 py-2 font-display font-semibold transition ${
              idx === i ? "bg-primary text-primary-foreground shadow-pop" : "bg-card text-foreground border-2 border-border"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.2 }}
          className="card-fun p-6"
        >
          {tabs[i]?.content}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export function Confetti() {
  const pieces = Array.from({ length: 30 }, (_, i) => i);
  const emojis = ["🎉", "⭐", "🎊", "✨", "💖"];
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {pieces.map((i) => (
        <motion.span
          key={i}
          className="absolute text-3xl"
          style={{ left: `${(i * 37) % 100}%`, top: -40 }}
          animate={{ y: "110vh", rotate: (i % 2 ? 1 : -1) * 360 }}
          transition={{ duration: 2 + (i % 5) * 0.3, delay: (i % 7) * 0.08, ease: "easeIn" }}
        >
          {emojis[i % emojis.length]}
        </motion.span>
      ))}
    </div>
  );
}

export function ConversionQuiz({ items }: { items: { q: string; a: number; unit: string }[] }) {
  const [vals, setVals] = useState<string[]>(items.map(() => ""));
  const [checked, setChecked] = useState(false);
  return (
    <div className="space-y-3">
      {items.map((it, i) => {
        const ok = Number(vals[i]) === it.a;
        return (
          <div key={it.q} className="flex flex-wrap items-center gap-3 rounded-2xl bg-sun-soft p-3">
            <span className="font-display text-lg font-semibold">{it.q} =</span>
            <input
              type="number"
              className="field-fun w-28"
              value={vals[i]}
              onChange={(e) => {
                const v = [...vals];
                v[i] = e.target.value;
                setVals(v);
                setChecked(false);
              }}
            />
            <span className="font-semibold">{it.unit}</span>
            {checked && <span className="text-xl">{ok ? "✅" : `❌ (jawaban: ${it.a})`}</span>}
          </div>
        );
      })}
      <button className="btn-fun" onClick={() => setChecked(true)}>
        Periksa Jawaban
      </button>
    </div>
  );
}

export function Ruler({ cm, scale = 30 }: { cm: number; scale?: number }) {
  return (
    <div
      className="relative h-14 rounded-lg border-2 border-accent-foreground/40 bg-wood"
      style={{ width: cm * scale + 24 }}
    >
      {Array.from({ length: cm * 10 + 1 }, (_, i) => (
        <div
          key={i}
          className="absolute top-0 bg-foreground"
          style={{ left: 12 + (i * scale) / 10, width: 1, height: i % 10 === 0 ? 22 : i % 5 === 0 ? 15 : 9 }}
        />
      ))}
      {Array.from({ length: cm + 1 }, (_, i) => (
        <span
          key={i}
          className="absolute bottom-1 -translate-x-1/2 text-xs font-bold"
          style={{ left: 12 + i * scale }}
        >
          {i}
        </span>
      ))}
    </div>
  );
}
