import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
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
  .middleware([requireSupabaseAuth])
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
  .handler(async ({ data, context }) => {
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

    // Find workspace
    const { data: ws } = await context.supabase
      .from("workspaces")
      .select("id")
      .eq("owner_id", context.userId)
      .limit(1)
      .maybeSingle();

    if (!ws) throw new Error("Workspace not found");

    const title = deriveTitle(data.tool as ToolId, data.input, text);

    const { data: gen, error } = await context.supabase
      .from("generations")
      .insert({
        workspace_id: ws.id,
        user_id: context.userId,
        tool: data.tool,
        title,
        input_json: { input: data.input, tone: data.tone ?? null },
        output_text: text,
        model: DEFAULT_MODEL,
        minutes_saved: cfg.minutesSaved,
        parent_id: data.parentId ?? null,
      })
      .select("id, tool, title, output_text, created_at")
      .single();

    if (error) throw new Error(error.message);

    await context.supabase.from("analytics_events").insert({
      user_id: context.userId,
      tool: data.tool,
      event: "generation_created",
      meta: { minutes_saved: cfg.minutesSaved },
    });

    return gen;
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
  .middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) =>
    z
      .object({
        tool: ToolIdSchema.optional(),
        limit: z.number().int().positive().max(100).default(50),
      })
      .parse(v ?? {}),
  )
  .handler(async ({ data, context }) => {
    let q = context.supabase
      .from("generations")
      .select("id, tool, title, output_text, favorited, created_at, minutes_saved")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(data.limit);
    if (data.tool) q = q.eq("tool", data.tool);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

// ---------- Get one generation ----------
export const getGeneration = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) => z.object({ id: z.string().uuid() }).parse(v))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("generations")
      .select("*")
      .eq("id", data.id)
      .eq("user_id", context.userId)
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

// ---------- Delete ----------
export const deleteGeneration = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) => z.object({ id: z.string().uuid() }).parse(v))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("generations")
      .delete()
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- Toggle favorite ----------
export const toggleFavorite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) =>
    z.object({ id: z.string().uuid(), favorited: z.boolean() }).parse(v),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("generations")
      .update({ favorited: data.favorited })
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- Dashboard summary ----------
export const getDashboardSummary = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400_000).toISOString();
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400_000).toISOString();

    const [{ data: profile }, { data: recent }, { data: weekGens }, { data: allGens }] =
      await Promise.all([
        context.supabase.from("profiles").select("display_name").eq("id", context.userId).maybeSingle(),
        context.supabase
          .from("generations")
          .select("id, tool, title, created_at")
          .eq("user_id", context.userId)
          .order("created_at", { ascending: false })
          .limit(6),
        context.supabase
          .from("generations")
          .select("tool, minutes_saved, created_at")
          .eq("user_id", context.userId)
          .gte("created_at", sevenDaysAgo),
        context.supabase
          .from("generations")
          .select("created_at")
          .eq("user_id", context.userId)
          .gte("created_at", thirtyDaysAgo),
      ]);

    const minutesThisWeek = (weekGens ?? []).reduce((a, g) => a + (g.minutes_saved ?? 0), 0);
    const totalThisWeek = weekGens?.length ?? 0;

    const toolCount = new Map<string, number>();
    for (const g of weekGens ?? []) toolCount.set(g.tool, (toolCount.get(g.tool) ?? 0) + 1);
    const topTool = [...toolCount.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

    // Streak calculation
    const days = new Set(
      (allGens ?? []).map((g) => new Date(g.created_at).toISOString().slice(0, 10)),
    );
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 60; i++) {
      const d = new Date(today.getTime() - i * 86400_000).toISOString().slice(0, 10);
      if (days.has(d)) streak++;
      else if (i === 0) continue;
      else break;
    }

    return {
      displayName: profile?.display_name ?? "there",
      recent: recent ?? [],
      minutesThisWeek,
      totalThisWeek,
      topTool,
      streak,
      hasAnyData: (allGens?.length ?? 0) > 0,
    };
  });

// ---------- Analytics ----------
export const getAnalytics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const eightWeeksAgo = new Date(Date.now() - 56 * 86400_000).toISOString();
    const { data: gens } = await context.supabase
      .from("generations")
      .select("tool, minutes_saved, created_at")
      .eq("user_id", context.userId)
      .gte("created_at", eightWeeksAgo);

    const rows = gens ?? [];
    const totalMinutes = rows.reduce((a, r) => a + (r.minutes_saved ?? 0), 0);
    const totalGens = rows.length;

    const byTool: Record<string, number> = {};
    for (const r of rows) byTool[r.tool] = (byTool[r.tool] ?? 0) + 1;

    // per-week sparkline for last 8 weeks
    const weeks: { label: string; count: number }[] = [];
    for (let i = 7; i >= 0; i--) {
      const start = new Date(Date.now() - (i + 1) * 7 * 86400_000);
      const end = new Date(Date.now() - i * 7 * 86400_000);
      const count = rows.filter((r) => {
        const d = new Date(r.created_at);
        return d >= start && d < end;
      }).length;
      weeks.push({ label: `${start.getUTCMonth() + 1}/${start.getUTCDate()}`, count });
    }

    // active days last 7
    const daySet = new Set<string>();
    const sevenAgo = Date.now() - 7 * 86400_000;
    rows.forEach((r) => {
      if (new Date(r.created_at).getTime() >= sevenAgo)
        daySet.add(new Date(r.created_at).toISOString().slice(0, 10));
    });
    const activeDays = daySet.size;
    const productivityScore = Math.min(
      100,
      Math.round((activeDays / 7) * 60 + Math.min(totalGens, 40)),
    );

    return { totalMinutes, totalGens, byTool, weeks, activeDays, productivityScore };
  });