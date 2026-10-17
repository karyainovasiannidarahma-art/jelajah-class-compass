import { createFileRoute, Link } from "@tanstack/react-router";
import { meta } from "@/lib/user";

export const Route = createFileRoute("/_main/beranda")({
  head: () => meta("Beranda", "Mulai petualangan mengukur panjang dengan sentimeter."),
  component: Home,
});

const steps = [
  { to: "/diagnostik", e: "📝", t: "Tes Diagnostik", d: "Kenali kemampuanmu dulu", c: "bg-pink-soft" },
  { to: "/materi", e: "📚", t: "Materi", d: "Baca ringkasan materi", c: "bg-sky-soft" },
  { to: "/level-1", e: "🎮", t: "Latihan Level", d: "Pilih level sesuai hasilmu", c: "bg-sun-soft" },
  { to: "/uji", e: "🎯", t: "Uji Final", d: "Tunjukkan kemampuanmu", c: "bg-pink-soft" },
] as const;

function Home() {
  return (
    <div>
      <div className="card-fun mb-8 bg-sun-soft p-8">
        <h1 className="text-4xl font-bold">Selamat datang, Penjelajah! 🌈</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Hari ini kita belajar mengukur panjang benda dengan satuan sentimeter (cm). Ikuti langkahnya ya!
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {steps.map((s, i) => (
          <Link key={s.to} to={s.to} className={`card-fun ${s.c} p-6 transition hover:-translate-y-1`}>
            <div className="text-4xl">{s.e}</div>
            <p className="mt-2 font-display text-xl font-bold">
              {i + 1}. {s.t}
            </p>
            <p className="text-muted-foreground">{s.d}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
