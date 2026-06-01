import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, GitBranch, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { queueCounts } from "@/lib/sync/syncQueue";
import { syncService } from "@/lib/sync/syncService";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

interface SyncQueueIndicatorProps {
  userId?: string;
  onOpenConflicts?: () => void;
}

export function SyncQueueIndicator({ userId, onOpenConflicts }: SyncQueueIndicatorProps) {
  const online = useOnlineStatus();
  const queryClient = useQueryClient();
  const { data } = useQuery({
    queryKey: ["syncQueueCounts", userId],
    queryFn: queueCounts,
    refetchInterval: 3_000
  });

  useEffect(() => {
    const refresh = () => void queryClient.invalidateQueries({ queryKey: ["syncQueueCounts", userId] });
    window.addEventListener("catetin:sync-complete", refresh);
    window.addEventListener("catetin:sync-failed", refresh);
    return () => {
      window.removeEventListener("catetin:sync-complete", refresh);
      window.removeEventListener("catetin:sync-failed", refresh);
    };
  }, [queryClient, userId]);

  const pending = data?.pending ?? 0;
  const failed = data?.failed ?? 0;
  const conflicts = data?.conflicts ?? 0;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {pending > 0 ? (
        <Badge className="bg-primary/30">
          <GitBranch className="h-3.5 w-3.5" />
          {pending} antre
        </Badge>
      ) : null}
      {failed > 0 ? (
        <Badge className="bg-expense/20">
          <AlertTriangle className="h-3.5 w-3.5" />
          Sync failed
        </Badge>
      ) : null}
      {conflicts > 0 ? (
        <Button variant="pink" size="sm" onClick={onOpenConflicts} type="button">
          <AlertTriangle className="h-4 w-4" />
          {conflicts} conflict
        </Button>
      ) : null}
      <Button
        variant="outline"
        size="sm"
        onClick={() => userId && void syncService.syncNow(userId, "manual")}
        disabled={!online || !userId}
        type="button"
      >
        <RefreshCw className="h-4 w-4" />
        Sync
      </Button>
    </div>
  );
}
