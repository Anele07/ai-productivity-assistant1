import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Shield } from "lucide-react";

export const Route = createFileRoute("/responsible-ai")({
  head: () => ({
    meta: [
      { title: "Responsible AI — TaskPilot" },
      {
        name: "description",
        content:
          "How TaskPilot thinks about AI in the workplace: honesty, privacy, and the human in the loop.",
      },
    ],
  }),
  component: ResponsibleAI,
});

function ResponsibleAI() {
  return (
    <div className="mx-auto min-h-screen w-full max-w-3xl px-6 py-16">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> Back home
      </Link>
      <Shield className="mt-8 h-6 w-6 text-[color:var(--accent-brand)]" />
      <h1 className="mt-4 font-display text-5xl leading-tight">Responsible AI, in plain language.</h1>
      <p className="mt-6 text-lg text-muted-foreground">
        TaskPilot helps you draft, summarize, and plan — but you're the one who decides what to send.
        Here's how we think about that responsibility.
      </p>

      {SECTIONS.map((s) => (
        <section key={s.h} className="mt-12">
          <h2 className="font-display text-2xl">{s.h}</h2>
          <p className="mt-3 text-muted-foreground">{s.p}</p>
        </section>
      ))}

      <div className="mt-16 rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
        <strong className="text-foreground">Our promise:</strong> AI that drafts. You decide.
      </div>
    </div>
  );
}

const SECTIONS = [
  { h: "AI can be wrong.", p: "TaskPilot uses large language models. They can misremember, over-simplify, or invent details. Read what it drafts before you send it — treat every output as a first draft, not a final answer." },
  { h: "Keep confidential data confidential.", p: "Don't paste secrets, regulated data, or anything you wouldn't share with a temp employee. TaskPilot is built for daily work, not for handling material you would take extra care with." },
  { h: "Your workspace is yours.", p: "Your generations, meeting notes, and templates are scoped to your account. Nothing you create is shared with other users, and nothing is used to make TaskPilot smarter without your consent." },
  { h: "AI supports judgment. It doesn't replace it.", p: "A time-blocked day is a suggestion, not a mandate. A drafted email is a starting point, not a decision. TaskPilot works best when a human stays in the loop." },
  { h: "Bias and harm.", p: "Language models can reflect bias in their training data. If a generation feels off — off-tone, off-topic, unfair — regenerate or rewrite it. Don't ship what doesn't feel right." },
];