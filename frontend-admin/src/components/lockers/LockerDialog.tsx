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
import { useCreateLocker, useUpdateLocker } from "@/hooks/useLockers"
import type { Database } from "@/types/database.types"

type LockerRow = Database["public"]["Tables"]["lockers"]["Row"]

const emptyForm = {
  numero: "",
  qr_code: "",
  nfc_tag_uid: "",
  posizione: "",
  note: "",
  stato: "libero" as LockerRow["stato"],
}

interface LockerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  locker?: LockerRow | null
}

export function LockerDialog({ open, onOpenChange, locker }: LockerDialogProps) {
  const createLocker = useCreateLocker()
  const updateLocker = useUpdateLocker()
  const isEditing = !!locker

  const [form, setForm] = useState(emptyForm)

  useEffect(() => {
    if (locker) {
      setForm({
        numero: locker.numero,
        qr_code: locker.qr_code,
        nfc_tag_uid: locker.nfc_tag_uid ?? "",
        posizione: locker.posizione ?? "",
        note: locker.note ?? "",
        stato: locker.stato,
      })
    } else {
      setForm(emptyForm)
    }
  }, [locker])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // i campi vuoti li mando come null
    const payload = {
      ...form,
      nfc_tag_uid: form.nfc_tag_uid || null,
      posizione: form.posizione || null,
      note: form.note || null,
    }
    console.log("submit locker", payload)

    if (isEditing) {
      await updateLocker.mutateAsync({ id: locker.id, ...payload })
    } else {
      await createLocker.mutateAsync(payload)
    }
    onOpenChange(false)
  }

  const isPending = createLocker.isPending || updateLocker.isPending

  const set = (field: keyof typeof emptyForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Modifica armadietto" : "Nuovo armadietto"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="numero">Numero</Label>
              <Input id="numero" value={form.numero} onChange={set("numero")} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="qr_code">QR Code</Label>
              <Input id="qr_code" value={form.qr_code} onChange={set("qr_code")} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="nfc_tag_uid">NFC Tag UID</Label>
            <Input id="nfc_tag_uid" value={form.nfc_tag_uid} onChange={set("nfc_tag_uid")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="posizione">Posizione</Label>
            <Input id="posizione" value={form.posizione} onChange={set("posizione")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="note">Note</Label>
            <Input id="note" value={form.note} onChange={set("note")} />
          </div>
          {isEditing && (
            <div className="space-y-2">
              <Label>Stato</Label>
              <Select
                value={form.stato}
                onValueChange={(v) => setForm((f) => ({ ...f, stato: v as LockerRow["stato"] }))}
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
