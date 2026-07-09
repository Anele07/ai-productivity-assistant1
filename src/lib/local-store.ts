import { TOOLS, type ToolId } from "./tool-config";

export type Generation = {
  id: string;
  tool: ToolId;
  title: string;
  output_text: string;
  input: string;
  tone?: string | null;
  minutes_saved: number;
  favorited: boolean;
  created_at: string;
};

const KEY = "taskpilot.generations.v1";

function isBrowser() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

export function readAll(): Generation[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as Generation[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function writeAll(items: Generation[]) {
  if (!isBrowser()) return;
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("taskpilot:generations"));
}

export function addGeneration(g: Omit<Generation, "id" | "created_at" | "favorited" | "minutes_saved"> & { minutes_saved?: number }): Generation {
  const row: Generation = {
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    favorited: false,
    minutes_saved: g.minutes_saved ?? TOOLS[g.tool].minutesSaved,
    ...g,
  };
  const items = readAll();
  items.unshift(row);
  writeAll(items);
  return row;
}

export function deleteGeneration(id: string) {
  writeAll(readAll().filter((g) => g.id !== id));
}

export function toggleFavorite(id: string) {
  writeAll(readAll().map((g) => (g.id === id ? { ...g, favorited: !g.favorited } : g)));
}

export function getGeneration(id: string): Generation | undefined {
  return readAll().find((g) => g.id === id);
}

export function listGenerations(opts?: { tool?: ToolId; limit?: number }): Generation[] {
  let rows = readAll();
  if (opts?.tool) rows = rows.filter((g) => g.tool === opts.tool);
  if (opts?.limit) rows = rows.slice(0, opts.limit);
  return rows;
}

export function clearAll() {
  writeAll([]);
}

// Derived helpers
export function getDashboardSummary() {
  const all = readAll();
  const sevenDaysAgo = Date.now() - 7 * 86400_000;
  const week = all.filter((g) => new Date(g.created_at).getTime() >= sevenDaysAgo);
  const minutesThisWeek = week.reduce((a, g) => a + g.minutes_saved, 0);
  const toolCount = new Map<string, number>();
  for (const g of week) toolCount.set(g.tool, (toolCount.get(g.tool) ?? 0) + 1);
  const topTool = [...toolCount.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  const days = new Set(all.map((g) => new Date(g.created_at).toISOString().slice(0, 10)));
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 60; i++) {
    const d = new Date(today.getTime() - i * 86400_000).toISOString().slice(0, 10);
    if (days.has(d)) streak++;
    else if (i === 0) continue;
    else break;
  }
  return {
    recent: all.slice(0, 6),
    minutesThisWeek,
    totalThisWeek: week.length,
    topTool,
    streak,
    hasAnyData: all.length > 0,
  };
}

export function getAnalytics() {
  const all = readAll();
  const eightWeeksAgo = Date.now() - 56 * 86400_000;
  const rows = all.filter((g) => new Date(g.created_at).getTime() >= eightWeeksAgo);
  const totalMinutes = rows.reduce((a, r) => a + r.minutes_saved, 0);
  const totalGens = rows.length;
  const byTool: Record<string, number> = {};
  for (const r of rows) byTool[r.tool] = (byTool[r.tool] ?? 0) + 1;
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
  const daySet = new Set<string>();
  const sevenAgo = Date.now() - 7 * 86400_000;
  rows.forEach((r) => {
    if (new Date(r.created_at).getTime() >= sevenAgo)
      daySet.add(new Date(r.created_at).toISOString().slice(0, 10));
  });
  const activeDays = daySet.size;
  const productivityScore = Math.min(100, Math.round((activeDays / 7) * 60 + Math.min(totalGens, 40)));
  return { totalMinutes, totalGens, byTool, weeks, activeDays, productivityScore };
}
