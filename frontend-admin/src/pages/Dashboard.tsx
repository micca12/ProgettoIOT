import { format } from "date-fns"
import { it } from "date-fns/locale"
import { Header } from "@/components/layout/Header"
import { StatsCards } from "@/components/dashboard/StatsCards"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useRecentAccessLogs } from "@/hooks/useAccessLogs"

const azioneBadgeVariant = {
  checkin: "default" as const,
  unlock: "secondary" as const,
  checkout: "outline" as const,
}

export default function Dashboard() {
  const { data: recentLogs, isLoading, isError, error } = useRecentAccessLogs(10)

  return (
    <>
      <Header title="Dashboard" />
      <div className="flex-1 space-y-6 p-6">
        <StatsCards />

        <Card>
          <CardHeader>
            <CardTitle>Ultimi accessi</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Utente</TableHead>
                  <TableHead>Armadietto</TableHead>
                  <TableHead>Azione</TableHead>
                  <TableHead>Metodo</TableHead>
                  <TableHead>Esito</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      Caricamento...
                    </TableCell>
                  </TableRow>
                ) : isError ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-destructive">
                      Errore: {error?.message ?? "Impossibile caricare i log"}
                    </TableCell>
                  </TableRow>
                ) : recentLogs?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      Nessun accesso registrato
                    </TableCell>
                  </TableRow>
                ) : (
                  recentLogs?.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-sm">
                        {format(new Date(log.timestamp), "dd/MM/yyyy HH:mm", { locale: it })}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {log.user_id?.slice(0, 8) ?? "-"}
                      </TableCell>
                      <TableCell>{log.locker_numero ?? "-"}</TableCell>
                      <TableCell>
                        <Badge variant={azioneBadgeVariant[log.azione]}>
                          {log.azione}
                        </Badge>
                      </TableCell>
                      <TableCell>{log.metodo}</TableCell>
                      <TableCell>
                        <Badge variant={log.success ? "default" : "destructive"}>
                          {log.success ? "OK" : "Errore"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
