import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

type BotMessage = { role: "user" | "assistant"; content: string };

export const chatBot = createServerFn({ method: "POST" })
  .inputValidator((data: { messages: BotMessage[] }) => ({
    messages: (Array.isArray(data?.messages) ? data.messages : [])
      .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
      .slice(-10)
      .map((m) => ({ role: m.role, content: m.content.slice(0, 500) })),
  }))
  .handler(async ({ data }) => {
    const { askBot } = await import("./bot.server");
    const reply = await askBot(getRequest(), data.messages);
    return { reply };
  });
