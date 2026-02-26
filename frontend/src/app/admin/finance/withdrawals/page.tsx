import React from "react"
import { AdminWithdrawalsClient } from "./AdminWithdrawalsClient"

export const metadata = {
  title: "Withdrawals | Admin | Aski",
  description: "Process pending tutor payout requests",
}

export default function AdminWithdrawalsPage() {
  return <AdminWithdrawalsClient />
}
