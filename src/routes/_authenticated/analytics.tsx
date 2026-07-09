import { createFileRoute } from "@tanstack/react-router";
import { EmptyState } from "@/components/empty-state";
import { BarChart3, Clock, TrendingUp, Flame } from "lucide-react";
import { useGenerations } from "@/hooks/use-local-generations";
import { getAnalytics } from "@/lib/local-store";

export const Route = createFileRoute("/_authenticated/analytics")({
  head: () => ({ meta: [{ title: "Analytics — TaskPilot" }] }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  useGenerations();
  const a = getAnalytics();

  if (a.totalGens === 0) {
    return (
      <div className="mx-auto w-full max-w-4xl p-6 md:p-10">
        <h1 className="font-display text-4xl">Analytics</h1>
        <div className="mt-8">
          <EmptyState
            icon={BarChart3}
            title="No productivity data yet."
            description="Use TaskPilot for a couple of days to unlock personalized insights."
            action={{ label: "Start with an email", to: "/tools/email" }}
          />
        </div>
      </div>
    );
  }

  const totalHours = Math.floor(a.totalMinutes / 60);
  const remMin = a.totalMinutes % 60;
  const maxCount = Math.max(1, ...a.weeks.map((w) => w.count));
  const total = Object.values(a.byTool).reduce((s, n) => s + n, 0);

  return (
    <div className="mx-auto w-full max-w-6xl p-6 md:p-10">
      <h1 className="font-display text-4xl">Analytics</h1>
      <p className="mt-1 text-muted-foreground">Outcomes, not vanity counts.</p>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            Time saved (last 8 weeks) <Clock className="h-3.5 w-3.5" />
          </div>
          <div className="mt-3 font-display text-5xl tabular">{totalHours}h {remMin}m</div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            Weekly productivity score <TrendingUp className="h-3.5 w-3.5" />
          </div>
          <div className="mt-3 font-display text-5xl tabular">{a.productivityScore}</div>
          <div className="mt-1 text-xs text-muted-foreground">out of 100</div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            Active days this week <Flame className="h-3.5 w-3.5" />
          </div>
          <div className="mt-3 font-display text-5xl tabular">{a.activeDays}</div>
          <div className="mt-1 text-xs text-muted-foreground">of 7</div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card p-6">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">Weekly activity</div>
        <div className="mt-6 flex h-32 items-end gap-2">
          {a.weeks.map((w) => (
            <div key={w.label} className="flex flex-1 flex-col items-center gap-2">
              <div className="w-full rounded-t bg-foreground" style={{ height: `${(w.count / maxCount) * 100}%`, minHeight: 2 }} />
              <div className="text-[10px] text-muted-foreground">{w.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card p-6">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">Tool mix</div>
        <div className="mt-4 space-y-3">
          {Object.entries(a.byTool).map(([tool, count]) => {
            const pct = total ? Math.round((count / total) * 100) : 0;
            return (
              <div key={tool}>
                <div className="flex items-center justify-between text-sm">
                  <span className="capitalize">{tool}</span>
                  <span className="tabular text-muted-foreground">{pct}%</span>
                </div>
                <div className="mt-1 h-1.5 w-full rounded-full bg-secondary">
                  <div className="h-full rounded-full bg-foreground" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
