import React from "react"
import { AdminAccountsClient } from "./AdminAccountsClient"

export const metadata = {
  title: "Admin Accounts | Aski",
  description: "Manage admin access and permissions",
}

export default function AdminAccountsPage() {
  return <AdminAccountsClient />
}
