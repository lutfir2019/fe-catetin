import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, GitMerge, Laptop, Server } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { listConflicts } from "@/lib/db/indexedDb";
import { syncService } from "@/lib/sync/syncService";
import type { EntityName } from "@/types";

interface ConflictResolutionDialogProps {
  open: boolean;
  userId?: string;
  onOpenChange: (open: boolean) => void;
}

export function ConflictResolutionDialog({ open, userId, onOpenChange }: ConflictResolutionDialogProps) {
  const queryClient = useQueryClient();
  const [index, setIndex] = useState(0);
  const { data = [] } = useQuery({
    queryKey: ["conflicts", userId],
    enabled: open && Boolean(userId),
    queryFn: () => (userId ? listConflicts(userId) : Promise.resolve([]))
  });

  useEffect(() => {
    if (open) setIndex(0);
  }, [open]);

  const current = data[index];
  const title = useMemo(() => {
    if (!current) return "Tidak ada konflik";
    const record = current.record as { title?: string; name?: string };
    return record.title || record.name || current.entity;
  }, [current]);

  async function resolve(strategy: "local" | "server") {
    if (!current) return;
    await syncService.resolveConflict(current.entity as EntityName, current.record.id, strategy);
    await queryClient.invalidateQueries({ queryKey: ["conflicts", userId] });
    await queryClient.invalidateQueries({ queryKey: [current.entity, userId] });
    toast.success(strategy === "local" ? "Versi lokal dipakai dan masuk antrean sync." : "Versi server dipakai.");
    if (index >= data.length - 1) {
      onOpenChange(false);
    } else {
      setIndex((value) => value + 1);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg border-2 border-foreground bg-pink">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <DialogTitle>Conflict detected</DialogTitle>
          <DialogDescription>Ada perubahan yang perlu kamu cek sebelum disinkronkan.</DialogDescription>
        </DialogHeader>

        {current ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-primary/30">{current.entity}</Badge>
              <Badge>
                {index + 1} / {data.length}
              </Badge>
            </div>
            <div>
              <h3 className="font-heading text-xl font-bold">{title}</h3>
              <p className="text-sm text-muted-foreground">
                Pilih versi yang ingin dipertahankan. Gabung manual bisa dilakukan dengan edit data setelah memilih versi
                server atau lokal.
              </p>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <pre className="max-h-64 overflow-auto rounded-lg border-2 border-foreground bg-white p-3 text-xs">
                {JSON.stringify(current.record, null, 2)}
              </pre>
              <pre className="max-h-64 overflow-auto rounded-lg border-2 border-foreground bg-white p-3 text-xs">
                {JSON.stringify(current.record.server_snapshot ?? {}, null, 2)}
              </pre>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border-2 border-dashed border-foreground/40 bg-white p-5 text-sm text-muted-foreground">
            Tidak ada konflik yang perlu diselesaikan.
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} type="button">
            Tutup
          </Button>
          {current ? (
            <>
              <Button variant="secondary" onClick={() => void resolve("server")} type="button">
                <Server className="h-4 w-4" />
                Gunakan server
              </Button>
              <Button variant="success" onClick={() => void resolve("local")} type="button">
                <Laptop className="h-4 w-4" />
                Gunakan lokal
              </Button>
              <Button variant="pink" onClick={() => void resolve("server")} type="button">
                <GitMerge className="h-4 w-4" />
                Gabung manual
              </Button>
            </>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
