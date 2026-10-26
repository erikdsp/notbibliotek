import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createSong } from "@/services/songs-service";

export function useCreateSong() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (title: string) => createSong(title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["songs", "list"] });
    },
  });
}