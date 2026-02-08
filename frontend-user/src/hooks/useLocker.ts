import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabaseClient"
import { useAuthContext } from "@/components/auth/AuthProvider"

interface UserProfile {
  id: string
  email: string
  nome: string
  cognome: string
  telefono: string | null
  badge_uid: string | null
  tipo: "studente" | "admin"
  attivo: boolean
}

interface AssignedLocker {
  id: number
  numero: string
  stato: string
  timestamp_assegnazione: string
}

interface BadgeAccessResult {
  success: boolean
  azione?: "checkin" | "checkout"
  utente?: string
  locker_assegnato?: string
  locker_rilasciato?: string
  messaggio?: string
  error?: string
}

interface AccessLog {
  id: number
  azione: string
  metodo: string
  locker_numero: string | null
  success: boolean
  error_message: string | null
  created_at: string
}

export function useUserProfile() {
  const { user } = useAuthContext()

  return useQuery({
    queryKey: ["userProfile", user?.id],
    queryFn: async (): Promise<UserProfile | null> => {
      if (!user?.email) return null

      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", user.email)
        .eq("attivo", true)
        .single()

      if (error) {
        console.log("profilo non trovato", error.message)
        return null
      }

      return data
    },
    enabled: !!user?.email,
  })
}

// locker assegnato all'utente (se ce l'ha)
export function useAssignedLocker() {
  const { data: profile } = useUserProfile()

  return useQuery({
    queryKey: ["assignedLocker", profile?.id],
    queryFn: async (): Promise<AssignedLocker | null> => {
      if (!profile?.id) return null

      const { data, error } = await supabase
        .from("lockers")
        .select("id, numero, stato, timestamp_assegnazione")
        .eq("user_id", profile.id)
        .eq("stato", "occupato")
        .single()

      // PGRST116 = nessun risultato, vuol dire che non ha locker
      if (error) {
        if (error.code === "PGRST116") return null
        console.log("err locker", error)
        return null
      }

      return data
    },
    enabled: !!profile?.id,
  })
}

export function useBadgeAccess() {
  const queryClient = useQueryClient()
  const { data: profile } = useUserProfile()

  return useMutation({
    mutationFn: async (): Promise<BadgeAccessResult> => {
      if (!profile?.badge_uid) {
        throw new Error("Badge UID non configurato per questo utente")
      }

      console.log("chiamo badge_access con", profile.badge_uid)

      // rpc va castato perche i tipi non matchano
      const { data, error } = await (supabase.rpc as any)("badge_access", {
        p_badge_uid: profile.badge_uid,
        p_metodo: "app",
      })

      if (error) {
        console.log("badge_access fallito", error)
        throw new Error(error.message)
      }

      return data as BadgeAccessResult
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignedLocker"] })
      queryClient.invalidateQueries({ queryKey: ["accessLogs"] })
    },
  })
}

// ultimi log dell utente
export function useAccessLogs(limit = 5) {
  const { data: profile } = useUserProfile()

  return useQuery({
    queryKey: ["accessLogs", profile?.id, limit],
    queryFn: async (): Promise<AccessLog[]> => {
      if (!profile?.id) return []

      const { data, error } = await supabase
        .from("access_logs")
        .select("id, azione, metodo, locker_numero, success, error_message, created_at")
        .eq("user_id", profile.id)
        .order("created_at", { ascending: false })
        .limit(limit)

      if (error) {
        console.log("err log", error)
        return []
      }

      return (data ?? []) as AccessLog[]
    },
    enabled: !!profile?.id,
  })
}
