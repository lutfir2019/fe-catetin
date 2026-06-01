import type { ReactNode } from "react";
import { DoodleIllustration } from "@/components/shared/DoodleIllustration";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="rounded-lg border-2 border-dashed border-foreground/50 bg-white p-5 text-center">
      <DoodleIllustration variant="empty" className="mx-auto mb-4 max-w-md" />
      <h3 className="font-heading text-2xl font-bold">{title}</h3>
      <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">{description}</p>
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}
