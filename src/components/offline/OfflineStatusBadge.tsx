import { CheckCircle2, CloudOff, RefreshCw, Wifi } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { syncService } from "@/lib/sync/syncService";

export function OfflineStatusBadge() {
  const online = useOnlineStatus();
  const syncing = syncService.isSyncing();

  if (!online) {
    return (
      <Badge className="bg-expense/20">
        <CloudOff className="h-3.5 w-3.5" />
        Offline
      </Badge>
    );
  }

  if (syncing) {
    return (
      <Badge className="bg-secondary/35">
        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
        Syncing
      </Badge>
    );
  }

  return (
    <Badge className="bg-success/25">
      <Wifi className="h-3.5 w-3.5" />
      Online
      <CheckCircle2 className="h-3.5 w-3.5" />
    </Badge>
  );
}
