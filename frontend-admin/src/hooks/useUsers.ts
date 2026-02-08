import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabaseClient"
import type { Database } from "@/types/database.types"

type UserRow = Database["public"]["Tables"]["users"]["Row"]
type UserInsert = Database["public"]["Tables"]["users"]["Insert"]
type UserUpdate = Database["public"]["Tables"]["users"]["Update"]

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: async (): Promise<UserRow[]> => {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .order("cognome", { ascending: true })
      if (error) {
        console.log("errore users", error)
        throw error
      }
      return data
    },
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (user: UserInsert) => {
      console.log("creo utente", user.email)
      const { data, error } = await supabase
        .from("users")
        .insert(user)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: UserUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("users")
        .update(updates)
        .eq("id", id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  })
}
