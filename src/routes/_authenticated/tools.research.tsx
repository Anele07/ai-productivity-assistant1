import { createFileRoute } from "@tanstack/react-router";
import { ToolPage } from "@/components/tool-page";
export const Route = createFileRoute("/_authenticated/tools/research")({
  head: () => ({ meta: [{ title: "Research — TaskPilot" }] }),
  component: () => <ToolPage tool="research" />,
});