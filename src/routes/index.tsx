import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { saveSession } from "@/lib/user";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Jelajah Sentimeter — Belajar Mengukur Panjang" },
      { name: "description", content: "Aplikasi belajar mengukur panjang dalam sentimeter untuk siswa kelas 3 SDN Pabelan 02." },
      { property: "og:title", content: "Jelajah Sentimeter — Belajar Mengukur Panjang" },
      { property: "og:description", content: "Aplikasi belajar mengukur panjang dalam sentimeter untuk siswa kelas 3 SD." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Login,
});

function Login() {
  const [name, setName] = useState("");
  const [token, setToken] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const nav = useNavigate();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
      <motion.form
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onSubmit={async (e) => {
          e.preventDefault();
          setErr("");
          setBusy(true);
          const { data, error } = await supabase.rpc("student_join", { _code: token, _nickname: name });
          setBusy(false);
          if (error || !data) return setErr("Token tidak ditemukan atau tidak aktif. Tanya Bu/Pak Guru, ya!");
          saveSession(name.trim(), data);
          nav({ to: "/beranda" });
        }}
        className="card-fun w-full max-w-md space-y-5 p-8 text-center"
      >
        <motion.div animate={{ rotate: [0, -8, 8, 0] }} transition={{ repeat: Infinity, duration: 2.5 }} className="text-7xl">
          📏
        </motion.div>
        <h1 className="text-4xl font-bold text-primary">Jelajah Sentimeter</h1>
        <p className="text-muted-foreground">SDN Pabelan 02 · Kelas 3</p>
        <label className="block text-left font-display text-lg font-semibold">
          Nama Panggilan
          <input className="field-fun mt-2 text-lg" maxLength={40} value={name} onChange={(e) => setName(e.target.value)} placeholder="Contoh: Dina" />
        </label>
        <label className="block text-left font-display text-lg font-semibold">
          Token dari Guru
          <input className="field-fun mt-2 text-lg uppercase" value={token} onChange={(e) => setToken(e.target.value)} placeholder="Contoh: KELAS3A" />
        </label>
        {err && <p className="rounded-2xl bg-pink-soft p-3 text-sm font-semibold">{err}</p>}
        <button className="btn-fun w-full text-lg" disabled={!name.trim() || !token.trim() || busy}>
          {busy ? "Memeriksa..." : "Ayo Mulai! 🚀"}
        </button>
      </motion.form>
      <Link to="/auth" className="text-sm font-semibold text-muted-foreground underline">
        👩‍🏫 Masuk sebagai Guru
      </Link>
    </div>
  );
}
