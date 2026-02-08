import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { useCreateUser, useUpdateUser } from "@/hooks/useUsers"
import type { Database } from "@/types/database.types"

type UserRow = Database["public"]["Tables"]["users"]["Row"]

const emptyForm = {
  email: "",
  nome: "",
  cognome: "",
  telefono: "",
  badge_uid: "",
  tipo: "studente" as UserRow["tipo"],
}

interface UserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user?: UserRow | null
}

export function UserDialog({ open, onOpenChange, user }: UserDialogProps) {
  const createUser = useCreateUser()
  const updateUser = useUpdateUser()
  const isEditing = !!user

  const [form, setForm] = useState(emptyForm)

  useEffect(() => {
    if (user) {
      setForm({
        email: user.email,
        nome: user.nome,
        cognome: user.cognome,
        telefono: user.telefono ?? "",
        badge_uid: user.badge_uid ?? "",
        tipo: user.tipo,
      })
    } else {
      setForm(emptyForm)
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      ...form,
      telefono: form.telefono || null,
      badge_uid: form.badge_uid || null,
    }

    if (isEditing) {
      await updateUser.mutateAsync({ id: user.id, ...payload })
    } else {
      await createUser.mutateAsync(payload)
    }
    onOpenChange(false)
  }

  const isPending = createUser.isPending || updateUser.isPending

  const set = (field: keyof typeof emptyForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Modifica utente" : "Nuovo utente"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome</Label>
              <Input id="nome" value={form.nome} onChange={set("nome")} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cognome">Cognome</Label>
              <Input id="cognome" value={form.cognome} onChange={set("cognome")} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={form.email} onChange={set("email")} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="telefono">Telefono</Label>
            <Input id="telefono" value={form.telefono} onChange={set("telefono")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="badge_uid">Badge UID</Label>
            <Input id="badge_uid" value={form.badge_uid} onChange={set("badge_uid")} />
          </div>
          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select
              value={form.tipo}
              onValueChange={(v) => setForm((f) => ({ ...f, tipo: v as "studente" | "admin" }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="studente">Studente</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annulla
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvataggio..." : isEditing ? "Salva" : "Crea"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
