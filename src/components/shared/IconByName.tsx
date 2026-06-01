import * as Icons from "lucide-react";
import { WalletCards } from "lucide-react";
import type { ComponentType } from "react";
import { cn } from "@/lib/utils";

interface IconByNameProps {
  name?: string | null;
  className?: string;
}

export function IconByName({ name, className }: IconByNameProps) {
  const iconMap = Icons as unknown as Record<string, ComponentType<{ className?: string }>>;
  const LucideIcon = (name && iconMap[name]) || WalletCards;
  return <LucideIcon className={cn("h-4 w-4", className)} />;
}
