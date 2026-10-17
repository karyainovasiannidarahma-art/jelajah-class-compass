import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { PageTitle, Tabs, ConversionQuiz, Confetti } from "@/components/Fun";
import { meta, recordActivity, isDone, markDone } from "@/lib/user";

export const Route = createFileRoute("/_main/modul-b")({
  head: () => meta("Modul B: Konversi Satuan", "Belajar mengubah satuan m, cm, dan mm dengan tangga satuan."),
  component: ModulB,
});

const prasyarat = [
  { q: "Tali Dina panjangnya 2 m 35 cm. Berapa cm panjang tali Dina?", o: ["235 cm", "2035 cm", "37 cm", "253 cm"], a: 0, sulit: true },
  { q: "1 m = ... cm", o: ["10", "100", "1000", "1"], a: 1 },
  { q: "3 cm = ... mm", o: ["3", "300", "30", "13"], a: 2 },
  { q: "200 cm = ... m", o: ["20", "2", "200", "2000"], a: 1 },
  { q: "Mana yang lebih panjang?", o: ["1 m", "90 cm", "Sama panjang", "Tidak tahu"], a: 0 },
];

function Gate({ onPass }: { onPass: () => void }) {
  const [ans, setAns] = useState<(number | null)[]>(prasyarat.map(() => null));
  const [res, setRes] = useState<number | null>(null);
  return (
    <div className="space-y-4">
      <div className="card-fun bg-sun-soft p-5">
        🔐 <b>Modul B masih terkunci.</b> Selesaikan Modul A (Level 1–3 sampai self-asesmen), atau jawab <b>semua 5 soal prasyarat</b> ini dengan benar.
      </div>
      {prasyarat.map((s, i) => (
        <div key={i} className="card-fun p-5">
          <p className="mb-3 font-display text-lg font-semibold">{i + 1}. {s.q} {s.sulit && <span className="text-sm text-primary">⭐ soal tantangan</span>}</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {s.o.map((o, j) => (
              <button key={o} onClick={() => { const n = [...ans]; n[i] = j; setAns(n); setRes(null); }}
                className={`rounded-2xl border-3 px-4 py-2 text-left font-semibold ${ans[i] === j ? "border-primary bg-pink-soft" : "border-border bg-card"}`}>{o}</button>
            ))}
          </div>
        </div>
      ))}
      <button className="btn-fun" disabled={ans.includes(null)} onClick={() => {
        const sc = ans.filter((a, i) => a === prasyarat[i]?.a).length;
        setRes(sc);
        recordActivity("prasyarat-b", sc, { info: sc === 5 ? "Lulus prasyarat Modul B" : `Benar ${sc}/5` });
        if (sc === 5) { markDone("prasyarat-b"); onPass(); }
      }}>Periksa ✨</button>
      {res !== null && res < 5 && <p className="rounded-2xl bg-muted p-3 font-semibold">Benar {res} dari 5. Ayo pelajari Modul A dulu, lalu coba lagi! 💪</p>}
    </div>
  );
}

function Tangga() {
  const steps = [
    { u: "m", c: "bg-pink-soft" },
    { u: "cm", c: "bg-sun-soft" },
    { u: "mm", c: "bg-sky-soft" },
  ];
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">🪜 Tangga Satuan</h2>
      <div className="space-y-2">
        {steps.map((s, i) => (
          <motion.div key={s.u} initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.2 }}
            className={`rounded-2xl ${s.c} p-4 font-display text-2xl font-bold`} style={{ marginLeft: i * 60, width: 160 }}>{s.u}</motion.div>
        ))}
      </div>
      <p>⬇️ <b>Turun tangga</b> = dikali: m → cm kali 100, cm → mm kali 10.</p>
      <p>⬆️ <b>Naik tangga</b> = dibagi: mm → cm bagi 10, cm → m bagi 100.</p>
    </div>
  );
}

function Kantong() {
  const [m, setM] = useState(1);
  const [cm, setCm] = useState(50);
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">🎒 Kantong m dan cm</h2>
      <div className="flex flex-wrap gap-4">
        <label className="rounded-2xl bg-pink-soft p-4 font-semibold">Meter: <input type="number" min={0} max={9} className="field-fun w-20" value={m} onChange={(e) => setM(Number(e.target.value))} /></label>
        <label className="rounded-2xl bg-sun-soft p-4 font-semibold">Sentimeter: <input type="number" min={0} max={99} className="field-fun w-24" value={cm} onChange={(e) => setCm(Number(e.target.value))} /></label>
      </div>
      <div className="rounded-2xl bg-sky-soft p-4 font-display text-2xl font-bold">
        {m} m {cm} cm = {m} × 100 + {cm} = {m * 100 + cm} cm
      </div>
    </div>
  );
}

function Banding() {
  const [v, setV] = useState<string | null>(null);
  useEffect(() => { if (v === "a") { recordActivity("modul-b", 1, { info: "Menyelesaikan Modul B (membandingkan panjang)" }); markDone("modul-b"); } }, [v]);
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">📐 Mana yang Lebih Panjang?</h2>
      <p className="text-lg">Pita Ani <b>1 m 20 cm</b>. Pita Budi <b>110 cm</b>. Pita siapa yang lebih panjang?</p>
      <div className="flex gap-2">
        <button className="btn-fun" onClick={() => setV("a")}>Ani</button>
        <button className="btn-fun btn-sky" onClick={() => setV("b")}>Budi</button>
      </div>
      {v === "a" && (<><Confetti /><p className="rounded-2xl bg-success p-3 font-semibold text-success-foreground">🎉 Benar! 1 m 20 cm = 120 cm, lebih panjang dari 110 cm.</p></>)}
      {v === "b" && <p className="rounded-2xl bg-muted p-3">Ubah dulu 1 m 20 cm menjadi cm, lalu bandingkan 😉</p>}
    </div>
  );
}

function ModulB() {
  const [open, setOpen] = useState(false);
  useEffect(() => { setOpen(isDone("level-3") || isDone("prasyarat-b")); }, []);
  return (
    <div>
      <PageTitle emoji="🪜" title="Modul B: Konversi Satuan" sub="Mengubah m, cm, dan mm" />
      {!open ? <Gate onPass={() => setOpen(true)} /> : (
        <Tabs tabs={[
          { label: "Tangga Satuan", content: <Tangga /> },
          { label: "Kantong m & cm", content: <Kantong /> },
          { label: "Latihan", content: <ConversionQuiz items={[{ q: "5 m", a: 500, unit: "cm" }, { q: "60 mm", a: 6, unit: "cm" }, { q: "1 m 75 cm", a: 175, unit: "cm" }]} /> },
          { label: "Bandingkan", content: <Banding /> },
        ]} />
      )}
    </div>
  );
}
