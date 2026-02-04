import { useState } from "react"
import { format } from "date-fns"
import { it } from "date-fns/locale"
import { Header } from "@/components/layout/Header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useAccessLogs, type AccessLogFilters } from "@/hooks/useAccessLogs"

const PAGE_SIZE = 20

export default function AccessLogs() {
  const [filters, setFilters] = useState<AccessLogFilters>({
    page: 0,
    pageSize: PAGE_SIZE,
  })

  const { data, isLoading, isError, error } = useAccessLogs(filters)
  const totalPages = data ? Math.ceil(data.count / PAGE_SIZE) : 0

  return (
    <>
      <Header title="Log Accessi" />
      <div className="flex-1 p-6 space-y-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-1">
            <Label>Azione</Label>
            <Select
              value={filters.azione ?? "tutti"}
              onValueChange={(v) =>
                setFilters((f) => ({
                  ...f,
                  azione: v === "tutti" ? undefined : (v as AccessLogFilters["azione"]),
                  page: 0,
                }))
              }
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tutti">Tutte</SelectItem>
                <SelectItem value="checkin">Check-in</SelectItem>
                <SelectItem value="unlock">Unlock</SelectItem>
                <SelectItem value="checkout">Check-out</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Metodo</Label>
            <Select
              value={filters.metodo ?? "tutti"}
              onValueChange={(v) =>
                setFilters((f) => ({
                  ...f,
                  metodo: v === "tutti" ? undefined : (v as AccessLogFilters["metodo"]),
                  page: 0,
                }))
              }
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tutti">Tutti</SelectItem>
                <SelectItem value="badge">Badge</SelectItem>
                <SelectItem value="nfc">NFC</SelectItem>
                <SelectItem value="qr">QR</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Da</Label>
            <Input
              type="date"
              value={filters.dateFrom ?? ""}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  dateFrom: e.target.value || undefined,
                  page: 0,
                }))
              }
              className="w-40"
            />
          </div>
          <div className="space-y-1">
            <Label>A</Label>
            <Input
              type="date"
              value={filters.dateTo ?? ""}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  dateTo: e.target.value || undefined,
                  page: 0,
                }))
              }
              className="w-40"
            />
          </div>
        </div>

        <div className="rounded-md border">
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
              ) : data?.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    Nessun log trovato
                  </TableCell>
                </TableRow>
              ) : (
                data?.data.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-sm">
                      {format(new Date(log.timestamp), "dd/MM/yyyy HH:mm:ss", {
                        locale: it,
                      })}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {log.user_id?.slice(0, 8) ?? "-"}
                    </TableCell>
                    <TableCell>{log.locker_numero ?? "-"}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          log.azione === "checkin"
                            ? "default"
                            : log.azione === "unlock"
                              ? "secondary"
                              : "outline"
                        }
                      >
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
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Pagina {(filters.page ?? 0) + 1} di {totalPages} ({data?.count} risultati)
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={(filters.page ?? 0) === 0}
                onClick={() =>
                  setFilters((f) => ({ ...f, page: (f.page ?? 0) - 1 }))
                }
              >
                Precedente
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={(filters.page ?? 0) >= totalPages - 1}
                onClick={() =>
                  setFilters((f) => ({ ...f, page: (f.page ?? 0) + 1 }))
                }
              >
                Successiva
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
