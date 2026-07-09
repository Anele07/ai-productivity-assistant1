import { createFileRoute, Link } from "@tanstack/react-router";
import { EmptyState } from "@/components/empty-state";
import { History as HistoryIcon, Trash2 } from "lucide-react";
import { useGenerations } from "@/hooks/use-local-generations";
import { deleteGeneration } from "@/lib/local-store";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/history")({
  head: () => ({ meta: [{ title: "History — TaskPilot" }] }),
  component: HistoryPage,
});

function HistoryPage() {
  const rows = useGenerations();

  function remove(id: string) {
    deleteGeneration(id);
    toast.success("Deleted");
  }

  return (
    <div className="mx-auto w-full max-w-6xl p-6 md:p-10">
      <h1 className="font-display text-4xl">History</h1>
      <p className="mt-1 text-muted-foreground">Everything you've drafted with TaskPilot, saved in your browser.</p>

      <div className="mt-8">
        {rows.length > 0 ? (
          <div className="grid gap-2">
            {rows.map((g) => (
              <div key={g.id} className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 hover:elevation-1">
                <Link to="/history/$id" params={{ id: g.id }} className="min-w-0 flex-1">
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{g.tool}</div>
                  <div className="truncate text-sm font-medium">{g.title}</div>
                </Link>
                <div className="text-xs text-muted-foreground">{new Date(g.created_at).toLocaleDateString()}</div>
                <button onClick={() => remove(g.id)} className="text-muted-foreground hover:text-destructive" aria-label="Delete">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
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
