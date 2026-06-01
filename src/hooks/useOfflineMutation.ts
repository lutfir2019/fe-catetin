import { useMutation, useQueryClient, type QueryKey } from "@tanstack/react-query";
import { toast } from "sonner";

interface OfflineMutationOptions<TVariables, TResult> {
  mutationFn: (variables: TVariables) => Promise<TResult>;
  invalidate: QueryKey[];
  successMessage: string;
}

export function useOfflineMutation<TVariables, TResult>({
  mutationFn,
  invalidate,
  successMessage
}: OfflineMutationOptions<TVariables, TResult>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: async () => {
      await Promise.all(invalidate.map((key) => queryClient.invalidateQueries({ queryKey: key })));
      toast.success(successMessage);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Aksi belum berhasil. Coba lagi sebentar.");
    }
  });
}
