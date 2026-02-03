import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
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

const userSchema = z.object({
  email: z.string().email("Email non valida"),
  nome: z.string().min(1, "Nome obbligatorio"),
  cognome: z.string().min(1, "Cognome obbligatorio"),
  telefono: z.string().optional(),
  badge_uid: z.string().optional(),
  tipo: z.enum(["studente", "admin"]),
})

type UserFormValues = z.infer<typeof userSchema>

interface UserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user?: UserRow | null
}

export function UserDialog({ open, onOpenChange, user }: UserDialogProps) {
  const createUser = useCreateUser()
  const updateUser = useUpdateUser()
  const isEditing = !!user

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      email: "",
      nome: "",
      cognome: "",
      telefono: "",
      badge_uid: "",
      tipo: "studente",
    },
  })

  useEffect(() => {
    if (user) {
      reset({
        email: user.email,
        nome: user.nome,
        cognome: user.cognome,
        telefono: user.telefono ?? "",
        badge_uid: user.badge_uid ?? "",
        tipo: user.tipo,
      })
    } else {
      reset({
        email: "",
        nome: "",
        cognome: "",
        telefono: "",
        badge_uid: "",
        tipo: "studente",
      })
    }
  }, [user, reset])

  const onSubmit = async (values: UserFormValues) => {
    const payload = {
      ...values,
      telefono: values.telefono || null,
      badge_uid: values.badge_uid || null,
    }

    if (isEditing) {
      await updateUser.mutateAsync({ id: user.id, ...payload })
    } else {
      await createUser.mutateAsync(payload)
    }
    onOpenChange(false)
  }

  const isPending = createUser.isPending || updateUser.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Modifica utente" : "Nuovo utente"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome</Label>
              <Input id="nome" {...register("nome")} />
              {errors.nome && (
                <p className="text-xs text-destructive">{errors.nome.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="cognome">Cognome</Label>
              <Input id="cognome" {...register("cognome")} />
              {errors.cognome && (
                <p className="text-xs text-destructive">{errors.cognome.message}</p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="telefono">Telefono</Label>
            <Input id="telefono" {...register("telefono")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="badge_uid">Badge UID</Label>
            <Input id="badge_uid" {...register("badge_uid")} />
          </div>
          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select
              value={watch("tipo")}
              onValueChange={(v) => setValue("tipo", v as "studente" | "admin")}
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
