import { createFileRoute } from "@tanstack/react-router";
import { PageTitle, Tabs } from "@/components/Fun";
import { MeasureDemo } from "@/components/level-two/MeasureDemo";
import { MeasureRoom } from "@/components/level-two/MeasureRoom";
import { SelfAssess } from "@/components/SelfAssess";
import { meta } from "@/lib/user";

export const Route = createFileRoute("/_main/level-2")({
  head: () => meta("Level 2: Berkembang", "Belajar membaca penggaris dan menjelajah kamar untuk mengukur benda."),
  component: L2,
});

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
        ]}
      />
      <SelfAssess from="level-2" options={["Cara memakai penggaris", "Mulai dari angka 0", "Membaca angka berkoma (,5)", "Mencari selisih panjang"]} nextTo="/level-3" nextLabel="Lanjut ke Level 3" />
    </div>
  );
}
