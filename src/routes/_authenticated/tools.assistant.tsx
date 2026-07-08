import { createFileRoute } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Send, Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/tools/assistant")({
  head: () => ({ meta: [{ title: "AI Assistant — TaskPilot" }] }),
  component: AssistantPage,
});

const SUGGESTED = [
  "Draft a follow-up email to the team about tomorrow's release.",
  "Summarize this into an executive brief:",
  "Plan the rest of my day around a 2pm client call.",
  "Give me 3 questions to ask a candidate for a PM role.",
];

function AssistantPage() {
  const [token, setToken] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setToken(data.session?.access_token ?? null));
  }, []);

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      headers: () => ({ Authorization: token ? `Bearer ${token}` : "" }),
    }),
  });

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, status]);

  function submit(text: string) {
    if (!text.trim() || !token) return;
    sendMessage({ text });
    setInput("");
  }

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] flex-col">
      <div className="border-b border-border px-6 py-4">
        <div className="mx-auto flex w-full max-w-3xl items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-foreground text-background">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <div className="font-display text-xl">AI Assistant</div>
            <div className="text-xs text-muted-foreground">Ask about your work — I know your recent drafts and open tasks.</div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl px-6 py-8">
          {messages.length === 0 ? (
            <div className="mt-8">
              <div className="font-display text-2xl">Ready when you are.</div>
              <div className="mt-1 text-sm text-muted-foreground">Try one of these to start:</div>
              <div className="mt-4 grid gap-2">
                {SUGGESTED.map((s) => (
                  <button key={s} onClick={() => submit(s)}
                    className="rounded-xl border border-border bg-card px-4 py-3 text-left text-sm hover:elevation-1">
                    {s}
                  </button>
                ))}
              </div>
              <div className="mt-6 text-xs text-muted-foreground">
                TaskPilot drafts. You decide. Verify important details before you send.
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((m) => (
                <div key={m.id} className={m.role === "user" ? "flex justify-end" : ""}>
                  <div className={m.role === "user"
                    ? "max-w-[85%] rounded-2xl bg-foreground px-4 py-3 text-sm text-background"
                    : "max-w-[95%] rounded-2xl border border-border bg-card px-4 py-3 text-sm"}>
                    {m.parts.map((p, i) =>
                      p.type === "text" ? (
                        <article key={i} className="prose prose-sm max-w-none dark:prose-invert prose-headings:font-display prose-p:my-2">
                          <ReactMarkdown>{p.text}</ReactMarkdown>
                        </article>
                      ) : null,
                    )}
                  </div>
                </div>
              ))}
              {status === "submitted" && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Thinking…
                </div>
              )}
              <div ref={endRef} />
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-border bg-background/80 px-6 py-4 backdrop-blur">
        <form
          onSubmit={(e) => { e.preventDefault(); submit(input); }}
          className="mx-auto flex w-full max-w-3xl items-end gap-2"
        >
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(input); }
            }}
            placeholder="Ask TaskPilot for help…"
            rows={2}
            className="resize-none"
          />
          <Button type="submit" disabled={!input.trim() || status === "submitted"} className="h-full">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}