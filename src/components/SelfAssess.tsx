import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { recordActivity, markDone } from "@/lib/user";

const feel = [
  { e: "😊", l: "Sangat paham" },
  { e: "🤔", l: "Masih ragu" },
  { e: "🙋", l: "Butuh bantuan" },
];

export function SelfAssess({ from, options, nextTo, nextLabel }: { from: string; options: string[]; nextTo: "/level-3" | "/modul-b"; nextLabel: string }) {
  const [pick, setPick] = useState<string[]>([]);
  const [f, setF] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  return (
    <div className="card-fun mt-8 space-y-4 bg-sky-soft p-6">
      <h2 className="text-2xl font-bold">💡 Apa yang Aku Pahami?</h2>
      <p>Pilih hal yang sudah kamu pahami (boleh lebih dari satu):</p>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button key={o} onClick={() => setPick(pick.includes(o) ? pick.filter((x) => x !== o) : [...pick, o])}
            className={`rounded-2xl border-3 px-4 py-2 font-semibold ${pick.includes(o) ? "border-primary bg-pink-soft" : "border-border bg-card"}`}>
            {pick.includes(o) ? "✅ " : ""}{o}
          </button>
        ))}
      </div>
      <p>Bagaimana perasaanmu?</p>
      <div className="flex flex-wrap gap-2">
        {feel.map((x) => (
          <button key={x.l} onClick={() => setF(x.l)} className={`rounded-2xl border-3 px-4 py-2 text-lg font-semibold ${f === x.l ? "border-primary bg-sun-soft" : "border-border bg-card"}`}>
            {x.e} {x.l}
          </button>
        ))}
      </div>
      {!done ? (
        <button className="btn-fun" disabled={!f || pick.length === 0} onClick={() => {
          recordActivity("asesmen", pick.length, { from, info: `Setelah ${from}: ${f}. Paham: ${pick.join(", ")}` });
          markDone(from);
          setDone(true);
        }}>Simpan ✨</button>
      ) : (
        <Link to={nextTo} className="btn-fun btn-sky">{nextLabel} →</Link>
      )}
    </div>
  );
}
