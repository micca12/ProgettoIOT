import { BrowserRouter, Routes, Route } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "@/components/ui/sonner"
import { AuthProvider } from "@/components/auth/AuthProvider"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { AppLayout } from "@/components/layout/AppLayout"
import Login from "@/pages/Login"
import Dashboard from "@/pages/Dashboard"
import Users from "@/pages/Users"
import Lockers from "@/pages/Lockers"
import AccessLogs from "@/pages/AccessLogs"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30,
      retry: 1,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/users" element={<Users />} />
                <Route path="/lockers" element={<Lockers />} />
                <Route path="/access-logs" element={<AccessLogs />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
