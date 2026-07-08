import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight,
  Mail,
  Calendar,
  ListChecks,
  Sparkles,
  Search,
  Command,
  Shield,
  Clock,
  BookOpen,
  MoveRight,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/")({
  component: Landing,
});

const FEATURES = [
  {
    id: "email",
    icon: Mail,
    name: "Smart Email",
    tagline: "Draft the reply. Keep the voice.",
    body: "Turn a rough thought into a polished, on-brand email in seconds. Pick a tone, edit inline, ship it.",
    demo: [
      "Subject: Q3 launch — updated timeline",
      "Hi Priya,",
      "Following up on Monday's call — we've moved the launch to Sept 24 to give the team a clean two-week runway…",
    ],
  },
  {
    id: "meeting",
    icon: Calendar,
    name: "Meeting Intelligence",
    tagline: "Never lose a decision.",
    body: "Paste raw notes. Get decisions, action items with owners, and open questions — one click to send to your planner.",
    demo: [
      "Decisions · Ship Sept 24 · Hold on pricing until legal signs off",
      "Action items · Priya to draft press kit (Fri) · Sam to book QA slot",
      "Open questions · Do we need a beta cohort?",
    ],
  },
  {
    id: "planner",
    icon: ListChecks,
    name: "AI Task Planner",
    tagline: "Start every day with a plan.",
    body: "Tell TaskPilot your priorities. Get a realistic, time-blocked day back — reshaped as things change.",
    demo: [
      "09:00  Deep work · Draft proposal (90m)",
      "10:30  Review PRs · 3 open",
      "13:00  1:1 with Sam · prep 5m",
      "15:00  Follow-ups from Monday's standup",
    ],
  },
  {
    id: "research",
    icon: Search,
    name: "Research Assistant",
    tagline: "Executive summaries, not walls of text.",
    body: "Get three key insights and two recommendations on any topic — sized for a leadership audience.",
    demo: [
      "Insights · Category is consolidating around bundled workflows",
      "· Buyers now expect in-app AI, not standalone tools",
      "Recommendation · Lead with workflow, not features",
    ],
  },
  {
    id: "assistant",
    icon: Sparkles,
    name: "AI Workplace Assistant",
    tagline: "One thread. All your context.",
    body: "Ask about last week's meetings, plan tomorrow, or draft a reply — the assistant knows what you've already done.",
    demo: [
      "You · Draft a follow-up to Priya about the launch",
      "Assistant · Pulling from Monday's meeting notes… here's a draft in your Email tool.",
    ],
  },
] as const;

