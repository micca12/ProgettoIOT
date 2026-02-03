import { useState } from "react"
import { MoreHorizontal, Pencil } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { useLockers } from "@/hooks/useLockers"
import { LockerDialog } from "./LockerDialog"
import type { Database } from "@/types/database.types"

type LockerRow = Database["public"]["Tables"]["lockers"]["Row"]

const statoBadgeVariant: Record<LockerRow["stato"], "default" | "secondary" | "destructive" | "outline"> = {
  libero: "secondary",
  occupato: "default",
  manutenzione: "outline",
  fuori_servizio: "destructive",
}

const statoLabel: Record<LockerRow["stato"], string> = {
  libero: "Libero",
  occupato: "Occupato",
  manutenzione: "Manutenzione",
  fuori_servizio: "Fuori servizio",
}

export function LockerTable() {
  const [statoFilter, setStatoFilter] = useState<LockerRow["stato"] | "tutti">("tutti")
  const { data: lockers, isLoading, isError, error } = useLockers(
    statoFilter === "tutti" ? undefined : statoFilter
  )
  const [editLocker, setEditLocker] = useState<LockerRow | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <>
      <div className="flex items-center gap-4 mb-4">
        <Select
          value={statoFilter}
          onValueChange={(v) => setStatoFilter(v as LockerRow["stato"] | "tutti")}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtra per stato" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tutti">Tutti gli stati</SelectItem>
            <SelectItem value="libero">Libero</SelectItem>
            <SelectItem value="occupato">Occupato</SelectItem>
            <SelectItem value="manutenzione">Manutenzione</SelectItem>
            <SelectItem value="fuori_servizio">Fuori servizio</SelectItem>
          </SelectContent>
        </Select>
        <Button
          onClick={() => {
            setEditLocker(null)
            setDialogOpen(true)
          }}
        >
          Nuovo armadietto
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Numero</TableHead>
              <TableHead>Stato</TableHead>
              <TableHead>Utente assegnato</TableHead>
              <TableHead>Posizione</TableHead>
              <TableHead>QR Code</TableHead>
              <TableHead className="w-12" />
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
                  Errore: {error?.message ?? "Impossibile caricare gli armadietti"}
                </TableCell>
              </TableRow>
            ) : lockers?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  Nessun armadietto trovato
                </TableCell>
              </TableRow>
            ) : (
              lockers?.map((locker) => (
                <TableRow key={locker.id}>
                  <TableCell className="font-medium">{locker.numero}</TableCell>
                  <TableCell>
                    <Badge variant={statoBadgeVariant[locker.stato]}>
                      {statoLabel[locker.stato]}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {locker.user_id?.slice(0, 8) ?? "-"}
                  </TableCell>
                  <TableCell>{locker.posizione ?? "-"}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {locker.qr_code}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setEditLocker(locker)
                            setDialogOpen(true)
                          }}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Modifica
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <LockerDialog open={dialogOpen} onOpenChange={setDialogOpen} locker={editLocker} />
    </>
  )
}
