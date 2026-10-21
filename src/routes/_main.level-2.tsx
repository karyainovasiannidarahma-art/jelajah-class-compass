import { createFileRoute } from "@tanstack/react-router";
import { PageTitle, Tabs } from "@/components/Fun";
import { MeasureDemo } from "@/components/level-two/MeasureDemo";
import { MeasureRoom } from "@/components/level-two/MeasureRoom";
import { HelperBot } from "@/components/HelperBot";
import { meta } from "@/lib/user";

export const Route = createFileRoute("/_main/level-2")({
  head: () => meta("Level 2: Berkembang", "Belajar membaca penggaris dan menjelajah kamar untuk mengukur benda."),
  component: L2,
});

function L2() {
  return (
    <div className="pb-24">
      <PageTitle emoji="🚀" title="Level 2: Berkembang" sub="Kamu sudah hebat, ayo makin teliti!" />
      <Tabs
        tabs={[
          {
            label: "Cara Mengukur",
            content: <MeasureDemo />,
          },
          { label: "Find & Measure", content: <MeasureRoom /> },
        ]}
      />
      <HelperBot tips={[
        "Selalu mulai mengukur dari angka 0!",
        "Cari benda lewat tanda 🔍 di kamar, lalu baca angka di ujung kanannya.",
        "Benda kecil diukur dengan cm, benda besar dengan m.",
        "Di Cara Mengukur, garis tengah antara 4 dan 5 dibaca 4,5 cm.",
        "Setelah enam benda terukur, gunakan catatan hasilmu untuk menjawab tantangan.",
        "Untuk mencari selisih, kurangi panjang yang lebih besar dengan yang lebih kecil.",
      ]} />
    </div>
  );
}
