import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { clearName, useName, getSid, markDone, isDone, allowedLevels, localDiag, type ClassState } from "@/lib/user";
import { supabase } from "@/integrations/supabase/client";
import { ClassCtx } from "@/lib/class-state";

const menu = [
  { to: "/beranda", e: "🏠", l: "Beranda" },
  { to: "/diagnostik", e: "📝", l: "Kenali Kebutuhanmu" },
  { to: "/materi", e: "📚", l: "Materi Ajar Lengkap" },
  { to: "/level-1", e: "🚩", l: "Level 1: Perlu Pendampingan" },
  { to: "/level-2", e: "🚀", l: "Level 2: Berkembang" },
  { to: "/level-3", e: "👑", l: "Level 3: Mahir" },
  { to: "/modul-b", e: "🪜", l: "Modul B: Konversi Satuan" },
  { to: "/uji", e: "🎯", l: "Uji Pemahaman Final" },
  { to: "/refleksi", e: "💭", l: "Refleksi Akhir" },
] as const;

export const Route = createFileRoute("/_main")({ component: Layout });

function Layout() {
  const { name, ready } = useName();
  const nav = useNavigate();
  useEffect(() => {
    if (ready && !name) nav({ to: "/" });
  }, [ready, name, nav]);
  const path = useRouterState({ select: (s) => s.location.pathname });
  const page = path.replace(/^\//, "") || "beranda";
  const [cls, setCls] = useState<ClassState | null>(null);
  const [, setBump] = useState(0);
  useEffect(() => {
    if (!ready || !name) return;
    let alive = true;
    const tick = async () => {
      const sid = getSid();
      if (!sid) return;
      const { data } = await supabase.rpc("student_sync", { _student_id: sid, _page: page });
      if (!alive || !data) return;
      const st = data as unknown as ClassState;
      if (!st.active) { clearName(); nav({ to: "/" }); return; }
      (st.done ?? []).forEach((k) => markDone(k));
      if (st.diag != null) localStorage.setItem("jelajah-diag", String(st.diag));
      setCls(st);
      if (st.mode === "terpimpin" && st.focus_page && st.focus_page !== page) nav({ to: ("/" + st.focus_page) as "/beranda" });
    };
    tick();
    const onUp = () => { setBump((b) => b + 1); tick(); };
    window.addEventListener("jelajah-update", onUp);
    const id = setInterval(tick, 5000);
    return () => { alive = false; clearInterval(id); window.removeEventListener("jelajah-update", onUp); };
  }, [ready, name, page, nav]);
  const isLevel = /^level-[123]$/.test(page);
  // Level & Modul B dibuka berjenjang oleh skor diagnostik/progres, bukan gembok guru
  const teacherLocked = cls && !isLevel && page !== "modul-b" ? !cls.unlocked.includes(page) : false;
  const diag = (ready ? localDiag() : null) ?? cls?.diag ?? null;
  const doneList = [...(cls?.done ?? []), ...["level-1", "level-2", "level-3"].filter((k) => ready && isDone(k))];
  const diagLocked = ready && isLevel && !allowedLevels(diag, doneList).has(page);
  const locked = teacherLocked || diagLocked;

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 flex h-screen w-20 shrink-0 flex-col gap-1 overflow-y-auto bg-sidebar p-3 md:w-72">
        <div className="mb-4 flex items-center gap-2 px-2 py-3">
          <span className="text-3xl">📏</span>
          <div className="hidden md:block">
            <p className="font-display text-xl font-bold leading-tight">Jelajah Sentimeter</p>
            <p className="text-xs text-muted-foreground">SDN Pabelan 02 · Kelas 3</p>
          </div>
        </div>
        {menu.map((m) => (
          <Link
            key={m.to}
            to={m.to}
            className="flex items-center gap-3 rounded-2xl px-3 py-3 font-semibold transition hover:bg-sidebar-accent"
            activeProps={{ className: "bg-sidebar-accent shadow-pop text-primary" }}
          >
            <span className="text-2xl">{m.e}</span>
            <span className="hidden text-sm md:inline">{m.l}</span>
          </Link>
        ))}
        <button
          onClick={() => {
            clearName();
            nav({ to: "/" });
          }}
          className="mt-auto rounded-2xl px-3 py-2 text-sm text-muted-foreground hover:bg-sidebar-accent"
        >
          🚪 <span className="hidden md:inline">Keluar</span>
        </button>
      </aside>
      <div className="min-w-0 flex-1">
        <header className="flex justify-end p-4">
          <div className="rounded-full bg-accent px-5 py-2 font-display text-lg font-semibold text-accent-foreground shadow-pop">
            👋 Halo, {name ?? "..."}!
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 pb-16 md:px-8">
          {cls?.message && (
            <div className="card-fun mb-6 bg-sun-soft p-4 font-display text-lg font-semibold">📣 Pesan Guru: {cls.message}</div>
          )}
          {cls?.mode === "terpimpin" && (
            <p className="mb-4 rounded-2xl bg-sky-soft p-2 text-center text-sm font-semibold">🧑‍🏫 Mode Terpimpin: ikuti arahan guru ya</p>
          )}
          <ClassCtx.Provider value={cls}>
            {locked ? (
              <div className="card-fun flex flex-col items-center gap-4 p-10 text-center">
                <div className="text-7xl">🔒</div>
                {teacherLocked ? (<>
                  <p className="font-display text-2xl font-bold">Halaman ini masih dikunci Bu/Pak Guru.</p>
                  <p className="text-muted-foreground">Tunggu aba-aba ya!</p>
                </>) : (<>
                  <p className="font-display text-2xl font-bold">Level ini belum terbuka.</p>
                  <p className="text-muted-foreground">{diag == null ? "Kerjakan dulu Tes Diagnostik, ya! Level akan terbuka sesuai skormu." : "Selesaikan level sebelumnya dulu, ya!"}</p>
                  {diag == null && <Link to="/diagnostik" className="btn-fun">📝 Ke Tes Diagnostik</Link>}
                </>)}
                <Link to="/beranda" className="btn-fun btn-sky">🏠 Kembali ke Beranda</Link>
              </div>
            ) : (
              <Outlet />
            )}
          </ClassCtx.Provider>
        </main>
      </div>
    </div>
  );
}
