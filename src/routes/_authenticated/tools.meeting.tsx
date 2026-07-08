import { createFileRoute } from "@tanstack/react-router";
import { ToolPage } from "@/components/tool-page";
export const Route = createFileRoute("/_authenticated/tools/meeting")({
  head: () => ({ meta: [{ title: "Meeting Intelligence — TaskPilot" }] }),
  component: () => <ToolPage tool="meeting" />,
});