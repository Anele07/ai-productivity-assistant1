import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { generateText } from "ai";
import {
  createLovableAiGatewayProvider,
  DEFAULT_MODEL,
  requireApiKey,
} from "./ai-gateway.server";
import { TOOLS, type ToolId } from "./tool-config";

const ToolIdSchema = z.enum(["email", "meeting", "planner", "research", "assistant"]);

// ---------- Run a tool ----------
export const runTool = createServerFn({ method: "POST" })
  .inputValidator((v: unknown) =>
    z
      .object({
        tool: ToolIdSchema,
        input: z.string().min(1).max(20000),
        tone: z.string().max(80).optional(),
        parentId: z.string().uuid().optional(),
      })
      .parse(v),
  )
  .handler(async ({ data }) => {
    const cfg = TOOLS[data.tool as ToolId];
    const provider = createLovableAiGatewayProvider(requireApiKey());

    const userPrompt = data.tone
      ? `Tone: ${data.tone}\n\n${data.input}`
      : data.input;

    const { text } = await generateText({
      model: provider(DEFAULT_MODEL),
      system: cfg.system,
      prompt: userPrompt,
      maxRetries: 1,
    });

    const title = deriveTitle(data.tool as ToolId, data.input, text);
    return {
      id: crypto.randomUUID(),
      tool: data.tool,
      title,
      output_text: text,
      created_at: new Date().toISOString(),
    };
  });

function deriveTitle(tool: ToolId, input: string, output: string): string {
  if (tool === "email") {
    const m = output.match(/^\s*Subject:\s*(.+)$/im);
    if (m) return m[1].trim().slice(0, 120);
  }
  const first = input.trim().split(/\n|\.|!/)[0] ?? "";
  return (first || TOOLS[tool].name).slice(0, 120);
}

// ---------- List generations ----------
export const listGenerations = createServerFn({ method: "GET" })
  .inputValidator((v: unknown) =>
    z
      .object({
        tool: ToolIdSchema.optional(),
        limit: z.number().int().positive().max(100).default(50),
      })
      .parse(v ?? {}),
  )
  .handler(async () => {
    return [] as Array<{
      id: string;
      tool: string;
      title: string;
      output_text: string | null;
      favorited: boolean;
      created_at: string;
      minutes_saved: number | null;
    }>;
  });

// ---------- Get one generation ----------
export const getGeneration = createServerFn({ method: "GET" })
  .inputValidator((v: unknown) => z.object({ id: z.string().uuid() }).parse(v))
  .handler(async () => null);

// ---------- Delete ----------
export const deleteGeneration = createServerFn({ method: "POST" })
  .inputValidator((v: unknown) => z.object({ id: z.string().uuid() }).parse(v))
  .handler(async () => ({ ok: true }));

// ---------- Toggle favorite ----------
export const toggleFavorite = createServerFn({ method: "POST" })
  .inputValidator((v: unknown) =>
    z.object({ id: z.string().uuid(), favorited: z.boolean() }).parse(v),
  )
  .handler(async () => ({ ok: true }));

// ---------- Dashboard summary ----------
export const getDashboardSummary = createServerFn({ method: "GET" })
  .handler(async () => ({
    displayName: "there",
    recent: [] as Array<{ id: string; tool: string; title: string; created_at: string }>,
    minutesThisWeek: 0,
    totalThisWeek: 0,
    topTool: null as string | null,
    streak: 0,
    hasAnyData: false,
  }));

// ---------- Analytics ----------
export const getAnalytics = createServerFn({ method: "GET" })
  .handler(async () => {
    const weeks: { label: string; count: number }[] = [];
    for (let i = 7; i >= 0; i--) {
      const start = new Date(Date.now() - (i + 1) * 7 * 86400_000);
      weeks.push({ label: `${start.getUTCMonth() + 1}/${start.getUTCDate()}`, count: 0 });
    }
    return {
      totalMinutes: 0,
      totalGens: 0,
      byTool: {} as Record<string, number>,
      weeks,
      activeDays: 0,
      productivityScore: 0,
    };
  });