import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageTitle, Tabs, ConversionQuiz, Confetti } from "@/components/Fun";
import { useEffect } from "react";
import { meta, recordActivity } from "@/lib/user";
import { SelfAssess } from "@/components/SelfAssess";

export const Route = createFileRoute("/_main/level-3")({
  head: () => meta("Level 3: Mahir", "Tantangan HOTS penggaris patah dan konversi satuan kompleks."),
  component: L3,
});

function Hots() {
  const [v, setV] = useState("");
  const ok = v.trim() === "8";
  useEffect(() => {
    if (ok) recordActivity("level-3", 1, { info: "Menjawab tantangan penggaris patah (8 cm)" });
  }, [ok]);
  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-pink-soft p-5 text-lg">
        😱 <b>Penggaris Bu Rini patah!</b> Ujung kiri pita di angka <b>3</b>, ujung kanan di angka <b>11</b>. Berapa cm panjang kain itu?
      </div>
      <div className="flex items-center gap-3">
        <input type="number" className="field-fun w-36 text-xl" value={v} onChange={(e) => setV(e.target.value)} placeholder="?" />
        <span className="font-display text-xl font-semibold">cm</span>
      </div>
      {ok && (
        <>
          <Confetti />
          <p className="rounded-2xl bg-success p-4 font-display text-xl font-semibold text-success-foreground">
            🎉 Luar biasa! 11 − 3 = 8 cm. Kamu Mahir!
          </p>
        </>
      )}
      {v && !ok && <p className="text-muted-foreground">Hmm, coba lagi. Petunjuk: kurangi angka kanan dengan angka kiri 😉</p>}
    </div>
  );
}

function L3() {
  return (
    <div>
      <PageTitle emoji="👑" title="Level 3: Mahir" sub="Tantangan untuk para juara!" />
      <Tabs
        tabs={[
          { label: "Tantangan (HOTS)", content: <Hots /> },
          {
            label: "Konversi",
            content: (
              <ConversionQuiz
                items={[
                  { q: "3 m", a: 300, unit: "cm" },
                  { q: "4 cm", a: 40, unit: "mm" },
                  { q: "2 m", a: 200, unit: "cm" },
                ]}
              />
            ),
          },
        ]}
      />
      <SelfAssess from="level-3" options={["Mengukur penggaris patah", "Mengurangi angka ujung", "1 m = 100 cm", "Mengukur dengan teliti"]} nextTo="/modul-b" nextLabel="Buka Modul B: Konversi Satuan" />
    </div>
  );
}
