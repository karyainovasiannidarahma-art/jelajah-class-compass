import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { PageTitle, Tabs, ConversionQuiz } from "@/components/Fun";
import { MeasureDemo } from "@/components/level-two/MeasureDemo";
import { MeasureRoom } from "@/components/level-two/MeasureRoom";
import { SelfAssess } from "@/components/SelfAssess";
import { meta } from "@/lib/user";

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

function L2() {
  return (
    <div>
      <PageTitle emoji="🚀" title="Level 2: Berkembang" sub="Kamu sudah hebat, ayo makin teliti!" />
      <Tabs
        tabs={[
          {
            label: "Cara Mengukur",
            content: <MeasureDemo />,
          },
          { label: "Find & Measure", content: <MeasureRoom /> },
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
