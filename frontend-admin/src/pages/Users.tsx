import { Header } from "@/components/layout/Header"
import { UserTable } from "@/components/users/UserTable"

export default function Users() {
  return (
    <>
      <Header title="Gestione Utenti" />
      <div className="flex-1 p-6">
        <UserTable />
      </div>
    </>
  )
}
