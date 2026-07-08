import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export const listConversations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("conversations")
      .select("id, title, updated_at")
      .eq("user_id", context.userId)
      .order("updated_at", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const createConversation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) =>
    z.object({ title: z.string().min(1).max(120).default("New conversation") }).parse(v ?? {}),
  )
  .handler(async ({ data, context }) => {
    const { data: ws } = await context.supabase
      .from("workspaces").select("id").eq("owner_id", context.userId).limit(1).maybeSingle();
    if (!ws) throw new Error("Workspace missing");
    const { data: row, error } = await context.supabase
      .from("conversations")
      .insert({ user_id: context.userId, workspace_id: ws.id, title: data.title })
      .select("id, title, updated_at").single();
    if (error) throw new Error(error.message);
    return row;
  });

export const getConversation = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) => z.object({ id: z.string().uuid() }).parse(v))
  .handler(async ({ data, context }) => {
    const [{ data: conv }, { data: msgs }] = await Promise.all([
      context.supabase.from("conversations").select("*").eq("id", data.id).eq("user_id", context.userId).single(),
      context.supabase.from("messages").select("id, role, parts, created_at")
        .eq("conversation_id", data.id).eq("user_id", context.userId)
        .order("created_at", { ascending: true }),
    ]);
    return { conversation: conv, messages: msgs ?? [] };
  });

export const renameConversation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) =>
    z.object({ id: z.string().uuid(), title: z.string().min(1).max(120) }).parse(v),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("conversations").update({ title: data.title })
      .eq("id", data.id).eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteConversation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) => z.object({ id: z.string().uuid() }).parse(v))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("conversations").delete()
      .eq("id", data.id).eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });