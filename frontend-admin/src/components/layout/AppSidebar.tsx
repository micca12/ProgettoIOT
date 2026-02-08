import { useLocation, useNavigate } from "react-router-dom"
import {
  LayoutDashboard,
  Users,
  Lock,
  LogOut,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useAuthContext } from "@/components/auth/AuthProvider"

// voci del menu
const navItems = [
  { title: "Dashboard", icon: LayoutDashboard, path: "/" },
  { title: "Utenti", icon: Users, path: "/users" },
  { title: "Armadietti", icon: Lock, path: "/lockers" },
]

export function AppSidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, signOut } = useAuthContext()

  const handleLogout = async () => {
    await signOut()
    navigate("/login")
  }

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-4 py-3">
        <h2 className="text-lg font-semibold">Smart Locker</h2>
        <p className="text-xs text-muted-foreground">Pannello Admin</p>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigazione</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    isActive={location.pathname === item.path}
                    onClick={() => navigate(item.path)}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t p-3">
        <div className="mb-2 truncate px-2 text-xs text-muted-foreground">
          {user?.email}
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout}>
              <LogOut />
              <span>Esci</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
