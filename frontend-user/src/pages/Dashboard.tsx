import { useNavigate } from "react-router-dom"
import { useAuthContext } from "@/components/auth/AuthProvider"
import { useUserProfile, useAssignedLocker, useBadgeAccess, useAccessLogs } from "@/hooks/useLocker"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LogOut, LogIn, DoorOpen, Loader2, CheckCircle, XCircle } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"
import { it } from "date-fns/locale"

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, signOut } = useAuthContext()

  const { data: profile, isLoading: profileLoading } = useUserProfile()
  const { data: assignedLocker, isLoading: lockerLoading } = useAssignedLocker()
  const { data: accessLogs, isLoading: logsLoading } = useAccessLogs(5)
  const badgeAccess = useBadgeAccess()

  const handleLogout = async () => {
    try {
      await signOut()
      toast.success("Logout riuscito")
      navigate("/login")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Errore di logout"
      toast.error(message)
    }
  }

  const handleBadgeAccess = async () => {
    console.log("badge access click")
    try {
      const result = await badgeAccess.mutateAsync()

      if (result.success) {
        if (result.azione === "checkin") {
          toast.success(`Check-in riuscito! Armadietto ${result.locker_assegnato} assegnato`)
        } else if (result.azione === "checkout") {
          toast.success(`Check-out riuscito! Armadietto ${result.locker_rilasciato} liberato`)
        }
      } else {
        toast.error(result.error || "Operazione fallita")
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Errore durante l'operazione"
      toast.error(message)
    }
  }

  const isLoading = profileLoading || lockerLoading

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Smart Locker</h1>
            <p className="text-muted-foreground">
              {profile ? `Benvenuto, ${profile.nome} ${profile.cognome}` : `Benvenuto, ${user?.email}`}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="mr-2 size-4" />
            Logout
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {assignedLocker ? "Il tuo Armadietto" : "Nessun Armadietto"}
            </CardTitle>
            <CardDescription>
              {assignedLocker
                ? `Armadietto ${assignedLocker.numero} assegnato`
                : "Effettua il check-in per ottenere un armadietto"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="size-8 animate-spin text-muted-foreground" />
              </div>
            ) : assignedLocker ? (
              <>
                <div className="rounded-lg border-2 border-green-500 bg-green-50 p-6 text-center">
                  <DoorOpen className="mx-auto mb-2 size-12 text-green-600" />
                  <p className="text-3xl font-bold text-green-700">
                    {assignedLocker.numero}
                  </p>
                  <p className="text-sm text-green-600">
                    Assegnato il {format(new Date(assignedLocker.timestamp_assegnazione), "dd MMM yyyy HH:mm", { locale: it })}
                  </p>
                </div>

                <Button
                  className="w-full"
                  variant="destructive"
                  onClick={handleBadgeAccess}
                  disabled={badgeAccess.isPending || !profile?.badge_uid}
                >
                  {badgeAccess.isPending ? (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  ) : (
                    <LogOut className="mr-2 size-4" />
                  )}
                  Check-out - Rilascia Armadietto
                </Button>
              </>
            ) : (
              <>
                <div className="rounded-lg border border-dashed border-muted p-8 text-center">
                  <DoorOpen className="mx-auto mb-2 size-12 text-muted-foreground" />
                  <p className="text-muted-foreground">Nessun armadietto assegnato</p>
                  <p className="text-sm text-muted-foreground">Effettua il check-in per ottenerne uno</p>
                </div>

                <Button
                  className="w-full"
                  onClick={handleBadgeAccess}
                  disabled={badgeAccess.isPending || !profile?.badge_uid}
                >
                  {badgeAccess.isPending ? (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  ) : (
                    <LogIn className="mr-2 size-4" />
                  )}
                  Check-in - Ottieni Armadietto
                </Button>
              </>
            )}

            {!profile?.badge_uid && (
              <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                <p className="text-sm text-yellow-700">
                  ⚠️ <strong>Attenzione:</strong> Non hai un badge UID configurato. Contatta l'amministratore per associare il tuo badge.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* todo: scan nfc dal telefono */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Il tuo Profilo</CardTitle>
            </CardHeader>
            <CardContent>
              {profile ? (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nome:</span>
                    <span className="font-medium">{profile.nome} {profile.cognome}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tipo:</span>
                    <span className="font-medium capitalize">{profile.tipo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Badge:</span>
                    <span className="font-mono text-xs">{profile.badge_uid || "Non configurato"}</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Caricamento...</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ultime Azioni</CardTitle>
            </CardHeader>
            <CardContent>
              {logsLoading ? (
                <p className="text-sm text-muted-foreground">Caricamento...</p>
              ) : accessLogs && accessLogs.length > 0 ? (
                <div className="space-y-2">
                  {accessLogs.slice(0, 3).map((log) => (
                    <div key={log.id} className="flex items-center gap-2 text-sm">
                      {log.success ? (
                        <CheckCircle className="size-4 text-green-500" />
                      ) : (
                        <XCircle className="size-4 text-red-500" />
                      )}
                      <span className="capitalize">{log.azione}</span>
                      {log.locker_numero && (
                        <span className="text-muted-foreground">#{log.locker_numero}</span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Nessuna azione registrata</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
