import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

const KEY = "jelajah-nama";
const SID = "jelajah-sid";

export function saveSession(name: string, studentId: string) {
  localStorage.setItem(KEY, name);
  localStorage.setItem(SID, studentId);
}

export function clearName() {
  localStorage.removeItem(KEY);
  localStorage.removeItem(SID);
  Object.keys(localStorage).filter((k) => k.startsWith("jelajah-done-") || k === "jelajah-diag").forEach((k) => localStorage.removeItem(k));
}

export function useName() {
  const [name, setName] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setName(localStorage.getItem(SID) ? localStorage.getItem(KEY) : null);
    setReady(true);
  }, []);
  return { name, ready };
}

export type ActivityKind = "diagnostik" | "level-1" | "level-2" | "level-3" | "uji" | "refleksi" | "asesmen" | "prasyarat-b" | "modul-b";

export async function recordActivity(kind: ActivityKind, score: number | null, payload: Record<string, unknown> = {}, requireSaved = false) {
  if (requireSaved) {
    const sid = localStorage.getItem(SID);
    if (!sid) throw new Error("Sesi siswa tidak aktif. Silakan masuk kembali.");
    const { error } = await supabase.rpc("record_activity", { _student_id: sid, _kind: kind, _score: score as number, _payload: payload as Json });
    if (error) throw error;
    if (["level-1", "level-2", "level-3", "modul-b"].includes(kind)) markDone(kind);
    window.dispatchEvent(new Event("jelajah-update"));
    return;
  }
  if (["level-1", "level-2", "level-3", "modul-b"].includes(kind)) markDone(kind);
  if (kind === "diagnostik" && score != null) localStorage.setItem("jelajah-diag", String(score));
  window.dispatchEvent(new Event("jelajah-update"));
  const sid = localStorage.getItem(SID);
  if (!sid) return;
  const { error } = await supabase.rpc("record_activity", {
    _student_id: sid,
    _kind: kind,
    _score: score as number,
    _payload: payload as Json,
  });
  if (error) console.error(error);
  window.dispatchEvent(new Event("jelajah-update"));
}

export function meta(title: string, description: string) {
  return {
    meta: [
      { title: `${title} — Jelajah Sentimeter` },
      { name: "description", content: description },
      { property: "og:title", content: `${title} — Jelajah Sentimeter` },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  };
}

export function markDone(k: string) { localStorage.setItem("jelajah-done-" + k, "1"); }
export function isDone(k: string) { return typeof window !== "undefined" && localStorage.getItem("jelajah-done-" + k) === "1"; }
export function getSid() { return localStorage.getItem(SID); }

export type ClassState = { unlocked: string[]; mode: string; focus_page: string; quiz_url: string | null; message: string | null; video_url: string | null; extras: { judul?: string; url?: string }[]; active: boolean; done?: string[]; diag?: number | null };

export function allowedLevels(diag: number | null | undefined, done: string[]) {
  const a = new Set<string>();
  if (diag == null) return a;
  a.add("level-1");
  if (diag >= 3) a.add("level-2");
  if (diag >= 5) a.add("level-3");
  if (done.includes("level-1")) a.add("level-2");
  if (done.includes("level-2")) a.add("level-3");
  return a;
}
export function localDiag(): number | null { const v = localStorage.getItem("jelajah-diag"); return v === null ? null : Number(v); }
