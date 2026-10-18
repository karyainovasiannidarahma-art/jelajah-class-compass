import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Masuk Guru — Jelajah Sentimeter" },
      { name: "description", content: "Halaman masuk guru untuk mengelola token kelas dan melihat hasil belajar siswa." },
      { property: "og:title", content: "Masuk Guru — Jelajah Sentimeter" },
      { property: "og:description", content: "Kelola token kelas dan pantau hasil belajar siswa." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Auth,
});

function Auth() {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const nav = useNavigate();
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { if (data.session) nav({ to: "/guru" }); });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => { if (s) nav({ to: "/guru" }); });
    return () => sub.subscription.unsubscribe();
  }, [nav]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-sun-soft p-4">
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setMsg("");
          setBusy(true);
          if (mode === "in") {
            const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
            setBusy(false);
            if (error) return setMsg("Email atau password salah.");
            nav({ to: "/guru" });
          } else {
            const { error } = await supabase.auth.signUp({ email, password: pw, options: { emailRedirectTo: `${window.location.origin}/guru` } });
            setBusy(false);
            if (error) return setMsg(error.message);
            setMsg("Akun dibuat! Cek email Anda untuk konfirmasi, lalu masuk.");
            setMode("in");
          }
        }}
        className="card-fun w-full max-w-md space-y-4 p-8"
      >
        <h1 className="text-center text-3xl font-bold text-primary">👩‍🏫 {mode === "in" ? "Masuk Guru" : "Daftar Guru"}</h1>
        <label className="block font-display font-semibold">
          Email
          <input type="email" required className="field-fun mt-1" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="block font-display font-semibold">
          Password
          <input type="password" required minLength={6} className="field-fun mt-1" value={pw} onChange={(e) => setPw(e.target.value)} />
        </label>
        {msg && <p className="rounded-2xl bg-sky-soft p-3 text-sm font-semibold">{msg}</p>}
        <button className="btn-fun w-full" disabled={busy}>{busy ? "..." : mode === "in" ? "Masuk" : "Daftar"}</button>
        <button type="button" onClick={() => setMode(mode === "in" ? "up" : "in")} className="w-full text-sm text-muted-foreground underline">
          {mode === "in" ? "Belum punya akun? Daftar" : "Sudah punya akun? Masuk"}
        </button>
        <div className="text-center text-sm text-muted-foreground">atau</div>
        <button
          type="button"
          disabled={busy}
          onClick={async () => {
            setMsg("");
            setBusy(true);
            const { lovable } = await import("@/integrations/lovable/index");
            const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/auth" });
            setBusy(false);
            if (result.error) return setMsg("Gagal masuk dengan Google. Coba lagi.");
            if (result.redirected) return;
            nav({ to: "/guru" });
          }}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-border bg-card px-4 py-3 font-display font-semibold"
        >
          <span className="text-lg font-bold text-primary">G</span> Masuk dengan Google
        </button>
      </form>
      <Link to="/" className="text-sm text-muted-foreground underline">← Kembali ke halaman siswa</Link>
    </div>
  );
}
