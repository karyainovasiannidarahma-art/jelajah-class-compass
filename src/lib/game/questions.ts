import type { BackgroundId } from "@/lib/game/backgrounds";

export type LevelId = "tool_selection" | "reading_ruler" | "conversion";

export type Question = {
  type: string; // question_type for the log
  prompt: string;
  emoji?: string;
  objectName?: string;
  ruler?: { length: number; object: string; color: string };
  options: string[];
  answer: string;
};

export const LEVELS: { id: LevelId; title: string; emoji: string; bg: BackgroundId }[] = [
  { id: "tool_selection", title: "Pilih Alat Ukur", emoji: "📏", bg: "garden" },
  { id: "reading_ruler", title: "Baca Penggaris", emoji: "✏️", bg: "beach" },
  { id: "conversion", title: "Konversi cm ↔ m", emoji: "🔁", bg: "mountain" },
];

export const QUESTION_TYPE_LABEL: Record<string, string> = {
  alat_ukur: "Pilih alat ukur",
  satuan: "Pilih satuan",
  pilih_alat: "Pilih satuan (lama)",
  baca_penggaris: "Baca penggaris",
  m_ke_cm: "Konversi m → cm",
  cm_ke_m: "Konversi cm → m",
};

function shuffle<T>(a: T[]): T[] {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j]!, r[i]!];
  }
  return r;
}

type WorksheetItem = { name: string; emoji: string; tools: [string, string]; tool: string; unit: "cm" | "m" };

export const WORKSHEET_ITEMS: WorksheetItem[] = [
  { name: "panjang kotak pensil", emoji: "🖍️", tools: ["Penggaris", "Meteran Pita"], tool: "Penggaris", unit: "cm" },
  { name: "panjang buku", emoji: "📘", tools: ["Penggaris", "Meteran Pita"], tool: "Penggaris", unit: "cm" },
  { name: "tinggi pintu", emoji: "🚪", tools: ["Penggaris", "Meteran Bangunan"], tool: "Meteran Bangunan", unit: "m" },
  { name: "panjang lengan", emoji: "💪", tools: ["Meteran Pita", "Penggaris"], tool: "Meteran Pita", unit: "cm" },
  { name: "tinggi tiang bendera", emoji: "🚩", tools: ["Meteran Bangunan", "Meteran Pita"], tool: "Meteran Bangunan", unit: "m" },
  { name: "panjang penghapus", emoji: "🧽", tools: ["Penggaris", "Meteran Bangunan"], tool: "Penggaris", unit: "cm" },
  { name: "panjang pensil", emoji: "✏️", tools: ["Penggaris", "Meteran Bangunan"], tool: "Penggaris", unit: "cm" },
  { name: "tinggi rumah", emoji: "🏠", tools: ["Meteran Pita", "Meteran Bangunan"], tool: "Meteran Bangunan", unit: "m" },
  { name: "lingkar pinggang", emoji: "👖", tools: ["Meteran Pita", "Penggaris"], tool: "Meteran Pita", unit: "cm" },
  { name: "panjang bambu", emoji: "🎋", tools: ["Penggaris", "Meteran Bangunan"], tool: "Meteran Bangunan", unit: "m" },
];

export function worksheetQuestion(item: WorksheetItem, type: "alat_ukur" | "satuan"): Question {
  const isTool = type === "alat_ukur";
  return {
    type, objectName: item.name, emoji: item.emoji,
    prompt: isTool ? `Alat ukur yang paling tepat untuk mengukur ${item.name} adalah...` : `Satuan baku yang sesuai untuk mengukur ${item.name} adalah...`,
    options: shuffle(isTool ? [...item.tools, Math.random() < 0.5 ? "Timbangan" : "Gelas ukur"] : ["cm", "m", "kg"]),
    answer: isTool ? item.tool : item.unit,
  };
}

function toolQuestions(): Question[] {
  // Random object order assigns five objects to each type, with no repeated objects.
  return shuffle(shuffle(WORKSHEET_ITEMS).map((item, i) => worksheetQuestion(item, i < 5 ? "alat_ukur" : "satuan")));
}

const RULER_OBJECTS = [
  { object: "pensil", color: "oklch(0.82 0.16 85)" },
  { object: "krayon", color: "oklch(0.68 0.2 25)" },
  { object: "penghapus", color: "oklch(0.8 0.1 350)" },
  { object: "pita", color: "oklch(0.65 0.15 250)" },
  { object: "lidi", color: "oklch(0.6 0.1 60)" },
  { object: "spidol", color: "oklch(0.62 0.17 150)" },
];

function rulerQuestions(): Question[] {
  const lengths = shuffle([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
  return lengths.map((L, i) => {
    const obj = RULER_OBJECTS[i % RULER_OBJECTS.length]!;
    const pool = shuffle([L - 3, L - 2, L - 1, L + 1, L + 2, L + 3].filter((n) => n > 0 && n <= 18 && n !== L));
    const opts = shuffle([L, pool[0]!, pool[1]!]).map((n) => `${n} cm`);
    return { type: "baca_penggaris", prompt: `Berapa panjang ${obj.object}?`, ruler: { length: L, ...obj }, options: opts, answer: `${L} cm` };
  });
}

function conversionQuestions(): Question[] {
  const out: Question[] = [];
  for (const m of shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9])) {
    out.push({
      type: "m_ke_cm",
      prompt: `${m} m = ... cm?`,
      options: shuffle([`${m * 10} cm`, `${m * 100} cm`, `${m * 1000} cm`]),
      answer: `${m * 100} cm`,
    });
  }
  for (const m of shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9])) {
    out.push({
      type: "cm_ke_m",
      prompt: `${m * 100} cm = ... m?`,
      options: shuffle([`${m} m`, `${m * 10} m`, `${m * 100} m`]),
      answer: `${m} m`,
    });
  }
  return shuffle(out);
}

export function drawQuestions(level: LevelId, count = 10): Question[] {
  const bank = level === "tool_selection" ? toolQuestions() : level === "reading_ruler" ? rulerQuestions() : conversionQuestions();
  return bank.slice(0, count);
}
