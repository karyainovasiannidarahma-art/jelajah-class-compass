import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { chatBot } from "@/lib/ai/bot.functions";
import { playPopSound } from "@/lib/fx";

type Msg = { role: "user" | "assistant"; content: string };

export function HelperBot({ tips }: { tips: string[] }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"chat" | "tips">("chat");
  const [i, setI] = useState(0);
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "assistant", content: "Halo! Aku Bot Centi 🤖 Ada yang mau kamu tanyakan tentang mengukur panjang?" },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, busy, open, tab]);

  async function send() {
    const text = input.trim();
    if (!text || busy) return;
    playPopSound();
    const next: Msg[] = [...msgs, { role: "user", content: text }];
    setMsgs(next);
    setInput("");
    setBusy(true);
    try {
      const { reply } = await chatBot({ data: { messages: next } });
      setMsgs([...next, { role: "assistant", content: reply }]);
    } catch {
      setMsgs([...next, { role: "assistant", content: "Aduh, koneksiku lagi gangguan 😅 Coba lagi ya!" }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-2">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            className="flex max-h-[70vh] w-80 max-w-[calc(100vw-2rem)] flex-col rounded-3xl border-4 border-sky bg-card p-4 shadow-xl"
          >
            <div className="mb-2 flex gap-2">
              {(["chat", "tips"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => { playPopSound(); setTab(t); }}
                  className={`flex-1 rounded-full px-3 py-1 font-display text-sm font-bold ${tab === t ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                >
                  {t === "chat" ? "💬 Tanya Bot" : "💡 Tips"}
                </button>
              ))}
            </div>

            {tab === "tips" ? (
              <div>
                <p className="font-display text-base font-semibold">🤖 {tips[i % tips.length]}</p>
                <button
                  onClick={() => { playPopSound(); setI(i + 1); }}
                  className="mt-2 rounded-full bg-sky-soft px-3 py-1 text-sm font-bold"
                >
                  Tips lain 💡
                </button>
              </div>
            ) : (
              <>
                <div className="min-h-40 flex-1 space-y-2 overflow-y-auto pr-1">
                  {msgs.map((m, idx) => (
                    <div
                      key={idx}
                      className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm font-semibold ${
                        m.role === "user" ? "ml-auto bg-primary text-primary-foreground" : "bg-sky-soft"
                      }`}
                    >
                      {m.content}
                    </div>
                  ))}
                  {busy && <div className="max-w-[85%] rounded-2xl bg-sky-soft px-3 py-2 text-sm font-semibold">🤖 mengetik...</div>}
                  <div ref={bottomRef} />
                </div>
                <form
                  className="mt-2 flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    send();
                  }}
                >
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Tulis pertanyaanmu..."
                    className="min-w-0 flex-1 rounded-full border-2 border-sky bg-card px-3 py-2 text-sm"
                  />
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    type="submit"
                    disabled={busy}
                    className="rounded-full bg-primary px-4 py-2 font-display text-sm font-bold text-primary-foreground"
                  >
                    ➤
                  </motion.button>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      <motion.button
        animate={{ y: [0, -8, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92, y: 3 }}
        onClick={() => { playPopSound(); setOpen(!open); }}
        className="flex items-center gap-2 rounded-full bg-primary px-4 py-3 font-display font-bold text-primary-foreground shadow-lg"
      >
        <span className="text-2xl">🤖</span> Mau bertanya?
      </motion.button>
    </div>
  );
}
