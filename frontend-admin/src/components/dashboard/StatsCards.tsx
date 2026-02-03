import { Users, Lock, Wrench, ClipboardList } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useDashboardStats } from "@/hooks/useDashboardStats"

export function StatsCards() {
  const { data: stats, isLoading, isError, error } = useDashboardStats()

  const cards = [
    {
      title: "Persone nell'edificio",
      value: stats?.personeEdificio ?? 0,
      icon: Users,
      description: "Armadietti occupati",
    },
    {
      title: "Armadietti liberi",
      value: stats ? `${stats.armadiettiLiberi} / ${stats.armadiettiTotali}` : "0 / 0",
      icon: Lock,
      description: "Disponibili / Totali",
    },
    {
      title: "In manutenzione",
      value: stats?.armadiettiManutenzione ?? 0,
      icon: Wrench,
      description: "Armadietti non disponibili",
    },
    {
      title: "Accessi oggi",
      value: stats?.accessiOggi ?? 0,
      icon: ClipboardList,
      description: "Registrati oggi",
    },
  ]

  if (isError) {
    return (
      <div className="rounded-md border border-destructive bg-destructive/10 p-4 text-sm text-destructive">
        Errore nel caricamento statistiche: {error?.message ?? "Errore sconosciuto"}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-8 w-16 animate-pulse rounded bg-muted" />
            ) : (
              <>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="text-xs text-muted-foreground">{card.description}</p>
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
