import { Header } from "@/components/layout/Header"
import { LockerTable } from "@/components/lockers/LockerTable"

export default function Lockers() {
  return (
    <>
      <Header title="Gestione Armadietti" />
      <div className="flex-1 p-6">
        <LockerTable />
      </div>
    </>
  )
}
