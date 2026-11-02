import { useMutation, useQuery } from "@tanstack/react-query";
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
  return useMutation({
    mutationFn: ({ name, key, date }: CreateConcertParams) =>
      createConcert(name, key, date),
  });
}

export function useUpdateConcert() {
  return useMutation({
    mutationFn: ({ concertId, name, date }: UpdateConcertParams) =>
      updateConcert(concertId, name, date),
  });
}

export function useDeleteConcert() {
  return useMutation({
    mutationFn: ({ concertId }: DeleteConcertParams) =>
      deleteConcert(concertId),
  });
}
