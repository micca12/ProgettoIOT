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

// Hook per ottenere il profilo utente dalla tabella users
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
        console.error("Error fetching user profile:", error)
        return null
      }

      return data
    },
    enabled: !!user?.email,
  })
}

// Hook per ottenere l'armadietto assegnato all'utente
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

      if (error) {
        // PGRST116 = nessun risultato trovato (OK, utente non ha locker)
        if (error.code === "PGRST116") return null
        console.error("Error fetching assigned locker:", error)
        return null
      }

      return data
    },
    enabled: !!profile?.id,
  })
}

// Hook per eseguire check-in o check-out via badge_access
export function useBadgeAccess() {
  const queryClient = useQueryClient()
  const { data: profile } = useUserProfile()

  return useMutation({
    mutationFn: async (): Promise<BadgeAccessResult> => {
      if (!profile?.badge_uid) {
        throw new Error("Badge UID non configurato per questo utente")
      }

      // Chiama la funzione badge_access con il badge dell'utente
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase.rpc as any)("badge_access", {
        p_badge_uid: profile.badge_uid,
        p_metodo: "app",
      })

      if (error) {
        console.error("Error calling badge_access:", error)
        throw new Error(error.message)
      }

      return data as BadgeAccessResult
    },
    onSuccess: () => {
      // Invalidate queries per ricaricare i dati
      queryClient.invalidateQueries({ queryKey: ["assignedLocker"] })
      queryClient.invalidateQueries({ queryKey: ["accessLogs"] })
    },
  })
}

// Hook per ottenere gli ultimi accessi dell'utente
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
        console.error("Error fetching access logs:", error)
        return []
      }

      return (data ?? []) as AccessLog[]
    },
    enabled: !!profile?.id,
  })
}
