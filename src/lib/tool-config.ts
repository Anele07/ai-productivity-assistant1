import { Mail, Calendar, ListChecks, Search, Sparkles, type LucideIcon } from "lucide-react";

export type ToolId = "email" | "meeting" | "planner" | "research" | "assistant";

export interface ToolConfig {
  id: ToolId;
  name: string;
  tagline: string;
  icon: LucideIcon;
  minutesSaved: number;
  system: string;
  inputLabel: string;
  inputPlaceholder: string;
  supportsTone?: boolean;
}

export const TOOLS: Record<ToolId, ToolConfig> = {
  email: {
    id: "email",
    name: "Smart Email",
    tagline: "Draft the reply. Keep the voice.",
    icon: Mail,
    minutesSaved: 6,
    supportsTone: true,
    inputLabel: "What should the email say?",
    inputPlaceholder: "e.g. Follow up with Priya about the Q3 launch. Confirm the Sept 24 date and ask for the press kit draft by Friday.",
    system:
      "You are TaskPilot's Smart Email drafter. Return a polished, ready-to-send email in Markdown. Include a Subject line as the first line (prefixed with 'Subject: '), then a blank line, then the body. Keep it concise, warm, and professional unless the user asks otherwise. Never invent facts or names that are not in the user's brief. Never mention that you are an AI.",
  },
  meeting: {
    id: "meeting",
    name: "Meeting Intelligence",
    tagline: "Never lose a decision.",
    icon: Calendar,
    minutesSaved: 15,
    inputLabel: "Paste your meeting notes or transcript",
    inputPlaceholder: "Paste raw notes, bullet points, or a transcript. TaskPilot will structure them.",
    system:
      "You are TaskPilot's Meeting Intelligence engine. Given raw meeting notes, output clean Markdown with these exact H3 sections in order: '### Summary' (2-3 sentence recap), '### Decisions' (bulleted), '### Action items' (each formatted as '- [ ] Owner — Task (Due: date-or-TBD)'), '### Open questions' (bulleted). Do not invent owners; use 'Unassigned' if not stated.",
  },
  planner: {
    id: "planner",
    name: "AI Task Planner",
    tagline: "Start every day with a plan.",
    icon: ListChecks,
    minutesSaved: 8,
    inputLabel: "What do you need to get done?",
    inputPlaceholder: "e.g. Priorities: finalize Q3 deck, review 3 PRs, prep for 1:1 with Sam. 6 hours available. Meeting from 13:00-14:00.",
    system:
      "You are TaskPilot's AI Task Planner. Turn the user's priorities and constraints into a realistic time-blocked plan in Markdown. Start with '### Today's plan', then a table with columns: Time | Focus | Priority (High/Med/Low). End with '### Notes' — 1-2 lines of practical advice (breaks, buffers, or what to skip if time runs short). Be honest about capacity.",
  },
  research: {
    id: "research",
    name: "Research Assistant",
    tagline: "Executive summaries, not walls of text.",
    icon: Search,
    minutesSaved: 20,
    inputLabel: "Topic or question",
    inputPlaceholder: "e.g. Summarize the shift toward workflow-embedded AI tools in the productivity SaaS market for an executive audience.",
    system:
      "You are TaskPilot's Research Assistant. Produce an executive summary in Markdown with these H3 sections: '### Executive summary' (3-5 sentences), '### Key insights' (exactly 3, each 1-2 sentences), '### Recommendations' (exactly 2, action-oriented). Be candid about uncertainty. Do not fabricate specific statistics or citations.",
  },
  assistant: {
    id: "assistant",
    name: "AI Assistant",
    tagline: "One thread. All your context.",
    icon: Sparkles,
    minutesSaved: 3,
    inputLabel: "Ask anything",
    inputPlaceholder: "Ask TaskPilot for help.",
    system:
      "You are TaskPilot, a calm, competent workplace assistant. You help professionals draft email, summarize meetings, plan work, and research topics. Keep answers concise, verbs first, no filler. When the user asks for a full draft, deliver it in Markdown. Never mention that you are an AI. When you don't know, say so.",
  },
};

export const TONES = ["warm and confident", "concise and direct", "friendly", "formal", "apologetic"] as const;
export type Tone = (typeof TONES)[number];