import { createFileRoute } from "@tanstack/react-router";
import { ToolPage } from "@/components/tool-page";
export const Route = createFileRoute("/_authenticated/tools/planner")({
  head: () => ({ meta: [{ title: "Task Planner — TaskPilot" }] }),
  component: () => <ToolPage tool="planner" />,
});