import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { PageTitle } from "@/components/Fun";
import { meta, recordActivity } from "@/lib/user";
import { useClass } from "@/lib/class-state";

export const Route = createFileRoute("/_main/uji")({
  head: () => meta("Uji Pemahaman Final", "Kuis akhir untuk menguji pemahaman mengukur panjang."),
  component: Uji,
});

function Uji() {
  const cls = useClass();
  return (
    <div>
      <PageTitle emoji="🎯" title="Uji Pemahaman Final" sub="Sudah siap? Tunjukkan kemampuanmu!" />
      <div className="card-fun flex flex-col items-center gap-6 bg-sky-soft p-10 text-center">
        <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 1.8 }} className="text-7xl">🏆</motion.div>
        <a href={cls?.quiz_url || "https://wordwall.net"} target="_blank" rel="noreferrer" onClick={() => recordActivity("uji", null, { info: "Membuka kuis Wordwall" })} className="btn-fun px-10 py-6 text-2xl">
          Mulai Kuis Wordwall 🎮
        </a>
        {cls?.extras?.filter((x) => x.url).map((x) => (
          <a key={x.url} href={x.url} target="_blank" rel="noreferrer" className="btn-fun btn-sky">➕ {x.judul || "Soal Tambahan"}</a>
        ))}
        <Link to="/materi" className="btn-fun btn-sky">
          📚 Recall Materi
        </Link>
      </div>
    </div>
  );
}
