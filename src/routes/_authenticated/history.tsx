import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { listGenerations } from "@/lib/generations.functions";
import { EmptyState } from "@/components/empty-state";
import { History as HistoryIcon } from "lucide-react";

export const Route = createFileRoute("/_authenticated/history")({
  head: () => ({ meta: [{ title: "History — TaskPilot" }] }),
  component: HistoryPage,
});

function HistoryPage() {
  const fn = useServerFn(listGenerations);
  const q = useQuery({ queryKey: ["generations", "all"], queryFn: () => fn({ data: { limit: 100 } }) });

  return (
    <div className="mx-auto w-full max-w-6xl p-6 md:p-10">
      <h1 className="font-display text-4xl">History</h1>
      <p className="mt-1 text-muted-foreground">Everything you've drafted with TaskPilot, searchable forever.</p>

      <div className="mt-8">
        {q.data && q.data.length > 0 ? (
          <div className="grid gap-2">
            {q.data.map((g) => (
              <Link key={g.id} to="/history/$id" params={{ id: g.id }}
                className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 hover:elevation-1">
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{g.tool}</div>
                  <div className="truncate text-sm font-medium">{g.title}</div>
                </div>
                <div className="ml-4 text-xs text-muted-foreground">
                  {new Date(g.created_at).toLocaleDateString()}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={HistoryIcon}
            title="No AI generations yet."
            description="Create your first document to start building your workspace."
            action={{ label: "Draft an email", to: "/tools/email" }}
          />
        )}
      </div>
    </div>
  );
}