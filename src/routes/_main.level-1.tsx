import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useMotionValue } from "framer-motion";
import { PageTitle, Ruler } from "@/components/Fun";
import { HelperBot } from "@/components/HelperBot";
import { meta, recordActivity, markDone, isDone } from "@/lib/user";
import { useClass } from "@/lib/class-state";
import { celebrate, installGlobalPop, playPopSound } from "@/lib/fx";

export const Route = createFileRoute("/_main/level-1")({
  head: () => meta("Level 1: Perlu Pendampingan", "Nonton video, cocokkan alat ukur, dan mengukur benda dengan penggaris virtual."),
  component: L1,
});

const bounce = { whileHover: { scale: 1.04 }, whileTap: { scale: 0.92, y: 3 } };
const DEFAULT_VIDEO = "https://www.youtube.com/embed/Fq1r6jK8fJk";

function toEmbed(url: string) {
  const m = url.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
  return m ? `https://www.youtube.com/embed/${m[1]}` : url;
}

/* ---------- Stage 1: Video ---------- */
function Video({ onNext }: { onNext: () => void }) {
  const cls = useClass();
  const custom = cls?.video_url || cls?.extras?.find((e) => e.url && /video/i.test(e.judul ?? ""))?.url;
  const src = toEmbed(custom || DEFAULT_VIDEO);
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">🎬 Yuk, tonton videonya dulu!</h2>
      <div className="aspect-video overflow-hidden rounded-3xl border-4 border-sky bg-muted shadow-lg">
        <iframe src={src} title="Video pengukuran" className="h-full w-full" allowFullScreen />
      </div>
      <motion.button {...bounce} onClick={onNext} className="w-full rounded-3xl bg-primary px-6 py-4 font-display text-xl font-bold text-primary-foreground shadow-[0_6px_0_var(--color-foreground)]">
        Aku Sudah Nonton! 🚀
      </motion.button>
    </div>
  );
}

/* ---------- Stage 2: Match tools ---------- */
const TOOLS = [
  { id: "penggaris", label: "Penggaris", emoji: "📏", bg: "bg-sun-soft" },
  { id: "pita", label: "Meteran Pita", emoji: "🎀", bg: "bg-pink-soft" },
  { id: "bangunan", label: "Meteran Bangunan", emoji: "🏗️", bg: "bg-sky-soft" },
];
const OBJECTS = [
  { id: "buku", label: "Buku", emoji: "📘", tool: "penggaris" },
  { id: "pensil", label: "Pensil", emoji: "✏️", tool: "penggaris" },
  { id: "baju", label: "Baju", emoji: "👕", tool: "pita" },
  { id: "kain", label: "Kain", emoji: "🧵", tool: "pita" },
  { id: "meja", label: "Meja", emoji: "🪑", tool: "bangunan" },
  { id: "lemari", label: "Lemari", emoji: "🚪", tool: "bangunan" },
];

