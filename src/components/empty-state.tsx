import type { LucideIcon } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: { label: string; to: string };
}) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card/40 px-6 py-14 text-center">
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-secondary text-muted-foreground">
        <Icon className="h-5 w-5" />
      </div>
      <div className="font-display text-2xl">{title}</div>
      <div className="text-sm text-muted-foreground">{description}</div>
      {action && (
        <Link to={action.to} className="mt-3 inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background">
          {action.label}
        </Link>
      )}
    </div>
  );
}