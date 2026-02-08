import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabaseClient"

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: async () => {
      const [lockersRes, todayLogsRes] = await Promise.all([
        supabase.from("lockers").select("stato").eq("stato", "occupato"),
        supabase
          .from("access_logs")
          .select("id", { count: "exact" })
          .gte("timestamp", new Date().toISOString().split("T")[0]),
      ])

      if (lockersRes.error) throw lockersRes.error
      if (todayLogsRes.error) throw todayLogsRes.error

      return {
        personeEdificio: lockersRes.data.length,
        accessiOggi: todayLogsRes.count ?? 0,
      }
    },
    refetchInterval: 30000,
  })
}
