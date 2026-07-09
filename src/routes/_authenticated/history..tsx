import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import ReactMarkdown from "react-markdown";
import { ArrowLeft, Trash2, Copy, Check } from "lucide-react";
import { useGenerations } from "@/hooks/use-local-generations";
import { deleteGeneration } from "@/lib/local-store";
import { toast } from "sonner";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/history/$id")({
  head: () => ({ meta: [{ title: "Generation — TaskPilot" }] }),
  component: GenerationDetail,
});

function GenerationDetail() {
  const { id } = Route.useParams();
  const nav = useNavigate();
  const rows = useGenerations();
  const g = rows.find((r) => r.id === id);
  const [copied, setCopied] = useState(false);

  function remove() {
    deleteGeneration(id);
    toast.success("Deleted");
    nav({ to: "/history" });
  }

  function copy() {
    if (!g) return;
    navigator.clipboard.writeText(g.output_text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  }

  return (
    <div className="mx-auto w-full max-w-3xl p-6 md:p-10">
      <Link to="/history" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to history
      </Link>
      {g ? (
        <>
          <div className="mt-6 flex items-start justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground">{g.tool}</div>
              <h1 className="mt-2 font-display text-3xl">{g.title}</h1>
              <div className="mt-1 text-xs text-muted-foreground">
                {new Date(g.created_at).toLocaleString()} · saved ~{g.minutes_saved}m
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={copy} className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs hover:bg-secondary">
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied" : "Copy"}
              </button>
              <button onClick={remove} className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs text-destructive hover:bg-destructive/10">
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </button>
            </div>
          </div>
          <article className="prose prose-sm mt-8 max-w-none dark:prose-invert prose-headings:font-display">
            <ReactMarkdown>{g.output_text}</ReactMarkdown>
          </article>
        </>
      ) : (
        <div className="mt-10 rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Not found. It may have been deleted.
        </div>
      )}
    </div>
  );
}
