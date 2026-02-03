import { Navigate, Outlet } from "react-router-dom"
import { useAuthContext } from "./AuthProvider"

export function ProtectedRoute() {
  const { user, loading } = useAuthContext()

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-muted-foreground">Caricamento...</div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
