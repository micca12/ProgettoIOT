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
import { useCreateLocker, useUpdateLocker } from "@/hooks/useLockers"
import type { Database } from "@/types/database.types"

type LockerRow = Database["public"]["Tables"]["lockers"]["Row"]

const lockerSchema = z.object({
  numero: z.string().min(1, "Numero obbligatorio"),
  qr_code: z.string().min(1, "QR Code obbligatorio"),
  nfc_tag_uid: z.string().optional(),
  posizione: z.string().optional(),
  note: z.string().optional(),
  stato: z.enum(["libero", "occupato", "manutenzione", "fuori_servizio"]),
})

type LockerFormValues = z.infer<typeof lockerSchema>

interface LockerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  locker?: LockerRow | null
}

export function LockerDialog({ open, onOpenChange, locker }: LockerDialogProps) {
  const createLocker = useCreateLocker()
  const updateLocker = useUpdateLocker()
  const isEditing = !!locker

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LockerFormValues>({
    resolver: zodResolver(lockerSchema),
    defaultValues: {
      numero: "",
      qr_code: "",
      nfc_tag_uid: "",
      posizione: "",
      note: "",
      stato: "libero",
    },
  })

  useEffect(() => {
    if (locker) {
      reset({
        numero: locker.numero,
        qr_code: locker.qr_code,
        nfc_tag_uid: locker.nfc_tag_uid ?? "",
        posizione: locker.posizione ?? "",
        note: locker.note ?? "",
        stato: locker.stato,
      })
    } else {
      reset({
        numero: "",
        qr_code: "",
        nfc_tag_uid: "",
        posizione: "",
        note: "",
        stato: "libero",
      })
    }
  }, [locker, reset])

  const onSubmit = async (values: LockerFormValues) => {
    const payload = {
      ...values,
      nfc_tag_uid: values.nfc_tag_uid || null,
      posizione: values.posizione || null,
      note: values.note || null,
    }

    if (isEditing) {
      await updateLocker.mutateAsync({ id: locker.id, ...payload })
    } else {
      await createLocker.mutateAsync(payload)
    }
    onOpenChange(false)
  }

  const isPending = createLocker.isPending || updateLocker.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Modifica armadietto" : "Nuovo armadietto"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="numero">Numero</Label>
              <Input id="numero" {...register("numero")} />
              {errors.numero && (
                <p className="text-xs text-destructive">{errors.numero.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="qr_code">QR Code</Label>
              <Input id="qr_code" {...register("qr_code")} />
              {errors.qr_code && (
                <p className="text-xs text-destructive">{errors.qr_code.message}</p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="nfc_tag_uid">NFC Tag UID</Label>
            <Input id="nfc_tag_uid" {...register("nfc_tag_uid")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="posizione">Posizione</Label>
            <Input id="posizione" {...register("posizione")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="note">Note</Label>
            <Input id="note" {...register("note")} />
          </div>
          {isEditing && (
            <div className="space-y-2">
              <Label>Stato</Label>
              <Select
                value={watch("stato")}
                onValueChange={(v) =>
                  setValue("stato", v as LockerFormValues["stato"])
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="libero">Libero</SelectItem>
                  <SelectItem value="occupato">Occupato</SelectItem>
                  <SelectItem value="manutenzione">Manutenzione</SelectItem>
                  <SelectItem value="fuori_servizio">Fuori servizio</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
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
