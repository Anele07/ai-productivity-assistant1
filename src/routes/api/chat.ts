import { createFileRoute } from "@tanstack/react-router";
import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { createClient } from "@supabase/supabase-js";
import {
  createLovableAiGatewayProvider,
  DEFAULT_MODEL,
  requireApiKey,
} from "@/lib/ai-gateway.server";
import { TOOLS } from "@/lib/tool-config";

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const authHeader = request.headers.get("authorization");
        if (!authHeader?.startsWith("Bearer ")) {
          return new Response("Unauthorized", { status: 401 });
        }
        const token = authHeader.slice(7);

        const SUPABASE_URL = process.env.SUPABASE_URL!;
        const SUPABASE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY!;
        const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
          global: { headers: { Authorization: `Bearer ${token}` } },
          auth: { persistSession: false, autoRefreshToken: false },
        });

        const { data: userData, error: authErr } = await supabase.auth.getUser(token);
        if (authErr || !userData?.user) {
          return new Response("Unauthorized", { status: 401 });
        }
        const userId = userData.user.id;

        const body = (await request.json()) as {
          messages: UIMessage[];
          conversationId?: string;
        };

        // Context bundle: recent generations + open tasks + display name
        const [{ data: profile }, { data: recentGens }, { data: openTasks }] =
          await Promise.all([
            supabase.from("profiles").select("display_name, timezone").eq("id", userId).maybeSingle(),
            supabase.from("generations")
              .select("tool, title, created_at").eq("user_id", userId)
              .order("created_at", { ascending: false }).limit(5),
            supabase.from("tasks").select("title, priority, due_at")
              .eq("user_id", userId).eq("done", false).limit(5),
          ]);

        const contextBlock = [
          `User: ${profile?.display_name ?? "the user"} (${profile?.timezone ?? "UTC"}).`,
          recentGens?.length
            ? `Recent work:\n${recentGens.map((g) => `- ${g.tool}: ${g.title}`).join("\n")}`
            : "No prior generations yet.",
          openTasks?.length
            ? `Open tasks:\n${openTasks.map((t) => `- ${t.title} (${t.priority})`).join("\n")}`
            : "",
        ]
          .filter(Boolean)
          .join("\n\n");

        const system = `${TOOLS.assistant.system}\n\n---\nContext about this user (do not repeat verbatim; use naturally):\n${contextBlock}`;

        const provider = createLovableAiGatewayProvider(requireApiKey());
        const result = streamText({
          model: provider(DEFAULT_MODEL),
          system,
          messages: convertToModelMessages(body.messages),
          onError: (e) => console.error("[chat stream]", e),
        });

        return result.toUIMessageStreamResponse({
          originalMessages: body.messages,
          onFinish: async ({ messages }) => {
            try {
              const conversationId = body.conversationId;
              if (!conversationId) return;
              // Persist the last two messages (last user + assistant)
              const toPersist = messages.slice(-2);
              for (const m of toPersist) {
                await supabase.from("messages").insert({
                  conversation_id: conversationId,
                  user_id: userId,
                  role: m.role,
                  parts: m.parts as unknown as object,
                });
              }
              await supabase
                .from("conversations")
                .update({ updated_at: new Date().toISOString() })
                .eq("id", conversationId);
            } catch (e) {
              console.error("[chat persist]", e);
            }
          },
        });
      },
    },
  },
});