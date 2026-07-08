import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getGeneration } from "@/lib/generations.functions";
import ReactMarkdown from "react-markdown";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/_authenticated/history/$id")({
  head: () => ({ meta: [{ title: "Generation — TaskPilot" }] }),
  component: GenerationDetail,
});

function GenerationDetail() {
  const { id } = Route.useParams();
  const fn = useServerFn(getGeneration);
  const q = useQuery({ queryKey: ["generation", id], queryFn: () => fn({ data: { id } }) });
  const g = q.data;

  return (
    <div className="mx-auto w-full max-w-3xl p-6 md:p-10">
      <Link to="/history" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to history
      </Link>
      {g && (
        <>
          <div className="mt-6 text-xs uppercase tracking-widest text-muted-foreground">{g.tool}</div>
          <h1 className="mt-2 font-display text-3xl">{g.title}</h1>
          <div className="mt-1 text-xs text-muted-foreground">
            {new Date(g.created_at).toLocaleString()} · saved ~{g.minutes_saved}m
          </div>
          <article className="prose prose-sm mt-8 max-w-none dark:prose-invert prose-headings:font-display">
            <ReactMarkdown>{g.output_text ?? ""}</ReactMarkdown>
          </article>
        </>
      )}
    </div>
  );
}