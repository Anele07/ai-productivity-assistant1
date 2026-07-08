import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { listTemplates } from "@/lib/library.functions";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export const Route = createFileRoute("/_authenticated/library")({
  head: () => ({ meta: [{ title: "Prompt Library — TaskPilot" }] }),
  component: LibraryPage,
});

function LibraryPage() {
  const fn = useServerFn(listTemplates);
  const q = useQuery({ queryKey: ["templates"], queryFn: () => fn({}) });
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<string>("All");
  const nav = useNavigate();

  const rows = q.data ?? [];
  const categories = ["All", ...Array.from(new Set(rows.map((r) => r.category)))];
  const filtered = rows.filter((r) => {
    const matchCat = cat === "All" || r.category === cat;
    const matchQ = !query || (r.name + " " + r.body).toLowerCase().includes(query.toLowerCase());
    return matchCat && matchQ;
  });

  return (
    <div className="mx-auto w-full max-w-6xl p-6 md:p-10">
      <h1 className="font-display text-4xl">Prompt Library</h1>
      <p className="mt-1 text-muted-foreground">Reusable professional templates. Curated to start, yours to extend.</p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search templates…" value={query} onChange={(e) => setQuery(e.target.value)} className="pl-9" />
        </div>
        <div className="flex flex-wrap gap-1">
          {categories.map((c) => (
            <button key={c} onClick={() => setCat(c)}
              className={`rounded-full border px-3 py-1 text-xs ${c === cat ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground hover:text-foreground"}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((t) => (
          <button key={t.id} onClick={() => nav({ to: `/tools/${t.tool}` as any })}
            className="rounded-2xl border border-border bg-card p-5 text-left hover:elevation-1">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{t.category} · {t.tool}</div>
            <div className="mt-1 font-medium">{t.name}</div>
            <div className="mt-2 line-clamp-3 text-xs text-muted-foreground">{t.body}</div>
          </button>
        ))}
      </div>
    </div>
  );
}