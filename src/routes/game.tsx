import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { recordActivity, getSid } from "@/lib/user";
import { AVATARS, avatarSrc } from "@/lib/game/avatars";
import { LEVELS, type LevelId } from "@/lib/game/questions";
import { Game, type RoundResult } from "@/components/game/Game";
import bg from "@/assets/game/bg-garden.jpg";
import { BACKGROUNDS } from "@/lib/game/backgrounds";
import { Button } from "@/components/ui/button";
import { startMusic, stopMusic } from "@/lib/game/music";
import { DEFAULT_RELIGION, getPrayer, PRAYERS, type ReligionId } from "@/lib/game/prayers";

export const Route = createFileRoute("/game")({
  head: () => ({
    meta: [
      { title: "Mode Game — Jelajah Sentimeter" },
      { name: "description", content: "Lari, kumpulkan koin, dan jawab soal pengukuran cm dan m." },
      { property: "og:title", content: "Mode Game — Jelajah Sentimeter" },
      { property: "og:description", content: "Game petualangan koin pengukuran panjang kelas 3 SD." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Siswa,
});

type Step = "name" | "avatar" | "menu" | "doa" | "play" | "done";

type Progress = { bestScore: number; stars: number; correct: number; plays: number };

function loadProgress(): Partial<Record<LevelId, Progress>> {
  try {
    return JSON.parse(localStorage.getItem("sp_progress") ?? "{}");
  } catch {
    return {};
  }
}

function Siswa() {
  const nav = useNavigate();
  const [step, setStep] = useState<Step>("avatar");
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState<string>("cat");
  const [level, setLevel] = useState<LevelId>("tool_selection");
  const [result, setResult] = useState<RoundResult | null>(null);
  const [round, setRound] = useState(0);
  const [saveErr, setSaveErr] = useState(false);
  const [showPrayer, setShowPrayer] = useState(false);
  const [religion, setReligion] = useState<ReligionId>(DEFAULT_RELIGION);
  const prayer = getPrayer(religion);
  const [progress, setProgress] = useState<Partial<Record<LevelId, Progress>>>({});

  useEffect(() => {
    const saved = localStorage.getItem("sp_student");
    const nm = localStorage.getItem("jelajah-nama");
    if (!getSid() || !nm) { nav({ to: "/" }); return; }
    setName(nm);
    if (saved) { try { const v = JSON.parse(saved); if (v.name === nm) { setAvatar(v.avatar ?? "cat"); setStep("menu"); } } catch { /* ignore */ } }
    setProgress(loadProgress());
  }, []);

  const begin = () => {
    startMusic();
    setRound((r) => r + 1);
    setStep("play");
  };

  const chooseAvatar = async (id: string) => {
    setAvatar(id);
    localStorage.setItem("sp_student", JSON.stringify({ name, avatar: id }));
    setStep("menu");
  };

  const onFinish = async (r: RoundResult) => {
    stopMusic();
    setResult(r);
    setStep("done");
    setSaveErr(false);
    setProgress((prev) => {
      const p = prev[r.level];
      const next = {
        ...prev,
        [r.level]: {
          bestScore: Math.max(p?.bestScore ?? 0, r.score),
          stars: Math.max(p?.stars ?? 0, r.stars),
          correct: Math.max(p?.correct ?? 0, r.total_correct),
          plays: (p?.plays ?? 0) + 1,
        },
      };
      localStorage.setItem("sp_progress", JSON.stringify(next));
      return next;
    });
    try {
      await recordActivity("game", r.score, { level: r.level, avatar, stars: r.stars, total_correct: r.total_correct, total_wrong: r.total_wrong, answers_log: r.answers_log }, true);
    } catch (e) { console.error(e); setSaveErr(true); }
  };

  if (step === "play") {
    return <Game key={round} level={level} avatar={avatar} onExit={() => { stopMusic(); setStep("menu"); }} onFinish={onFinish} />;
  }

  return (
    <main className="relative grid min-h-screen place-items-center p-4" style={{ backgroundImage: `url(${bg})`, backgroundSize: "cover", backgroundPosition: "center" }}>
      <Link to="/pilih-mode" className="btn-pop absolute right-3 top-3 rounded-full bg-coral px-4 py-2 text-xl font-extrabold text-primary-foreground sm:text-2xl">🧭 Pilih Mode</Link>
      <div className="w-full max-w-4xl rounded-[2.5rem] border-4 border-border bg-card/90 p-6 text-center shadow-2xl backdrop-blur sm:p-10">
        {step === "name" && (
          <form onSubmit={(e) => { e.preventDefault(); if (name.trim()) setStep("avatar"); }}>
            <h1 className="text-4xl font-extrabold sm:text-5xl">👋 Siapa namamu?</h1>
            <input autoFocus value={name} maxLength={40} onChange={(e) => setName(e.target.value)} placeholder="Nama" className="mt-6 w-full rounded-3xl border-4 border-sky bg-background px-6 py-5 text-center text-3xl font-extrabold outline-none sm:text-4xl" />
            <button disabled={!name.trim()} className="btn-pop mt-6 rounded-3xl bg-grass px-12 py-5 text-3xl font-extrabold text-primary-foreground disabled:opacity-40">Lanjut ▶</button>
          </form>
        )}
        {step === "avatar" && (
          <>
            <h1 className="text-3xl font-extrabold sm:text-5xl">Pilih temanmu!</h1>
            <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-5">
              {AVATARS.map((a) => (
                <button key={a.id} onClick={() => chooseAvatar(a.id)} className={`btn-pop rounded-3xl bg-secondary p-2 ${avatar === a.id ? "ring-8 ring-sun" : ""}`}>
                  <img src={a.src} alt={a.name} className="mx-auto aspect-square w-full object-contain" />
                  <div className="text-lg font-extrabold">{a.name}</div>
                </button>
              ))}
            </div>
          </>
        )}
        {step === "menu" && (
          <>
            <div className="flex items-center justify-center gap-3">
              <button onClick={() => setStep("avatar")} aria-label="Ganti teman"><img src={avatarSrc(avatar)} alt="" className="size-20 object-contain sm:size-24" /></button>
              <h1 className="truncate text-3xl font-extrabold sm:text-5xl">Halo, {name}!</h1>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {LEVELS.map((l, i) => {
                const p = progress[l.id];
                return (
                  <Button key={l.id} onClick={() => { setLevel(l.id); setShowPrayer(false); setReligion(DEFAULT_RELIGION); setStep("doa"); }} className={`btn-pop block h-auto min-w-0 overflow-hidden whitespace-normal rounded-3xl p-0 text-primary-foreground ${["bg-grass", "bg-sky", "bg-berry"][i]}`}>
                    <img src={BACKGROUNDS[l.bg].src} alt={BACKGROUNDS[l.bg].alt} className="aspect-video w-full object-cover" />
                    <div className="p-4">
                      <div className="text-lg font-extrabold">{l.emoji} Level {i + 1}</div>
                      <div className="mt-1 text-2xl font-extrabold">{l.title}</div>
                      <div className="mt-2 text-base font-bold">{BACKGROUNDS[l.bg].label}</div>
                      {p && <div className="mt-2 rounded-2xl bg-card/80 px-2 py-1 text-sm font-extrabold text-foreground">⭐ {p.bestScore} • ✅ {p.correct}/10 • 🎮 {p.plays}x</div>}
                    </div>
                  </Button>
                );
              })}
            </div>
          </>
        )}
        {step === "doa" && (
          <>
            <div className="text-7xl sm:text-8xl">🙏</div>
            <h1 className="mt-4 text-3xl font-extrabold sm:text-5xl">Eitsss, sebelum mengerjakan...</h1>
            <p className="mt-3 text-2xl font-extrabold sm:text-3xl">Sudahkah kamu berdoa hari ini?</p>
             <div className="mx-auto mt-6 max-w-xl text-left">
               <label htmlFor="prayer-religion" className="mb-2 block text-lg font-extrabold">Agama</label>
               <select id="prayer-religion" value={religion} onChange={(e) => {
                 const selected = PRAYERS.find((item) => item.id === e.target.value);
                 if (selected) setReligion(selected.id);
               }} className="w-full rounded-2xl border-2 border-sky bg-background px-4 py-3 text-xl font-bold text-foreground">
                 {PRAYERS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
               </select>
             </div>
            {!showPrayer ? (
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                 <Button onClick={begin} className="btn-pop h-auto rounded-3xl bg-grass py-5 text-2xl font-extrabold text-primary-foreground sm:text-3xl">🙏 SUDAH</Button>
                 <Button onClick={() => setShowPrayer(true)} className="btn-pop h-auto rounded-3xl bg-coral py-5 text-2xl font-extrabold text-primary-foreground sm:text-3xl">⏳ BELUM</Button>
              </div>
            ) : (
              <div className="mx-auto mt-6 max-w-xl rounded-3xl bg-sun/30 p-6">
                 <div className="text-xl font-extrabold sm:text-2xl">✨ Doa Sebelum Belajar — {prayer.label}</div>
                 <div aria-live="polite">
                   <p lang={religion === "islam" ? "ar" : "id"} dir={religion === "islam" ? "rtl" : "ltr"} className={`mt-3 font-bold ${religion === "islam" ? "text-4xl leading-loose" : "text-lg sm:text-xl"}`}>{prayer.text}</p>
                   {"transliteration" in prayer && <p className="mt-3 text-lg font-bold sm:text-xl">{prayer.transliteration}</p>}
                   {"meaning" in prayer && <p className="mt-3 text-lg font-bold sm:text-xl">{prayer.meaning}</p>}
                 </div>
                 <Button onClick={begin} className="btn-pop mt-5 h-auto whitespace-normal rounded-3xl bg-grass px-6 py-4 text-2xl font-extrabold text-primary-foreground sm:text-3xl">Selesai berdoa, ayo mulai! 🎮</Button>
              </div>
            )}
             <Button variant="link" onClick={() => setStep("menu")} className="mt-6 whitespace-normal text-lg font-extrabold text-muted-foreground underline">← Kembali pilih level</Button>
          </>
        )}
        {step === "done" && result && (
          <>
            <img src={avatarSrc(avatar)} alt="" className="mx-auto size-32 object-contain sm:size-40" />
            <h1 className="text-4xl font-extrabold sm:text-5xl">{result.total_correct >= 7 ? "🎉 Hebat!" : "👍 Bagus!"}</h1>
            <div className="mt-6 grid grid-cols-3 gap-3 text-2xl font-extrabold sm:text-4xl">
              <div className="rounded-3xl bg-sun/40 p-4">⭐<div>{result.score}</div></div>
              <div className="rounded-3xl bg-sky/30 p-4">🌟<div>{result.stars}</div></div>
              <div className="rounded-3xl bg-grass/30 p-4">✅<div>{result.total_correct}/10</div></div>
            </div>
            {saveErr && <p className="mt-3 font-bold text-destructive">Nilai belum tersimpan. Coba main lagi nanti.</p>}
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <button onClick={() => { setRound((r) => r + 1); setStep("play"); }} className="btn-pop rounded-3xl bg-grass py-5 text-2xl font-extrabold text-primary-foreground sm:text-3xl">🔄 MAIN LAGI</button>
              <button onClick={() => setStep("menu")} className="btn-pop rounded-3xl bg-sky py-5 text-2xl font-extrabold text-primary-foreground sm:text-3xl">🏠 KEMBALI KE MENU</button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
