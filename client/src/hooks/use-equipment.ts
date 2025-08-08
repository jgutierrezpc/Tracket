import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Racket } from "@shared/schema";

export function useRackets() {
  const { data: rackets = [], isLoading } = useQuery<Racket[]>({
    queryKey: ["/api/equipment/rackets"],
  });

  const createRacket = useMutation({
    mutationFn: async (input: { brand: string; model: string }) => {
      const res = await apiRequest("POST", "/api/equipment/rackets", input);
      return (await res.json()) as Racket;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/equipment/rackets"] });
    },
  });

  const updateRacket = useMutation({
    mutationFn: async ({ id, update }: { id: string; update: Partial<Racket> }) => {
      const res = await apiRequest("PATCH", `/api/equipment/rackets/${id}`, update);
      return (await res.json()) as Racket;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/equipment/rackets"] });
    },
  });

  return { rackets, isLoading, createRacket, updateRacket };
}


