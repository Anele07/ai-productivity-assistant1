import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getDashboardSummary } from "@/lib/generations.functions";
import { Mail, Calendar, ListChecks, Search, Sparkles, Clock, Flame, TrendingUp, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — TaskPilot" }] }),
  component: Dashboard,
});

const QUICK = [
  { icon: Mail, name: "Draft Email", to: "/tools/email", k: "E" },
  { icon: Calendar, name: "Summarize Meeting", to: "/tools/meeting", k: "M" },
  { icon: ListChecks, name: "Plan My Day", to: "/tools/planner", k: "P" },
  { icon: Search, name: "Research", to: "/tools/research", k: "R" },
] as const;

function Dashboard() {
  const nav = useNavigate();
  const summaryFn = useServerFn(getDashboardSummary);
  const q = useQuery({ queryKey: ["dashboard"], queryFn: () => summaryFn({}) });
  const s = q.data;

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const minutes = s?.minutesThisWeek ?? 0;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;

  return (
    <div className="mx-auto w-full max-w-6xl p-6 md:p-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl leading-tight md:text-5xl">
            {greeting}, {s?.displayName ?? "there"}.
          </h1>
          <p className="mt-1 text-muted-foreground">
            {now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })} · Here's your workday.
          </p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {QUICK.map((a) => (
          <button
            key={a.name}
            onClick={() => nav({ to: a.to })}
            className="group flex items-center justify-between rounded-2xl border border-border bg-card p-5 text-left hover:border-foreground hover:elevation-1"
          >
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-secondary group-hover:bg-foreground group-hover:text-background">
                <a.icon className="h-4 w-4" />
              </div>
              <div className="text-sm font-medium">{a.name}</div>
            </div>
            <kbd className="rounded bg-secondary px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">{a.k}</kbd>
          </button>
        ))}
      </div>

      {/* Row: focus + recent */}
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Suggested next</div>
          {s?.hasAnyData ? (
            <div className="mt-3 space-y-3">
              {(s.recent ?? []).slice(0, 3).map((g) => (
                <Link key={g.id} to="/history/$id" params={{ id: g.id }} className="flex items-center justify-between rounded-xl border border-border bg-background p-3 hover:elevation-1">
                  <div className="truncate text-sm">Follow up on <span className="font-medium">{g.title}</span></div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-4 grid gap-3">
              <OnboardingCard icon={Mail} text="Draft your first email — pick a tone, TaskPilot handles the rest." to="/tools/email" />
              <OnboardingCard icon={Calendar} text="Summarize a meeting from raw notes into decisions and action items." to="/tools/meeting" />
              <OnboardingCard icon={ListChecks} text="Plan today — turn priorities into a time-blocked day." to="/tools/planner" />
            </div>
          )}
        </div>

        <div className="space-y-3">
          <StatCard icon={Clock} label="Time saved this week" value={s?.hasAnyData ? `${hrs}h ${mins}m` : "—"} hint="Draft one thing to start counting." />
          <StatCard icon={Flame} label="Productivity streak" value={s?.streak ? `${s.streak} ${s.streak === 1 ? "day" : "days"}` : "—"} hint="Show up tomorrow to keep it alive." />
          <StatCard icon={TrendingUp} label="Most-used tool" value={s?.topTool ? capitalize(s.topTool) : "—"} hint="This week." />
        </div>
      </div>

      {/* Recent work */}
      <div className="mt-10">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-medium">Recent work</div>
          <Link to="/history" className="text-xs text-muted-foreground hover:text-foreground">View all</Link>
        </div>
        {s?.recent && s.recent.length > 0 ? (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {s.recent.map((g) => (
              <Link key={g.id} to="/history/$id" params={{ id: g.id }}
                className="rounded-2xl border border-border bg-card p-4 hover:elevation-1">
                <div className="text-xs uppercase tracking-widest text-muted-foreground">{g.tool}</div>
                <div className="mt-1 truncate font-medium">{g.title}</div>
                <div className="mt-2 text-xs text-muted-foreground">
                  {new Date(g.created_at).toLocaleString()}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No generations yet. Try one of the quick actions above to get started.
          </div>
        )}
      </div>

      <div className="mt-8 flex items-center gap-2 text-xs text-muted-foreground">
        <Sparkles className="h-3.5 w-3.5" />
        AI-generated content should always be reviewed before it's sent.
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, hint }: { icon: any; label: string; value: string; hint: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">{label}</div>
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
      <div className="mt-2 font-display text-3xl tabular">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{hint}</div>
    </div>
  );
}

function OnboardingCard({ icon: Icon, text, to }: { icon: any; text: string; to: string }) {
  return (
    <Link to={to} className="flex items-start gap-3 rounded-xl border border-border bg-background p-3 hover:elevation-1">
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-secondary">
        <Icon className="h-4 w-4" />
      </div>
      <div className="text-sm">{text}</div>
    </Link>
  );
}

function capitalize(s: string) { return s.charAt(0).toUpperCase() + s.slice(1); }