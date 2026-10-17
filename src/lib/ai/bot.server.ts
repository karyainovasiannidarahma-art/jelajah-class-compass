import { createOpenAI } from "@ai-sdk/openai";
import { streamText, type ModelMessage } from "ai";

import { createLovableAiGatewayRunIdFetch, getLovableAiGatewayRunId } from "./run-id";

const INSTRUCTIONS = `Kamu adalah "Bot Centi" 🤖, robot pendamping belajar untuk anak kelas 3 SD di aplikasi "Jelajah Sentimeter" (belajar pengukuran panjang: cm, m, alat ukur, konversi satuan).

Aturanmu:
- Bicara seperti kakak pendamping yang ramah, ceria, dan sabar. Pakai bahasa Indonesia sederhana untuk anak 8-9 tahun.
- Jawaban singkat (maksimal 3 kalimat), boleh pakai emoji secukupnya.
- Hanya jawab seputar pelajaran pengukuran panjang, matematika sederhana, dan cara memakai aplikasi ini. Kalau ditanya hal lain, ajak kembali belajar dengan lembut.
- Jangan pernah memberi jawaban langsung ke soal tes; beri petunjuk/langkah berpikirnya saja.
- Selalu semangati anak.`;

export async function askBot(request: Request, messages: ModelMessage[]): Promise<string> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("AI belum dikonfigurasi");

  const runIdFetch = createLovableAiGatewayRunIdFetch(getLovableAiGatewayRunId(request));
  const provider = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch.fetch,
  });

  const result = streamText({
    model: provider.responses("openai/gpt-6-astra"),
    system: INSTRUCTIONS,
    messages,
    abortSignal: request.signal,
    providerOptions: {
      openai: {
        store: false,
        forceReasoning: true,
        reasoningEffort: "low",
        reasoningSummary: "auto",
        include: ["reasoning.encrypted_content"],
      },
    },
  });

  const text = await result.text;
  return text.trim() || "Hmm, aku bingung. Coba tanya dengan cara lain ya! 😊";
}
