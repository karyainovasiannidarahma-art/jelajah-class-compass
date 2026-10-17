import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { PageTitle, Ruler } from "@/components/Fun";
import { meta, recordActivity, localDiag } from "@/lib/user";

export const Route = createFileRoute("/_main/diagnostik")({
  head: () => meta("Kenali Kebutuhanmu", "Tes diagnostik singkat tentang mengukur panjang."),
  component: Diag,
});

const soal = [
  { q: "Manakah yang merupakan alat ukur panjang baku?", o: ["Jengkal tangan", "Penggaris", "Langkah kaki", "Pensil"], a: 1 },
  { q: "Satuan sentimeter disingkat menjadi...", o: ["m", "mm", "cm", "km"], a: 2 },
  { q: "Pensil di atas penggaris dimulai dari angka 0 dan berakhir di angka 7. Berapa panjangnya?", o: ["6 cm", "7 cm", "8 cm", "10 cm"], a: 1, ruler: true },
  { q: "Ujung kiri pita di angka 2, ujung kanan di angka 9. Berapa panjang pita?", o: ["9 cm", "11 cm", "7 cm", "2 cm"], a: 2 },
  { q: "1 cm sama dengan berapa mm?", o: ["1 mm", "10 mm", "100 mm", "5 mm"], a: 1 },
];

function Diag() {
  const [ans, setAns] = useState<(number | null)[]>([null, null, null, null, null]);
  const [score, setScore] = useState<number | null>(null);
  useEffect(() => { const d = localDiag(); if (d !== null) setScore(d); }, []);
  const level = score === null ? null : score <= 2 ? 1 : score <= 4 ? 2 : 3;
  const to = level === 1 ? "/level-1" : level === 2 ? "/level-2" : "/level-3";

  return (
    <div>
      <PageTitle emoji="📝" title="Kenali Kebutuhanmu" sub="Jawab 5 soal ini, ya!" />
      <div className="space-y-5">
        {soal.map((s, i) => (
          <div key={i} className="card-fun p-6">
            <p className="mb-3 font-display text-xl font-semibold">
              {i + 1}. {s.q}
            </p>
            {s.ruler && (
              <div className="mb-4 overflow-x-auto">
                <div className="mb-1 ml-3 h-5 rounded-r-full bg-sun" style={{ width: 210 }} />
                <Ruler cm={10} />
              </div>
            )}
            <div className="grid gap-2 sm:grid-cols-2">
              {s.o.map((o, j) => (
                <button
                  key={o}
                  onClick={() => {
                    const n = [...ans];
                    n[i] = j;
                    setAns(n);
                    setScore(null);
                  }}
                  className={`rounded-2xl border-3 px-4 py-3 text-left font-semibold transition ${
                    ans[i] === j ? "border-primary bg-pink-soft" : "border-border bg-card hover:bg-muted"
                  }`}
                >
                  {String.fromCharCode(65 + j)}. {o}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <button
        className="btn-fun mt-6 text-lg"
        disabled={ans.includes(null)}
        onClick={() => {
          const sc = ans.filter((a, i) => a === soal[i]?.a).length;
          setScore(sc);
          localStorage.setItem("jelajah-diag", String(sc));
          const lv = sc <= 2 ? 1 : sc <= 4 ? 2 : 3;
          recordActivity("diagnostik", sc, { info: `Rekomendasi Level ${lv}`, jawaban: ans }).then(() => window.dispatchEvent(new Event("jelajah-update")));
          window.dispatchEvent(new Event("jelajah-update"));
        }}
      >
        Lihat Hasil ✨
      </button>
      {level && (
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="card-fun mt-6 bg-sun-soft p-6">
          <p className="font-display text-2xl font-bold">Skormu: {score} / 5</p>
          {ans.includes(null) && <p className="text-sm text-muted-foreground">Ini hasil tes yang sudah kamu kerjakan. Kamu boleh mengerjakan ulang kalau mau.</p>}
          <p className="mt-1 text-lg">
            {level === 1 && "Tidak apa-apa! Ayo belajar bersama di Level 1: Perlu Pendampingan 🚩"}
            {level === 2 && "Bagus! Lanjutkan ke Level 2: Berkembang 🚀"}
            {level === 3 && "Hebat sekali! Kamu siap ke Level 3: Mahir 👑"}
          </p>
          <Link to={to} className="btn-fun btn-sky mt-4">
            Pergi ke Level {level} →
          </Link>
        </motion.div>
      )}
    </div>
  );
}
