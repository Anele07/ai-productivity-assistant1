import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export const listTemplates = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("prompt_templates")
      .select("*")
      .order("is_system", { ascending: false })
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const saveTemplate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) =>
    z
      .object({
        name: z.string().min(1).max(120),
        category: z.string().min(1).max(80),
        tool: z.enum(["email", "meeting", "planner", "research", "assistant"]),
        body: z.string().min(1).max(8000),
      })
      .parse(v),
  )
  .handler(async ({ data, context }) => {
    const { data: ws } = await context.supabase
      .from("workspaces").select("id").eq("owner_id", context.userId).limit(1).maybeSingle();
    const { data: row, error } = await context.supabase
      .from("prompt_templates")
      .insert({
        user_id: context.userId,
        workspace_id: ws?.id,
        name: data.name,
        category: data.category,
        tool: data.tool,
        body: data.body,
        is_system: false,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const toggleTemplateFavorite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) =>
    z.object({ id: z.string().uuid(), favorited: z.boolean() }).parse(v),
  )
  .handler(async ({ data, context }) => {
    // System templates: fav is stored per template row; since they're global,
    // for simplicity we clone the template on first favorite by a user.
    const { data: tpl } = await context.supabase
      .from("prompt_templates").select("*").eq("id", data.id).single();
    if (!tpl) throw new Error("Template not found");
    if (tpl.is_system) {
      const { data: ws } = await context.supabase
        .from("workspaces").select("id").eq("owner_id", context.userId).limit(1).maybeSingle();
      const { data: cloned, error } = await context.supabase
        .from("prompt_templates").insert({
          user_id: context.userId, workspace_id: ws?.id,
          name: tpl.name, category: tpl.category, tool: tpl.tool,
          body: tpl.body, variables: tpl.variables,
          is_system: false, favorited: data.favorited,
        }).select().single();
      if (error) throw new Error(error.message);
      return cloned;
    }
    const { data: row, error } = await context.supabase
      .from("prompt_templates").update({ favorited: data.favorited })
      .eq("id", data.id).eq("user_id", context.userId).select().single();
    if (error) throw new Error(error.message);
    return row;
  });