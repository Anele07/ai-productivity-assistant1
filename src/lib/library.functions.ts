import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const listTemplates = createServerFn({ method: "GET" })
  .handler(async () => {
    return [] as Array<{
      id: string;
      name: string;
      category: string;
      tool: string;
      body: string;
      variables: unknown;
      is_system: boolean;
      favorited: boolean;
      created_at: string;
    }>;
  });

export const saveTemplate = createServerFn({ method: "POST" })
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
  .handler(async ({ data }) => ({
    id: crypto.randomUUID(),
    ...data,
    is_system: false,
    favorited: false,
    created_at: new Date().toISOString(),
  }));

export const toggleTemplateFavorite = createServerFn({ method: "POST" })
  .inputValidator((v: unknown) =>
    z.object({ id: z.string().uuid(), favorited: z.boolean() }).parse(v),
  )
  .handler(async ({ data }) => ({ id: data.id, favorited: data.favorited }));