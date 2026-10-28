import type { QueryClient } from "@tanstack/react-query";

export async function refetchSongQueries(
  queryClient: QueryClient,
  songId: string,
  versionId: string | null,
) {
  await Promise.all([
    queryClient.refetchQueries({
      queryKey: ["songs", "byId", songId],
      exact: true,
    }),
    queryClient.invalidateQueries({
      queryKey: ["songs", "list"],
    }),
    queryClient.refetchQueries({
      queryKey: ["part-instruments", songId, versionId],
      exact: true,
    }),
  ]);
}