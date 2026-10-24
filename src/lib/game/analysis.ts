import { LEVELS, QUESTION_TYPE_LABEL, type LevelId } from "./questions";

export type Attempt = {
  id: string; student_id: string; avatar: string | null; level: string; score: number;
  total_correct: number; total_wrong: number; created_at: string;
  answers_log: { question_type: string; is_correct: boolean; attempts: number }[];
};

export type StudentSummary = {
  student_id: string; avatar: string | null; rounds: number; bestScore: number;
  perLevel: Record<LevelId, { correct: number; total: number }>;
  perType: Record<string, { correct: number; total: number }>;
  strong: string[]; weak: string[]; text: string;
};

export function summarize(attempts: Attempt[]): StudentSummary[] {
  const map = new Map<string, StudentSummary>();
  for (const a of attempts) {
    let s = map.get(a.student_id);
    if (!s) {
      s = { student_id: a.student_id, avatar: a.avatar, rounds: 0, bestScore: 0,
        perLevel: { tool_selection: { correct: 0, total: 0 }, reading_ruler: { correct: 0, total: 0 }, conversion: { correct: 0, total: 0 } },
        perType: {}, strong: [], weak: [], text: "" };
      map.set(a.student_id, s);
    }
    s.rounds++;
    s.bestScore = Math.max(s.bestScore, a.score);
    const lv = s.perLevel[a.level as LevelId];
    for (const ans of a.answers_log ?? []) {
      if (lv) { lv.total++; if (ans.is_correct) lv.correct++; }
      const t = (s.perType[ans.question_type] ??= { correct: 0, total: 0 });
      t.total++; if (ans.is_correct) t.correct++;
    }
  }
  for (const s of map.values()) {
    const parts: string[] = [];
    for (const l of LEVELS) {
      const v = s.perLevel[l.id];
      if (!v.total) continue;
      const score10 = Math.round((v.correct / v.total) * 10);
      if (score10 >= 7) { s.strong.push(l.title); parts.push(`kuat di ${l.title.toLowerCase()} ${score10}/10`); }
      else if (score10 < 6) { s.weak.push(l.title); parts.push(`perlu latihan ${l.title.toLowerCase()} ${score10}/10`); }
      else parts.push(`cukup di ${l.title.toLowerCase()} ${score10}/10`);
    }
    s.text = parts.length ? `${s.student_id} ${parts.join(", ")}` : `${s.student_id} belum menjawab soal`;
  }
  return [...map.values()].sort((a, b) => a.student_id.localeCompare(b.student_id));
}

export const typeLabel = (t: string) => QUESTION_TYPE_LABEL[t] ?? t;
export const levelLabel = (l: string) => LEVELS.find((x) => x.id === l)?.title ?? l;