function Match({ onNext }: { onNext: () => void }) {
  const [sel, setSel] = useState<string | null>(null);
  const [placed, setPlaced] = useState<Record<string, string>>({});
  const [wrong, setWrong] = useState<string | null>(null);
  const [msg, setMsg] = useState("Pilih benda, lalu ketuk alat ukur yang cocok!");
  const all = Object.keys(placed).length === OBJECTS.length;

  function drop(toolId: string, objId = sel) {
    if (!objId) return setMsg("Pilih bendanya dulu ya 😊");
    const o = OBJECTS.find((x) => x.id === objId)!;
    if (o.tool === toolId) {
      setPlaced((p) => ({ ...p, [objId]: toolId }));
      setMsg(`Hebat! ${o.label} diukur dengan ${TOOLS.find((t) => t.id === toolId)!.label} ✅`);
      celebrate();
    } else {
      setWrong(objId);
      setTimeout(() => setWrong(null), 500);
      setMsg(`Hmm, ${o.label} ${o.tool === "penggaris" ? "itu kecil, cocok pakai penggaris" : o.tool === "pita" ? "lentur, cocok pakai meteran pita" : "besar, cocok pakai meteran bangunan"} 🤔`);
    }
    setSel(null);
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">🧩 Cocokkan Benda & Alat Ukur</h2>
      <p className="rounded-2xl bg-sun-soft p-3 font-display font-semibold">{msg}</p>
      <div className="grid grid-cols-3 gap-3">
        {OBJECTS.filter((o) => !placed[o.id]).map((o) => (
          <motion.button
            key={o.id}
            {...bounce}
            draggable
            onDragStart={(e) => { (e as unknown as DragEvent).dataTransfer?.setData("text", o.id); setSel(o.id); }}
            animate={wrong === o.id ? { x: [0, -10, 10, -10, 0] } : {}}
            onClick={() => setSel(o.id)}
            className={`rounded-3xl border-4 bg-card p-3 font-display font-bold shadow-md ${sel === o.id ? "border-primary" : "border-transparent"}`}
          >
            <div className="text-4xl">{o.emoji}</div>{o.label}
          </motion.button>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {TOOLS.map((t) => (
          <motion.div
            key={t.id}
            {...bounce}
            data-pop
            role="button"
            onClick={() => drop(t.id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => drop(t.id, e.dataTransfer.getData("text"))}
            className={`min-h-36 cursor-pointer rounded-3xl border-4 border-dashed border-foreground/20 p-3 ${t.bg}`}
          >
            <div className="text-center font-display text-lg font-bold">{t.emoji} {t.label}</div>
            <div className="mt-2 flex flex-wrap justify-center gap-1">
              {OBJECTS.filter((o) => placed[o.id] === t.id).map((o) => (
                <motion.span key={o.id} initial={{ scale: 0 }} animate={{ scale: 1 }} className="rounded-full bg-card px-2 py-1 text-sm font-bold">
                  {o.emoji} {o.label}
                </motion.span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
      {all && (
        <motion.button {...bounce} initial={{ scale: 0 }} animate={{ scale: 1 }} onClick={onNext} className="w-full rounded-3xl bg-success px-6 py-4 font-display text-xl font-bold text-success-foreground">
          Semua cocok! Lanjut Mengukur ➡️
        </motion.button>
      )}
    </div>
  );
}

/* ---------- Stage 3: Measure ---------- */
const SCALE = 30;
const LEFT = 30;
const ITEMS = [
  { label: "Penghapus", emoji: "🧽", cm: 4, cls: "bg-pink-soft" },
  { label: "Spidol", emoji: "🖊️", cm: 12, cls: "bg-sky" },
  { label: "Pensil", emoji: "✏️", cm: 9, cls: "bg-sun" },
  { label: "Buku", emoji: "📘", cm: 15, cls: "bg-primary" },
  { label: "Tempat Pensil", emoji: "👝", cm: 18, cls: "bg-wood" },
];

function ItemArt({ label, w }: { label: string; w: number }) {
  const h = 40;
  const common = { width: w, height: h, viewBox: `0 0 ${w} ${h}` };
  if (label === "Pensil")
    return (<svg {...common}><rect x={0} y={12} width={10} height={16} rx={3} fill="#f9a8d4" /><rect x={10} y={12} width={6} height={16} fill="#cbd5e1" /><rect x={16} y={12} width={w - 40} height={16} fill="#fcd34d" /><rect x={16} y={18} width={w - 40} height={4} fill="#fbbf24" /><polygon points={`${w - 24},12 ${w - 24},28 ${w},20`} fill="#f5d0a9" /><polygon points={`${w - 8},17 ${w - 8},23 ${w},20`} fill="#334155" /></svg>);
  if (label === "Spidol")
    return (<svg {...common}><rect x={0} y={10} width={w * 0.3} height={20} rx={6} fill="#ef4444" /><rect x={w * 0.3} y={11} width={w * 0.62} height={18} rx={4} fill="#f8fafc" stroke="#94a3b8" /><rect x={w * 0.45} y={11} width={w * 0.3} height={18} fill="#fecaca" /><polygon points={`${w * 0.92},13 ${w * 0.92},27 ${w},20`} fill="#ef4444" /></svg>);
  if (label === "Penghapus")
    return (<svg {...common}><rect x={0} y={8} width={w} height={24} rx={5} fill="#fbcfe8" /><rect x={w * 0.25} y={8} width={w * 0.5} height={24} fill="#60a5fa" /><text x={w / 2} y={24} fontSize={9} textAnchor="middle" fill="#fff" fontWeight="bold">ERASE</text></svg>);
  if (label === "Buku")
    return (<svg {...common}><rect x={0} y={2} width={w} height={36} rx={4} fill="#3b82f6" /><rect x={0} y={2} width={10} height={36} fill="#1d4ed8" /><rect x={w * 0.3} y={10} width={w * 0.5} height={10} rx={3} fill="#fef3c7" /><circle cx={w * 0.55} cy={29} r={5} fill="#fde047" /></svg>);
  return (<svg {...common}><rect x={0} y={4} width={w} height={32} rx={14} fill="#a78bfa" /><line x1={8} y1={12} x2={w - 8} y2={12} stroke="#6d28d9" strokeWidth={2} strokeDasharray="4 3" /><rect x={w - 22} y={8} width={8} height={10} rx={2} fill="#facc15" /><circle cx={w / 2} cy={25} r={5} fill="#f9a8d4" /></svg>);
}

function Measure({ onDone }: { onDone: () => void }) {
  const [touched, setTouched] = useState(false);
  const [idx, setIdx] = useState(0);
  const [ans, setAns] = useState("");
  const [fb, setFb] = useState<{ ok: boolean; t: string } | null>(null);
  const [aligned, setAligned] = useState(false);
  const x = useMotionValue(0);
  const item = ITEMS[idx]!;
  const START = 120;

  useEffect(() => { x.set(0); setAligned(false); setAns(""); setFb(null); }, [idx, x]);

  function check() {
    if (!aligned) return setFb({ ok: false, t: "Geser dulu angka 0 penggaris ke ujung kiri benda ya! 📏" });
    if (Number(ans) === item.cm) {
      setFb({ ok: true, t: `Benar! Panjang ${item.label} ${item.cm} cm 🎉` });
      celebrate();
      setTimeout(() => (idx + 1 < ITEMS.length ? setIdx(idx + 1) : onDone()), 1400);
    } else setFb({ ok: false, t: "Belum tepat. Lihat angka di ujung kanan benda, ya! 🔍" });
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">📏 Mari Mengukur! ({idx + 1}/{ITEMS.length})</h2>
      <p className="rounded-2xl bg-sun-soft p-3 font-display font-semibold">
        Geser penggaris sampai angka 0 pas di ujung kiri {item.emoji} {item.label}, lalu tulis panjangnya.
      </p>
      <div className="relative h-44 overflow-x-auto overflow-y-hidden rounded-3xl bg-muted">
        <div className="relative h-full" style={{ width: LEFT + 21 * SCALE + START }}>
          <motion.div key={idx} initial={{ x: -40, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
            className="absolute drop-shadow-md"
            style={{ left: LEFT, top: 24, width: item.cm * SCALE }} title={item.label}>
            <ItemArt label={item.label} w={item.cm * SCALE} />
          </motion.div>
          <AnimatePresence>
            {!touched && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: [0, -4, 0] }} exit={{ opacity: 0, scale: 0.8 }}
                transition={{ y: { repeat: Infinity, duration: 1.2 } }}
                className="absolute z-10 rounded-2xl border-2 border-sky bg-card px-3 py-1 font-display text-sm font-bold shadow-lg"
                style={{ left: LEFT + START + 40, top: 2 }}>
                👆 Geser penggaris ini sampai angka 0 pas di ujung kiri benda ya!
              </motion.div>
            )}
          </AnimatePresence>
          <motion.div
            drag="x" dragMomentum={false} dragConstraints={{ left: -START, right: 200 }}
            style={{ x, left: LEFT + START - 12, top: 76 }}
            onDragStart={() => setTouched(true)}
            onDragEnd={() => {
              const diff = START + x.get();
              if (Math.abs(diff) < 12) { x.set(-START); setAligned(true); playPopSound(); setFb({ ok: true, t: "Pas! Sekarang baca angkanya 👀" }); }
              else setAligned(false);
            }}
            className="absolute cursor-grab active:cursor-grabbing"
          >
            <motion.div
              animate={touched ? { scale: 1, y: 0 } : { scale: [1, 1.05, 1], y: [0, -6, 0] }}
              transition={touched ? {} : { repeat: Infinity, duration: 1.1 }}
              style={{ filter: touched ? "none" : "drop-shadow(0 8px 10px rgba(0,0,0,0.25))" }}
            >
              <Ruler cm={20} scale={SCALE} />
            </motion.div>
          </motion.div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <motion.input animate={fb && !fb.ok ? { x: [0, -8, 8, 0] } : {}} type="number" value={ans} onChange={(e) => setAns(e.target.value)}
          placeholder="?" className="w-28 rounded-2xl border-4 border-sky bg-card p-3 text-center font-display text-2xl font-bold" />
        <span className="font-display text-xl font-bold">cm</span>
        <motion.button {...bounce} onClick={check} className="rounded-3xl bg-primary px-6 py-3 font-display text-lg font-bold text-primary-foreground">
          Cek Pengukuranku ✔️
        </motion.button>
      </div>
      <AnimatePresence>
        {fb && (
          <motion.p initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }}
            className={`rounded-2xl p-3 font-display text-lg font-semibold ${fb.ok ? "bg-success text-success-foreground" : "bg-pink-soft"}`}>
            {fb.t}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

function L1() {
  const [stage, setStage] = useState(0);
  const [win, setWin] = useState(false);
  const [review, setReview] = useState(false);
  const alreadyDone = isDone("level-1");
  useEffect(() => { installGlobalPop(); }, []);

  if (alreadyDone && !review && !win) {
    return (
      <div className="pb-24">
        <PageTitle emoji="🚩" title="Level 1: Perlu Pendampingan" sub="Pelan-pelan saja, kita belajar bersama!" />
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="rounded-3xl bg-card p-6 text-center shadow-lg">
          <div className="text-6xl">🏆</div>
          <h3 className="mt-2 text-2xl font-bold">Level 1 sudah selesai!</h3>
          <p className="mt-2">Kamu sudah menyelesaikan level ini. Progresmu tersimpan, tidak perlu mengulang dari awal. 🎉</p>
          <div className="mt-4 flex flex-col gap-3">
            <Link to="/level-2" className="rounded-3xl bg-primary px-6 py-3 font-display text-lg font-bold text-primary-foreground">
              Lanjut ke Level 2 ➡️
            </Link>
            <button onClick={() => setReview(true)} className="rounded-3xl border-4 border-border bg-muted px-6 py-3 font-display text-lg font-bold">
              🔁 Ulangi untuk Latihan
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  function finish() {
    markDone("level-1");
    recordActivity("level-1", 1, { info: "Menyelesaikan Level 1: video, mencocokkan alat ukur, mengukur 5 benda" });
    celebrate(true);
    setWin(true);
  }

  const steps = ["🎬 Video", "🧩 Cocokkan", "📏 Mengukur"];
  return (
    <div className="pb-24">
      <PageTitle emoji="🚩" title="Level 1: Perlu Pendampingan" sub="Pelan-pelan saja, kita belajar bersama!" />
      <div className="mb-5 flex gap-2">
        {steps.map((s, i) => (
          <div key={s} className={`flex-1 rounded-full p-2 text-center font-display text-sm font-bold ${i <= stage ? "bg-primary text-primary-foreground" : "bg-muted"}`}>{s}</div>
        ))}
      </div>
      <motion.div key={stage} initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="rounded-3xl bg-card p-5 shadow-lg">
        {stage === 0 && <Video onNext={() => setStage(1)} />}
        {stage === 1 && <Match onNext={() => setStage(2)} />}
        {stage === 2 && <Measure onDone={finish} />}
      </motion.div>

      <AnimatePresence>
        {win && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4">
            <motion.div initial={{ scale: 0.5, rotate: -6 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring" }}
              className="max-w-sm rounded-3xl bg-card p-6 text-center shadow-2xl">
              <div className="text-6xl">🏆</div>
              <h3 className="mt-2 text-3xl font-bold">Wah kamu hebat!</h3>
              <p className="mt-2">Level 1 selesai. Level 2 sudah terbuka untukmu! 🔓</p>
              <Link to="/level-2" className="mt-4 block rounded-3xl bg-primary px-6 py-3 font-display text-lg font-bold text-primary-foreground">
                Ke Level 2 ➡️
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <HelperBot tips={[
        "Tonton videonya sampai habis, ya!",
        "Benda kecil ➜ penggaris. Benda lentur ➜ meteran pita. Benda besar ➜ meteran bangunan.",
        "Selalu mulai mengukur dari angka 0!",
        "Lihat angka di ujung kanan benda untuk tahu panjangnya.",
      ]} />
    </div>
  );
}
