import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageTitle, Confetti } from "@/components/Fun";
import { meta, recordActivity } from "@/lib/user";

export const Route = createFileRoute("/_main/refleksi")({
  head: () => meta("Refleksi Akhir", "Refleksi 4F: peristiwa, perasaan, pembelajaran, penerapan."),
  component: Refleksi,
});

const fields = [
  { e: "📅", l: "Peristiwa", q: "Apa yang kamu lakukan hari ini?", c: "bg-pink-soft" },
  { e: "😊", l: "Perasaan", q: "Bagaimana perasaanmu saat belajar?", c: "bg-sky-soft" },
  { e: "💡", l: "Pembelajaran", q: "Apa hal baru yang kamu pelajari?", c: "bg-sun-soft" },
  { e: "🛠️", l: "Penerapan", q: "Bagaimana kamu menggunakan ilmu ini nanti?", c: "bg-pink-soft" },
];

function Refleksi() {
  const [sent, setSent] = useState(false);
  return (
    <div>
      <PageTitle emoji="💭" title="Refleksi Akhir (4F)" sub="Ceritakan pengalaman belajarmu hari ini." />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          const payload = Object.fromEntries(fields.map((f) => [f.l, String(fd.get(f.l) ?? "")]));
          recordActivity("refleksi", null, payload);
          setSent(true);
        }}
        className="grid gap-4 md:grid-cols-2"
      >
        {fields.map((f) => (
          <label key={f.l} className={`card-fun ${f.c} block p-5`}>
            <span className="font-display text-xl font-bold">{f.e} {f.l}</span>
            <span className="block text-sm text-muted-foreground">{f.q}</span>
            <textarea name={f.l} required rows={4} className="field-fun mt-2" />
          </label>
        ))}
        <div className="md:col-span-2">
          <button className="btn-fun text-lg">Kirim Refleksi 💌</button>
        </div>
      </form>
      {sent && (
        <>
          <Confetti />
          <p className="mt-4 rounded-2xl bg-success p-4 font-display text-lg font-semibold text-success-foreground">
            Terima kasih sudah berefleksi! Kamu penjelajah yang hebat 🌟
          </p>
        </>
      )}
    </div>
  );
}
