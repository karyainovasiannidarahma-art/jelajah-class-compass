import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { PageTitle, Tabs, ConversionQuiz, Ruler } from "@/components/Fun";
import { SelfAssess } from "@/components/SelfAssess";
import { meta, recordActivity } from "@/lib/user";

export const Route = createFileRoute("/_main/level-2")({
  head: () => meta("Level 2: Berkembang", "Latihan presisi, mencari selisih panjang, dan konversi satuan."),
  component: L2,
});

function Selisih() {
  const [a, setA] = useState(12);
  const [b, setB] = useState(7);
  const big = a >= b;
  return (
    <div className="space-y-5">
      {[
        { l: "Pita Merah (A)", v: a, s: setA, c: "bg-box-red", acc: "accent-box-red" },
        { l: "Pita Biru (B)", v: b, s: setB, c: "bg-box-blue", acc: "accent-box-blue" },
      ].map((r) => (
        <div key={r.l}>
          <div className="mb-1 flex justify-between font-display font-semibold">
            <span>{r.l}</span>
            <span>{r.v} cm</span>
          </div>
          <input type="range" min={1} max={15} value={r.v} onChange={(e) => r.s(Number(e.target.value))} className={`w-full ${r.acc}`} />
          <motion.div className={`mt-2 h-10 rounded-xl ${r.c}`} animate={{ width: `${r.v * 5}%` }} />
        </div>
      ))}
      <div className="rounded-2xl bg-sun-soft p-4 font-display text-2xl font-bold">
        Selisih = {big ? `A − B = ${a} − ${b}` : `B − A = ${b} − ${a}`} = {Math.abs(a - b)} cm
      </div>
    </div>
  );
}

const benda = [
  { n: "✏️ Pensil", cm: 7 },
  { n: "🖍️ Krayon", cm: 4 },
  { n: "🔑 Kunci", cm: 5 },
  { n: "🥄 Sendok", cm: 9 },
];

function FindMeasure() {
  const [i, setI] = useState(0);
  const [msg, setMsg] = useState("");
  const b = benda[i % benda.length]!;
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">🔍 Find & Measure: Harta Karun</h2>
      <p>Lihat ujung benda di penggaris. Berapa cm panjangnya?</p>
      <p className="font-display text-xl font-semibold">{b.n}</p>
      <div className="overflow-x-auto">
        <div className="mb-1 ml-3 h-5 rounded-r-full bg-sun" style={{ width: b.cm * 30 }} />
        <Ruler cm={10} />
      </div>
      <div className="flex flex-wrap gap-2">
        {[b.cm - 1, b.cm, b.cm + 1].map((v) => (
          <button key={v} className="rounded-2xl border-3 border-border bg-card px-5 py-2 font-display text-lg font-bold" onClick={() => {
            if (v === b.cm) { setMsg(`🎉 Benar! ${b.n} panjangnya ${b.cm} cm.`); if (i === benda.length - 1) recordActivity("level-2", benda.length, { info: "Menyelesaikan Find & Measure" }); setTimeout(() => { setI(i + 1); setMsg(""); }, 1200); }
            else setMsg("Hmm, lihat lagi angka di ujung benda 😉");
          }}>{v} cm</button>
        ))}
      </div>
      {msg && <p className="rounded-2xl bg-sun-soft p-3 font-semibold">{msg}</p>}
      <p className="text-sm text-muted-foreground">Benda ke-{(i % benda.length) + 1} dari {benda.length}</p>
    </div>
  );
}

function L2() {
  return (
    <div>
      <PageTitle emoji="🚀" title="Level 2: Berkembang" sub="Kamu sudah hebat, ayo makin teliti!" />
      <Tabs
        tabs={[
          {
            label: "Cara Mengukur",
            content: (
              <div className="space-y-3">
                <h2 className="text-2xl font-bold">Mengukur dengan Presisi 🎯</h2>
                <ul className="list-disc space-y-1 pl-5">
                  <li>Mata harus tegak lurus di atas angka, jangan miring.</li>
                  <li>Benda tidak boleh bergeser saat diukur.</li>
                  <li>Jika ujung benda di antara dua angka, pilih angka yang paling dekat.</li>
                </ul>
              </div>
            ),
          },
          { label: "Find & Measure", content: <FindMeasure /> },
          { label: "Mencari Selisih", content: <Selisih /> },
          {
            label: "Konversi Satuan",
            content: (
              <ConversionQuiz
                items={[
                  { q: "2 cm", a: 20, unit: "mm" },
                  { q: "50 mm", a: 5, unit: "cm" },
                ]}
              />
            ),
          },
        ]}
      />
      <SelfAssess from="level-2" options={["Cara memakai penggaris", "Mulai dari angka 0", "Mencari selisih panjang", "1 cm = 10 mm"]} nextTo="/level-3" nextLabel="Lanjut ke Level 3" />
    </div>
  );
}
