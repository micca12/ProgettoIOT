import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabaseClient"
import type { Database } from "@/types/database.types"

type LockerRow = Database["public"]["Tables"]["lockers"]["Row"]
type LockerInsert = Database["public"]["Tables"]["lockers"]["Insert"]
type LockerUpdate = Database["public"]["Tables"]["lockers"]["Update"]

export function useLockers(statoFilter?: LockerRow["stato"]) {
  return useQuery({
    queryKey: ["lockers", statoFilter],
    queryFn: async (): Promise<LockerRow[]> => {
      let query = supabase
        .from("lockers")
        .select("*")
        .order("numero", { ascending: true })
      if (statoFilter) {
        query = query.eq("stato", statoFilter)
      }
      const { data, error } = await query
      if (error) throw error
      return data
    },
  })
}

export function useLockerStats() {
  return useQuery({
    queryKey: ["lockers", "stats"],
    queryFn: async () => {
      const { data, error } = await supabase.from("lockers").select("stato")
      if (error) throw error

      const stats = {
        totale: data.length,
        libero: 0,
        occupato: 0,
        manutenzione: 0,
        fuori_servizio: 0,
      }
      for (const locker of data) {
        stats[locker.stato]++
      }
      return stats
    },
  })
}

export function useCreateLocker() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (locker: LockerInsert) => {
      const { data, error } = await supabase
        .from("lockers")
        .insert(locker)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lockers"] })
    },
  })
}

export function useUpdateLocker() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: LockerUpdate & { id: number }) => {
      const { data, error } = await supabase
        .from("lockers")
        .update(updates)
        .eq("id", id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lockers"] })
    },
  })
}
