import { TableRow, TableCell } from "@/components/ui/table"

interface Props {
  colSpan: number
  isLoading: boolean
  isError: boolean
  error?: { message?: string } | null
  isEmpty: boolean
  emptyMessage?: string
  children: React.ReactNode
}

// componente per gestire gli stati loading/errore/vuoto nelle tabelle
export function TableStatus({
  colSpan,
  isLoading,
  isError,
  error,
  isEmpty,
  emptyMessage = "Nessun risultato",
  children,
}: Props) {
  if (isLoading) {
    return (
      <TableRow>
        <TableCell colSpan={colSpan} className="text-center">
          Caricamento...
        </TableCell>
      </TableRow>
    )
  }

  if (isError) {
    return (
      <TableRow>
        <TableCell colSpan={colSpan} className="text-center text-destructive">
          Errore: {error?.message ?? "Errore sconosciuto"}
        </TableCell>
      </TableRow>
    )
  }

  if (isEmpty) {
    return (
      <TableRow>
        <TableCell colSpan={colSpan} className="text-center text-muted-foreground">
          {emptyMessage}
        </TableCell>
      </TableRow>
    )
  }

  return <>{children}</>
}
