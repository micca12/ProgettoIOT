import { useState } from "react"
import { MoreHorizontal, Pencil, UserCheck, UserX } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TableStatus } from "@/components/ui/table-status"
import { useUsers, useUpdateUser } from "@/hooks/useUsers"
import { UserDialog } from "./UserDialog"
import type { Database } from "@/types/database.types"

type UserRow = Database["public"]["Tables"]["users"]["Row"]

export function UserTable() {
  const { data: users, isLoading, isError, error } = useUsers()
  const updateUser = useUpdateUser()
  const [search, setSearch] = useState("")
  const [editUser, setEditUser] = useState<UserRow | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  // filtro ricerca
  const utentiFiltrati = users?.filter((u) => {
    const q = search.toLowerCase()
    return (
      u.nome.toLowerCase().includes(q) ||
      u.cognome.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.badge_uid && u.badge_uid.toLowerCase().includes(q))
    )
  })

  const handleEdit = (user: UserRow) => {
    setEditUser(user)
    setDialogOpen(true)
  }

  const handleToggle = (user: UserRow) => {
    console.log("toggle", user.email, !user.attivo)
    updateUser.mutate({ id: user.id, attivo: !user.attivo })
  }

  return (
    <>
      <div className="flex items-center gap-4 mb-4">
        <Input
          placeholder="Cerca utenti..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Button
          onClick={() => {
            setEditUser(null)
            setDialogOpen(true)
          }}
        >
          Nuovo utente
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Cognome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Badge UID</TableHead>
              <TableHead>Stato</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableStatus
              colSpan={7}
              isLoading={isLoading}
              isError={isError}
              error={error}
              isEmpty={!utentiFiltrati?.length}
              emptyMessage="Nessun utente trovato"
            >
              {utentiFiltrati?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.nome}</TableCell>
                  <TableCell>{user.cognome}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.tipo === "admin" ? "default" : "secondary"}>
                      {user.tipo}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {user.badge_uid ?? "-"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.attivo ? "default" : "destructive"}>
                      {user.attivo ? "Attivo" : "Disattivato"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(user)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Modifica
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggle(user)}>
                          {user.attivo ? (
                            <>
                              <UserX className="mr-2 h-4 w-4" />
                              Disattiva
                            </>
                          ) : (
                            <>
                              <UserCheck className="mr-2 h-4 w-4" />
                              Attiva
                            </>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableStatus>
          </TableBody>
        </Table>
      </div>

      <UserDialog open={dialogOpen} onOpenChange={setDialogOpen} user={editUser} />
    </>
  )
}
