import { createFileRoute } from "@tanstack/react-router";
import { ToolPage } from "@/components/tool-page";
export const Route = createFileRoute("/_authenticated/tools/email")({
  head: () => ({ meta: [{ title: "Smart Email — TaskPilot" }] }),
  component: () => <ToolPage tool="email" />,
});