function Landing() {
  const [tab, setTab] = useState<(typeof FEATURES)[number]["id"]>("email");
  const active = FEATURES.find((f) => f.id === tab)!;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2">
            <Logo />
            <span className="text-lg font-semibold tracking-tight">TaskPilot</span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
            <a href="#features" className="hover:text-foreground">Features</a>
            <a href="#workflow" className="hover:text-foreground">Workflow</a>
            <a href="#faq" className="hover:text-foreground">FAQ</a>
            <Link to="/responsible-ai" className="hover:text-foreground">Responsible AI</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link
              to="/auth"
              className="hidden rounded-full px-4 py-2 text-sm text-muted-foreground hover:text-foreground md:inline-flex"
            >
              Sign in
            </Link>
            <Link
              to="/auth"
              search={{ mode: "signup" }}
              className="inline-flex items-center gap-1 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition-transform hover:-translate-y-px"
            >
              Start free <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid w-full max-w-6xl gap-16 px-6 py-24 md:grid-cols-12 md:py-32">
          <div className="md:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--accent-brand)]" />
              AI that drafts. You decide.
            </div>
            <h1 className="mt-6 font-display text-5xl leading-[1.02] tracking-tight md:text-7xl">
              Your workday,<br /><em className="not-italic text-muted-foreground">on autopilot.</em>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              TaskPilot turns the repetitive parts of office work — email, meetings, planning,
              research — into one calm workspace that remembers what you've done and suggests
              what's next.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/auth"
                search={{ mode: "signup" }}
                className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background elevation-2 transition-transform hover:-translate-y-px"
              >
                Start free <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#workflow"
                className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-3 text-sm text-foreground hover:bg-secondary"
              >
                See how it works
              </a>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              No credit card. Cancel anytime. Your data stays yours.
            </p>
          </div>
          <div className="md:col-span-5">
            <HeroStill />
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-y border-border bg-card/40">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-6 px-6 py-6 text-xs uppercase tracking-wider text-muted-foreground">
          <span>Built for teams like these:</span>
          {["Consultancies", "Agencies", "Ops teams", "Founders", "Freelancers"].map((x) => (
            <span key={x} className="text-foreground/70">{x}</span>
          ))}
        </div>
      </section>

      {/* Feature showcase */}
      <section id="features" className="mx-auto w-full max-w-6xl px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">The workspace</p>
          <h2 className="mt-3 font-display text-4xl leading-tight md:text-5xl">
            Five tools. One memory.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Everything you draft is saved, searchable, and connected — so tomorrow's work builds on today's.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-12">
          <div className="flex flex-row gap-2 overflow-x-auto md:col-span-4 md:flex-col">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              const isActive = f.id === tab;
              return (
                <button
                  key={f.id}
                  onClick={() => setTab(f.id)}
                  className={`group flex min-w-max items-start gap-3 rounded-2xl border p-4 text-left transition-all md:min-w-0 ${
                    isActive
                      ? "border-foreground bg-card elevation-1"
                      : "border-border bg-transparent hover:bg-card"
                  }`}
                >
                  <div
                    className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${
                      isActive ? "bg-foreground text-background" : "bg-secondary text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">{f.name}</div>
                    <div className="mt-0.5 text-xs text-muted-foreground">{f.tagline}</div>
                  </div>
                </button>
              );
            })}
          </div>
          <div className="md:col-span-8">
            <div className="rounded-3xl border border-border bg-card p-8 elevation-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-[color:var(--success)]" />
                <span>{active.name}</span>
              </div>
              <h3 className="mt-3 font-display text-3xl">{active.tagline}</h3>
              <p className="mt-3 max-w-lg text-muted-foreground">{active.body}</p>
              <div className="mt-6 rounded-2xl border border-border bg-background p-5 font-mono text-sm leading-relaxed">
                {active.demo.map((line, i) => (
                  <div key={i} className="text-foreground/80">
                    {line}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section id="workflow" className="border-y border-border bg-card/40">
        <div className="mx-auto w-full max-w-6xl px-6 py-24">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">The proof</p>
            <h2 className="mt-3 font-display text-4xl md:text-5xl">
              One meeting. Five outputs. Zero context-switching.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Watch how a single set of raw meeting notes flows through TaskPilot — captured
              once, reused everywhere.
            </p>
          </div>

          <ol className="mt-12 grid gap-4 md:grid-cols-5">
            {[
              { n: "01", t: "Meeting notes", d: "Paste the transcript or bullet notes." },
              { n: "02", t: "Action items", d: "Owners, deadlines, decisions — extracted." },
              { n: "03", t: "Task planner", d: "One click sends them into today's plan." },
              { n: "04", t: "Follow-up email", d: "Draft ready with attendees and next steps." },
              { n: "05", t: "History", d: "Everything linked and searchable forever." },
            ].map((s, i) => (
              <li key={s.n} className="relative rounded-2xl border border-border bg-background p-5">
                <div className="font-mono text-xs text-muted-foreground">{s.n}</div>
                <div className="mt-2 font-medium">{s.t}</div>
                <div className="mt-1 text-sm text-muted-foreground">{s.d}</div>
                {i < 4 && (
                  <MoveRight className="absolute -right-4 top-1/2 hidden h-4 w-4 -translate-y-1/2 text-muted-foreground md:block" />
                )}
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Benefits */}
      <section className="mx-auto w-full max-w-6xl px-6 py-24">
        <div className="grid gap-6 md:grid-cols-4">
          {[
            { icon: Clock, h: "≈ 5 hours a week", d: "reclaimed from repetitive drafting." },
            { icon: Calendar, h: "Every decision", d: "captured and never lost in Slack." },
            { icon: ListChecks, h: "Start with a plan", d: "not with a blank calendar." },
            { icon: BookOpen, h: "Searchable memory", d: "of every draft, forever." },
          ].map((b) => {
            const Icon = b.icon;
            return (
              <div key={b.h} className="rounded-2xl border border-border p-6">
                <Icon className="h-5 w-5 text-[color:var(--accent-brand)]" />
                <div className="mt-4 font-display text-2xl leading-tight">{b.h}</div>
                <div className="mt-2 text-sm text-muted-foreground">{b.d}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Testimonials (labeled) */}
      <section className="border-y border-border bg-card/40">
        <div className="mx-auto w-full max-w-6xl px-6 py-24">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Illustrative — collected during pilot
          </p>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {[
              {
                q: "It replaced three tools I was juggling. Meetings, drafts, and my daily plan finally live together.",
                a: "Ops lead, mid-size agency",
              },
              {
                q: "The follow-up email is already drafted before I've closed the meeting tab. That's the whole product for me.",
                a: "Founder, 2-person consultancy",
              },
              {
                q: "I stopped losing decisions in Slack. Everything I run through TaskPilot is still there next week.",
                a: "Project coordinator, SaaS",
              },
            ].map((t, i) => (
              <figure key={i} className="rounded-2xl border border-border bg-background p-6">
                <blockquote className="font-display text-xl leading-snug">"{t.q}"</blockquote>
                <figcaption className="mt-4 text-sm text-muted-foreground">— {t.a}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Responsible AI strip */}
      <section className="mx-auto w-full max-w-6xl px-6 py-20">
        <div className="grid gap-8 rounded-3xl border border-border bg-card p-10 md:grid-cols-2">
          <div>
            <Shield className="h-5 w-5 text-[color:var(--accent-brand)]" />
            <h3 className="mt-4 font-display text-3xl leading-tight">
              AI you can bring to work.
            </h3>
          </div>
          <div className="text-muted-foreground">
            TaskPilot is honest about what AI is good at — and what it isn't. Every output is
            editable. Nothing is shared across accounts. And we keep a page explaining exactly
            how we think about this.
            <div className="mt-4">
              <Link
                to="/responsible-ai"
                className="inline-flex items-center gap-1 text-sm text-foreground underline underline-offset-4"
              >
                Read our approach <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto w-full max-w-3xl px-6 py-20">
        <h2 className="font-display text-4xl">Questions, answered.</h2>
        <Accordion type="single" collapsible className="mt-8">
          {[
            {
              q: "Is my data private?",
              a: "Yes. Your workspace is scoped to you — nothing is shared across accounts, and every generation lives only in your own history.",
            },
            {
              q: "Which AI model powers TaskPilot?",
              a: "TaskPilot runs on frontier language models via a managed AI gateway. You don't need to bring your own key.",
            },
            {
              q: "Will it replace my job?",
              a: "No. TaskPilot drafts — you decide. It shortens the busywork so you spend more time on the parts that matter.",
            },
            {
              q: "Can I export what I've written?",
              a: "Yes — every generation can be copied, and export to PDF/DOCX is on the roadmap.",
            },
            {
              q: "What does it cost?",
              a: "TaskPilot is free during the pilot. Paid plans arrive later this year.",
            },
          ].map((item, i) => (
            <AccordionItem key={i} value={`i-${i}`}>
              <AccordionTrigger className="text-left">{item.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* Final CTA */}
      <section className="mx-auto w-full max-w-6xl px-6 pb-24">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-foreground p-14 text-background md:p-20">
          <div className="max-w-2xl">
            <h2 className="font-display text-4xl leading-tight md:text-6xl">
              Start your first draft in under a minute.
            </h2>
            <p className="mt-4 text-background/70">
              Create your workspace, try one tool, and let TaskPilot start remembering.
            </p>
            <Link
              to="/auth"
              search={{ mode: "signup" }}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-background px-6 py-3 text-sm font-medium text-foreground hover:-translate-y-px"
            >
              Create your workspace <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <Command className="pointer-events-none absolute -bottom-10 -right-10 h-64 w-64 text-background/5" />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-12 text-sm text-muted-foreground md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2 text-foreground">
              <Logo />
              <span className="font-semibold">TaskPilot</span>
            </div>
            <p className="mt-3">Your workday, on autopilot.</p>
          </div>
          <div>
            <div className="mb-3 font-medium text-foreground">Product</div>
            <ul className="space-y-2">
              <li><a href="#features" className="hover:text-foreground">Features</a></li>
              <li><a href="#workflow" className="hover:text-foreground">Workflow</a></li>
              <li><Link to="/auth" className="hover:text-foreground">Sign in</Link></li>
            </ul>
          </div>
          <div>
            <div className="mb-3 font-medium text-foreground">Trust</div>
            <ul className="space-y-2">
              <li><Link to="/responsible-ai" className="hover:text-foreground">Responsible AI</Link></li>
              <li><a href="#faq" className="hover:text-foreground">FAQ</a></li>
            </ul>
          </div>
          <div>
            <div className="mb-3 font-medium text-foreground">Company</div>
            <ul className="space-y-2">
              <li>© {new Date().getFullYear()} TaskPilot</li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Logo() {
  return (
    <span className="grid h-8 w-8 place-items-center rounded-xl bg-foreground text-background">
      <span className="font-display text-lg leading-none">T</span>
    </span>
  );
}

function HeroStill() {
  return (
    <div className="relative rounded-3xl border border-border bg-card p-4 elevation-2">
      <div className="flex items-center gap-1.5 px-2 py-1">
        <span className="h-2.5 w-2.5 rounded-full bg-muted" />
        <span className="h-2.5 w-2.5 rounded-full bg-muted" />
        <span className="h-2.5 w-2.5 rounded-full bg-muted" />
        <span className="ml-3 text-xs text-muted-foreground">taskpilot.app / dashboard</span>
      </div>
      <div className="mt-3 rounded-2xl border border-border bg-background p-5">
        <div className="font-display text-2xl">Good morning, Alex.</div>
        <div className="text-sm text-muted-foreground">Here's your workday.</div>
        <div className="mt-5 grid grid-cols-2 gap-2">
          {[
            { icon: Mail, name: "Draft Email", k: "E" },
            { icon: Calendar, name: "Summarize Meeting", k: "M" },
            { icon: ListChecks, name: "Plan My Day", k: "P" },
            { icon: Search, name: "Research", k: "R" },
          ].map((q) => {
            const Icon = q.icon;
            return (
              <div key={q.name} className="flex items-center justify-between rounded-xl border border-border p-3 text-sm">
                <div className="flex items-center gap-2">
                  <Icon className="h-3.5 w-3.5" />
                  {q.name}
                </div>
                <kbd className="rounded bg-secondary px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                  {q.k}
                </kbd>
              </div>
            );
          })}
        </div>
        <div className="mt-4 rounded-xl border border-border bg-card p-3">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Suggested next</div>
          <div className="mt-1 text-sm">You have 4 open action items from Monday's standup — plan them?</div>
        </div>
        <div className="mt-3 flex items-center justify-between rounded-xl border border-border bg-card p-3 text-sm">
          <span className="text-muted-foreground">Time saved this week</span>
          <span className="tabular font-semibold">3h 20m</span>
        </div>
      </div>
    </div>
  );
}
