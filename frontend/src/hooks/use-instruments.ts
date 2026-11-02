import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createInstrument,
  deleteInstrument,
  fetchInstruments,
  updateInstrument,
} from "@/services/instruments-service";

type CreateInstrumentParams = {
  name: string;
  key: string;
};

type UpdateInstrumentParams = {
  instrumentId: string;
  name?: string;
  key?: string;
};

type DeleteInstrumentParams = {
  instrumentId: string;
};

export function useInstruments() {
  return useQuery({
    queryKey: ["instruments"],
    queryFn: () => fetchInstruments(),
  });
}

export function useCreateInstrument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ name, key }: CreateInstrumentParams) =>
      createInstrument(name, key),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instruments"] });
    },
  });
}

export function useUpdateInstrument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ instrumentId, name, key }: UpdateInstrumentParams) =>
      updateInstrument(instrumentId, name, key),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instruments"] });
    },
  });
}

export function useDeleteInstrument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ instrumentId }: DeleteInstrumentParams) =>
      deleteInstrument(instrumentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instruments"] });
    },
  });
}
