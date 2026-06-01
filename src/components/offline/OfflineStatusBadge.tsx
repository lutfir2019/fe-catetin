import { AlertTriangle, CheckCircle2, CloudOff, RefreshCw, Wifi } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useSyncStatus } from "@/hooks/useSyncStatus";

export function OfflineStatusBadge() {
  const online = useOnlineStatus();
  const syncState = useSyncStatus();

  if (!online) {
    return (
      <Badge className="bg-expense/20">
        <CloudOff className="h-3.5 w-3.5" />
        Offline
      </Badge>
    );
  }

  if (syncState === "syncing") {
    return (
      <Badge className="bg-secondary/35">
        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
        Syncing
      </Badge>
    );
  }

  if (syncState === "failed") {
    return (
      <Badge className="bg-expense/20">
        <AlertTriangle className="h-3.5 w-3.5" />
        Sync failed
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
