import { createFileRoute } from "@tanstack/react-router";
import { PageTitle } from "@/components/Fun";
import { meta } from "@/lib/user";

export const Route = createFileRoute("/_main/materi")({
  head: () => meta("Materi Ajar Lengkap", "Ringkasan materi pengukuran panjang dan konversi satuan."),
  component: Materi,
});

function Materi() {
  return (
    <div>
      <PageTitle emoji="📚" title="Materi Ajar Lengkap" />
      <div className="grid gap-5 md:grid-cols-2">
        <div className="card-fun bg-pink-soft p-6">
          <h2 className="text-2xl font-bold">🔍 Definisi Pengukuran</h2>
          <p className="mt-2">Mengukur adalah membandingkan panjang suatu benda dengan alat ukur. Hasilnya berupa angka dan satuan, misalnya <b>12 cm</b>.</p>
        </div>
        <div className="card-fun bg-sky-soft p-6">
          <h2 className="text-2xl font-bold">📏 Alat Ukur Baku</h2>
          <ul className="mt-2 space-y-1">
            <li><b>Penggaris</b> — untuk benda pendek seperti pensil dan buku.</li>
            <li><b>Meteran Pita</b> — lentur, untuk lingkar pinggang atau panjang kain.</li>
          </ul>
          <p className="mt-2 text-sm text-muted-foreground">Disebut baku karena hasilnya selalu sama siapa pun yang mengukur.</p>
        </div>
        <div className="card-fun bg-sun-soft p-6">
          <h2 className="text-2xl font-bold">✋ Cara Mengukur</h2>
          <ol className="mt-2 list-decimal space-y-1 pl-5">
            <li>Letakkan benda lurus di samping penggaris.</li>
            <li>Tempatkan ujung benda tepat di angka <b>0</b>.</li>
            <li>Lihat angka di ujung lainnya.</li>
            <li>Tulis hasilnya dengan satuan cm.</li>
          </ol>
        </div>
        <div className="card-fun p-6">
          <h2 className="text-2xl font-bold">🪜 Tangga Konversi Satuan</h2>
          <div className="mt-3 space-y-2">
            {["km", "hm", "dam", "m", "dm", "cm", "mm"].map((u, i) => (
              <div key={u} className="rounded-xl bg-sky px-3 py-1 font-display font-bold text-primary-foreground" style={{ marginLeft: i * 18, width: 70 }}>
                {u}
              </div>
            ))}
          </div>
          <p className="mt-3 text-sm">Turun 1 anak tangga: <b>× 10</b>. Naik 1 anak tangga: <b>: 10</b>.<br />1 m = 100 cm · 1 cm = 10 mm</p>
        </div>
      </div>
    </div>
  );
}
