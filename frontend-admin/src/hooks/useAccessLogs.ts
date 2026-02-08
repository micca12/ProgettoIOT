import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabaseClient"
import type { Database } from "@/types/database.types"

type AccessLogRow = Database["public"]["Tables"]["access_logs"]["Row"]

export interface AccessLogFilters {
  azione?: AccessLogRow["azione"]
  metodo?: AccessLogRow["metodo"]
  dateFrom?: string
  dateTo?: string
  page?: number
  pageSize?: number
}

export function useAccessLogs(filters: AccessLogFilters = {}) {
  const { azione, metodo, dateFrom, dateTo, page = 0, pageSize = 20 } = filters

  return useQuery({
    queryKey: ["access_logs", filters],
    queryFn: async () => {
      let query = supabase
        .from("access_logs")
        .select("*", { count: "exact" })
        .order("timestamp", { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1)

      // filtri opzionali
      if (azione) query = query.eq("azione", azione)
      if (metodo) query = query.eq("metodo", metodo)
      if (dateFrom) query = query.gte("timestamp", dateFrom)
      if (dateTo) query = query.lte("timestamp", dateTo)

      const { data, error, count } = await query
      if (error) throw error
      return { data: data as AccessLogRow[], count: count ?? 0 }
    },
  })
}