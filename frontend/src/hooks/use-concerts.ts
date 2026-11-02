import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createConcert,
  deleteConcert,
  fetchConcerts,
  updateConcert,
} from "@/services/concerts-service";

type CreateConcertParams = {
  name: string;
  key: string;
  date: string;
};

type UpdateConcertParams = {
  concertId: string;
  name?: string;
  date?: string;
};

type DeleteConcertParams = {
  concertId: string;
};

export function useConcerts() {
  return useQuery({
    queryKey: ["concerts"],
    queryFn: () => fetchConcerts(),
  });
}

export function useCreateConcert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ name, key, date }: CreateConcertParams) =>
      createConcert(name, key, date),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["concerts"] });
    },
  });
}

export function useUpdateConcert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ concertId, name, date }: UpdateConcertParams) =>
      updateConcert(concertId, name, date),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["concerts"] });
    },
  });
}

export function useDeleteConcert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ concertId }: DeleteConcertParams) =>
      deleteConcert(concertId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["concerts"] });
    },
  });
}
