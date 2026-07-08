import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Sparkles, Copy, Check } from "lucide-react";
import { TOOLS, TONES, type ToolId } from "@/lib/tool-config";
import { runTool, listGenerations } from "@/lib/generations.functions";
import { Link } from "@tanstack/react-router";

export function ToolPage({ tool }: { tool: ToolId }) {
  const cfg = TOOLS[tool];
  const Icon = cfg.icon;
  const [input, setInput] = useState("");
  const [tone, setTone] = useState<string>("warm and confident");
  const [output, setOutput] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const qc = useQueryClient();
  const run = useServerFn(runTool);
  const list = useServerFn(listGenerations);

  const history = useQuery({
    queryKey: ["generations", tool],
    queryFn: () => list({ data: { tool, limit: 8 } }),
  });

  const mutation = useMutation({
    mutationFn: async () => run({ data: { tool, input, tone: cfg.supportsTone ? tone : undefined } }),
    onSuccess: (gen) => {
      setOutput(gen.output_text ?? "");
      qc.invalidateQueries({ queryKey: ["generations"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Draft ready");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Something went wrong"),
  });

  function copyOutput() {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  }

  return (
    <div className="mx-auto w-full max-w-6xl p-6 md:p-10">
      <div className="flex items-start gap-4">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-foreground text-background">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-display text-3xl">{cfg.name}</h1>
          <p className="text-muted-foreground">{cfg.tagline}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Input */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <label className="text-sm font-medium">{cfg.inputLabel}</label>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={cfg.inputPlaceholder}
            rows={12}
            className="mt-3 resize-none"
          />
          <div className="mt-4 flex flex-wrap items-center gap-3">
            {cfg.supportsTone && (
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TONES.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Button
              onClick={() => mutation.mutate()}
              disabled={!input.trim() || mutation.isPending}
              className="gap-2"
            >
              {mutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              Generate
            </Button>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            AI-generated — verify important details before you send.
          </p>
        </div>

        {/* Output */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">Output</div>
            {output && (
              <button
                onClick={copyOutput}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied" : "Copy"}
              </button>
            )}
          </div>
          <div className="mt-4 min-h-[280px]">
            {output ? (
              <article className="prose prose-sm max-w-none dark:prose-invert prose-headings:font-display">
                <ReactMarkdown>{output}</ReactMarkdown>
              </article>
            ) : (
              <div className="grid h-full min-h-[240px] place-items-center text-center text-sm text-muted-foreground">
                Your draft appears here. Nothing is shared — everything stays in your workspace.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent */}
      <div className="mt-10">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-medium text-muted-foreground">Recent {cfg.name.toLowerCase()} drafts</div>
          <Link to="/history" className="text-xs text-muted-foreground hover:text-foreground">View all</Link>
        </div>
        <div className="grid gap-2">
          {(history.data ?? []).map((g) => (
            <Link
              key={g.id}
              to="/history/$id"
              params={{ id: g.id }}
              className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 hover:elevation-1"
            >
              <div className="truncate text-sm">{g.title}</div>
              <div className="ml-4 text-xs text-muted-foreground">
                {new Date(g.created_at).toLocaleDateString()}
              </div>
            </Link>
          ))}
          {history.data && history.data.length === 0 && (
            <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              No {cfg.name.toLowerCase()} drafts yet. Your first one lands here.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}