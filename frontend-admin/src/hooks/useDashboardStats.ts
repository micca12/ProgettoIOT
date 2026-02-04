import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabaseClient"

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: async () => {
      const [lockersRes, todayLogsRes] = await Promise.all([
        supabase.from("lockers").select("stato"),
        supabase
          .from("access_logs")
          .select("id", { count: "exact" })
          .gte("timestamp", new Date().toISOString().split("T")[0]),
      ])

      if (lockersRes.error) throw lockersRes.error
      if (todayLogsRes.error) throw todayLogsRes.error

      const lockers = lockersRes.data
      const stats = {
        personeEdificio: 0,
        armadiettiLiberi: 0,
        armadiettiTotali: lockers.length,
        armadiettiManutenzione: 0,
        accessiOggi: todayLogsRes.count ?? 0,
      }

      for (const l of lockers) {
        if (l.stato === "occupato") stats.personeEdificio++
        if (l.stato === "libero") stats.armadiettiLiberi++
        if (l.stato === "manutenzione") stats.armadiettiManutenzione++
      }

      return stats
    },
    refetchInterval: 30000,
  })
}
