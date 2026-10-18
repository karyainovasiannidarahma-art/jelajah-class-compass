import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { clearName, saveSession } from "@/lib/user";

async function preview(code: string) {
  const { data, error } = await supabase.rpc("student_join", { _code: code, _nickname: "Guru (Pratinjau)" });
  if (error || !data) return alert("Token harus aktif untuk pratinjau.");
  clearName();
  saveSession("Guru (Pratinjau)", data);
  window.open("/beranda", "_blank");
}

export const Route = createFileRoute("/_authenticated/guru")({
  head: () => ({
    meta: [
      { title: "Dasbor Guru — Jelajah Sentimeter" },
      { name: "description", content: "Kelola token kelas dan lihat hasil belajar siswa." },
      { property: "og:title", content: "Dasbor Guru — Jelajah Sentimeter" },
      { property: "og:description", content: "Kelola token kelas dan lihat hasil belajar siswa." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Guru,
});

const kindLabel: Record<string, string> = {
  diagnostik: "📝 Diagnostik",
  "level-1": "🚩 Level 1",
  "level-2": "🚀 Level 2",
  "level-3": "👑 Level 3",
  uji: "🎯 Uji Final",
  refleksi: "💭 Refleksi",
  asesmen: "💡 Self-Asesmen",
  "prasyarat-b": "🔐 Prasyarat Modul B",
  "modul-b": "🪜 Modul B",
};

const pages = [
  ["beranda", "Beranda"], ["diagnostik", "Diagnostik"], ["materi", "Materi"], ["level-1", "Level 1"], ["level-2", "Level 2"],
  ["level-3", "Level 3"], ["modul-b", "Modul B"], ["uji", "Uji Final"], ["refleksi", "Refleksi"],
] as const;

type Tok = { id: string; unlocked: string[]; mode: string; focus_page: string; quiz_url: string | null; message: string | null; video_url: string | null; extras: unknown };

function Control({ t, onSaved }: { t: Tok; onSaved: () => void }) {
  const [quiz, setQuiz] = useState(t.quiz_url ?? "");
  const [video, setVideo] = useState(t.video_url ?? "");
  const [msg, setMsg] = useState(t.message ?? "");
  const ex = (Array.isArray(t.extras) ? t.extras : []) as { judul?: string; url?: string }[];
  const [exJ, setExJ] = useState("");
  const [exU, setExU] = useState("");
  const save = async (patch: Record<string, unknown>) => { await supabase.from("class_tokens").update(patch as never).eq("id", t.id); onSaved(); };
  return (
    <section className="card-fun space-y-5 p-6">
      <h2 className="text-xl font-bold">🎛️ Kontrol Kelas</h2>
      <div>
        <p className="mb-2 font-semibold">Gembok halaman (klik untuk kunci/buka):</p>
        <div className="flex flex-wrap gap-2">
          {pages.map(([k, l]) => {
            const on = t.unlocked.includes(k);
            return <button key={k} className={`rounded-xl px-3 py-1 text-sm font-semibold ${on ? "bg-success text-success-foreground" : "bg-muted"}`}
              onClick={() => save({ unlocked: on ? t.unlocked.filter((x) => x !== k) : [...t.unlocked, k] })}>{on ? "🔓" : "🔒"} {l}</button>;
          })}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-semibold">Mode:</span>
        {["mandiri", "terpimpin"].map((m) => (
          <button key={m} className={`rounded-xl px-3 py-1 text-sm font-semibold ${t.mode === m ? "bg-primary text-primary-foreground" : "bg-muted"}`} onClick={() => save({ mode: m })}>
            {m === "mandiri" ? "🧒 Mandiri" : "🧑‍🏫 Terpimpin"}
          </button>
        ))}
        {t.mode === "terpimpin" && (
          <select className="field-fun max-w-xs" value={t.focus_page} onChange={(e) => save({ focus_page: e.target.value, unlocked: Array.from(new Set([...t.unlocked, e.target.value])) })}>
            {pages.map(([k, l]) => <option key={k} value={k}>Arahkan siswa ke: {l}</option>)}
          </select>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <input className="field-fun max-w-md" placeholder="Link kuis Wordwall" value={quiz} onChange={(e) => setQuiz(e.target.value)} />
        <button className="btn-fun" onClick={() => save({ quiz_url: quiz.trim() || null })}>Simpan Link</button>
      </div>
      <div className="flex flex-wrap gap-2">
        <input className="field-fun max-w-md" placeholder="Link video YouTube materi Level 1" value={video} onChange={(e) => setVideo(e.target.value)} />
        <button className="btn-fun" onClick={() => save({ video_url: video.trim() || null })}>Simpan Video</button>
        {t.video_url && <button className="rounded-xl bg-muted px-3 text-sm font-semibold" onClick={() => { setVideo(""); save({ video_url: null }); }}>Hapus</button>}
      </div>
      <div className="flex flex-wrap gap-2">
        <input className="field-fun max-w-md" placeholder="Pesan untuk siswa" value={msg} onChange={(e) => setMsg(e.target.value)} />
        <button className="btn-fun" onClick={() => save({ message: msg.trim() || null })}>Kirim</button>
        {t.message && <button className="rounded-xl bg-muted px-3 text-sm font-semibold" onClick={() => { setMsg(""); save({ message: null }); }}>Hapus Pesan</button>}
      </div>
      <div className="space-y-2">
        <p className="font-semibold">Soal/link tambahan (muncul di Uji Final):</p>
        {ex.map((x, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">• {x.judul} <span className="text-muted-foreground">{x.url}</span>
            <button className="text-destructive" onClick={() => save({ extras: ex.filter((_, j) => j !== i) })}>hapus</button></div>
        ))}
        <div className="flex flex-wrap gap-2">
          <input className="field-fun max-w-xs" placeholder="Judul" value={exJ} onChange={(e) => setExJ(e.target.value)} />
          <input className="field-fun max-w-xs" placeholder="https://..." value={exU} onChange={(e) => setExU(e.target.value)} />
          <button className="btn-fun btn-sky" onClick={() => { if (!exU.trim()) return; save({ extras: [...ex, { judul: exJ.trim(), url: exU.trim() }] }); setExJ(""); setExU(""); }}>+ Tambah</button>
        </div>
      </div>
    </section>
  );
}

function Guru() {
  const qc = useQueryClient();
  const nav = useNavigate();
  const [code, setCode] = useState("");
  const [label, setLabel] = useState("");
  const [err, setErr] = useState("");
  const [sel, setSel] = useState<string | null>(null);

  const tokens = useQuery({
    queryKey: ["tokens"],
    queryFn: async () => {
      const { data, error } = await supabase.from("class_tokens").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const students = useQuery({
    queryKey: ["students", sel],
    refetchInterval: 10000,
    enabled: !!sel,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students")
        .select("id, nickname, created_at, current_page, last_seen, activities(id, kind, score, payload, created_at)")
        .eq("token_id", sel!)
        .order("nickname");
      if (error) throw error;
      return data;
    },
  });

  const refresh = () => qc.invalidateQueries();

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 md:p-8">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">👩‍🏫 Dasbor Guru</h1>
        <button
          className="btn-fun btn-sky"
          onClick={async () => {
            await supabase.auth.signOut();
            qc.clear();
            nav({ to: "/auth" });
          }}
        >
          Keluar
        </button>
      </header>

      <section className="card-fun space-y-3 p-6">
        <h2 className="text-xl font-bold">Buat Token Baru</h2>
        <form
          className="flex flex-wrap gap-2"
          onSubmit={async (e) => {
            e.preventDefault();
            setErr("");
            const { error } = await supabase.from("class_tokens").insert({ code: code.trim().toUpperCase(), label: label.trim() || null });
            if (error) return setErr(error.code === "23505" ? "Token sudah dipakai, coba yang lain." : error.message);
            setCode("");
            setLabel("");
            refresh();
          }}
        >
          <input required className="field-fun max-w-xs uppercase" placeholder="Token, misal KELAS3A" value={code} onChange={(e) => setCode(e.target.value)} />
          <input className="field-fun max-w-xs" placeholder="Keterangan (opsional)" value={label} onChange={(e) => setLabel(e.target.value)} />
          <button className="btn-fun">+ Tambah</button>
        </form>
        {err && <p className="text-sm font-semibold text-destructive">{err}</p>}
      </section>

      <section className="card-fun p-6">
        <h2 className="mb-3 text-xl font-bold">Token Saya</h2>
        {tokens.isLoading && <p>Memuat...</p>}
        {tokens.data?.length === 0 && <p className="text-muted-foreground">Belum ada token.</p>}
        <div className="space-y-2">
          {tokens.data?.map((t) => (
            <div key={t.id} className={`flex flex-wrap items-center gap-3 rounded-2xl border-3 p-3 ${sel === t.id ? "border-primary bg-pink-soft" : "border-border"}`}>
              <span className="font-display text-xl font-bold">{t.code}</span>
              <span className="text-sm text-muted-foreground">{t.label}</span>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${t.active ? "bg-success text-success-foreground" : "bg-muted"}`}>
                {t.active ? "Aktif" : "Nonaktif"}
              </span>
              <div className="ml-auto flex gap-2">
                <button className="rounded-xl bg-muted px-3 py-1 text-sm font-semibold" onClick={async () => { await supabase.from("class_tokens").update({ active: !t.active }).eq("id", t.id); refresh(); }}>
                  {t.active ? "Matikan" : "Nyalakan"}
                </button>
                <button className="rounded-xl bg-sun-soft px-3 py-1 text-sm font-semibold" onClick={() => preview(t.code)}>
                  👁️ Pratinjau Siswa
                </button>
                <button className="rounded-xl bg-sky-soft px-3 py-1 text-sm font-semibold" onClick={() => setSel(t.id)}>
                  Lihat Siswa
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {sel && tokens.data?.find((x) => x.id === sel) && (
        <Control key={sel} t={tokens.data.find((x) => x.id === sel)! as Tok} onSaved={refresh} />
      )}

      {sel && (
        <section className="card-fun p-6">
          <h2 className="mb-3 text-xl font-bold">Hasil Belajar Siswa</h2>
          {students.isLoading && <p>Memuat...</p>}
          {students.data?.length === 0 && <p className="text-muted-foreground">Belum ada siswa yang masuk dengan token ini.</p>}
          <div className="space-y-4">
            {students.data?.map((s) => (
              <details key={s.id} className="rounded-2xl border-3 border-border p-4">
                <summary className="cursor-pointer font-display text-lg font-bold">
                  {s.nickname} <span className="text-sm font-normal text-muted-foreground">· {s.activities.length} aktivitas
                    {s.last_seen && Date.now() - new Date(s.last_seen).getTime() < 30000 ? ` · 🟢 di ${s.current_page}` : " · ⚪ offline"}</span>
                </summary>
                <div className="mt-3 space-y-2">
                  {[...s.activities].sort((a, b) => a.created_at.localeCompare(b.created_at)).map((a) => (
                    <div key={a.id} className="rounded-xl bg-muted p-3 text-sm">
                      <div className="flex justify-between font-semibold">
                        <span>{kindLabel[a.kind] ?? a.kind}{a.score !== null && ` — skor ${a.score}`}</span>
                        <span className="text-muted-foreground">{new Date(a.created_at).toLocaleString("id-ID")}</span>
                      </div>
                      {a.kind === "refleksi" && a.payload && typeof a.payload === "object" && (
                        <ul className="mt-2 space-y-1">
                          {Object.entries(a.payload as Record<string, string>).map(([k, v]) => (
                            <li key={k}><b>{k}:</b> {v}</li>
                          ))}
                        </ul>
                      )}
                      {a.kind !== "refleksi" && typeof (a.payload as Record<string, unknown>)?.["info"] === "string" && (
                        <p className="mt-1 text-muted-foreground">{(a.payload as Record<string, string>)["info"]}</p>
                      )}
                    </div>
                  ))}
                </div>
              </details>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
