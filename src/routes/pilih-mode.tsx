import { createFileRoute, Link } from "@tanstack/react-router";
import { meta } from "@/lib/user";

export const Route = createFileRoute("/pilih-mode")({
  head: () => meta("Pilih Mode", "Pilih Mode Game atau Mode Belajar untuk belajar mengukur panjang."),
  component: PilihMode,
});

function PilihMode() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-4">
      <h1 className="text-center text-4xl font-bold text-primary">Mau main apa hari ini?</h1>
      <div className="grid w-full max-w-3xl gap-5 sm:grid-cols-2">
        <Link to="/game" className="card-fun block p-8 text-center transition hover:-translate-y-1">
          <div className="text-7xl">🎮</div>
          <h2 className="mt-3 text-2xl font-bold">Mode Game</h2>
          <p className="mt-2 text-muted-foreground">Lari, kumpulkan koin, dan jawab soal!</p>
        </Link>
        <Link to="/beranda" className="card-fun block p-8 text-center transition hover:-translate-y-1">
          <div className="text-7xl">📖</div>
          <h2 className="mt-3 text-2xl font-bold">Mode Belajar</h2>
          <p className="mt-2 text-muted-foreground">Materi, Level 1–3, dan Uji.</p>
        </Link>
      </div>
      <Link to="/" className="text-sm font-semibold text-muted-foreground underline">← Ganti nama</Link>
    </div>
  );
}
