import { motion } from "framer-motion";
import { ArrowUpRight, BarChart3, Cloud, Coins, PiggyBank, Sparkles, WalletCards } from "lucide-react";
import { cn } from "@/lib/utils";

interface DoodleIllustrationProps {
  variant?: "hero" | "empty" | "offline" | "security";
  className?: string;
}

export function DoodleIllustration({ variant = "hero", className }: DoodleIllustrationProps) {
  const accent = variant === "security" ? "bg-purple" : variant === "offline" ? "bg-secondary" : "bg-primary";

  return (
    <div className={cn("relative min-h-52 overflow-hidden rounded-lg border-2 border-foreground bg-white p-5", className)}>
      <div className="absolute inset-0 doodle-pattern opacity-80" />
      <motion.div
        className="relative mx-auto flex h-44 max-w-sm items-center justify-center"
        initial={{ y: 8, rotate: -1 }}
        animate={{ y: [8, 0, 8], rotate: [-1, 1, -1] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className={cn("absolute h-28 w-48 rotate-[-5deg] rounded-lg border-2 border-foreground", accent)} />
        <div className="absolute left-10 top-5 rounded-lg border-2 border-foreground bg-pink p-3 shadow-doodle">
          <WalletCards className="h-8 w-8" />
        </div>
        <div className="absolute right-8 top-2 rounded-full border-2 border-foreground bg-success p-3 shadow-doodle">
          <PiggyBank className="h-9 w-9" />
        </div>
        <div className="absolute bottom-4 left-16 rounded-lg border-2 border-foreground bg-secondary p-3 shadow-doodle">
          <BarChart3 className="h-8 w-8" />
        </div>
        <div className="absolute bottom-6 right-12 rounded-full border-2 border-foreground bg-primary p-3 shadow-doodle">
          <Coins className="h-8 w-8" />
        </div>
        <Sparkles className="absolute left-2 top-6 h-7 w-7 text-[#F28482]" />
        <Cloud className="absolute bottom-3 right-1 h-8 w-8 text-[#8ECAE6]" />
        <ArrowUpRight className="absolute right-28 top-16 h-8 w-8 text-[#90BE6D]" />
      </motion.div>
    </div>
  );
}
