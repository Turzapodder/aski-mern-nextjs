import React from "react"
import { AdminUsersClient } from "./AdminUsersClient"

export const metadata = {
  title: "Users | Admin | Aski",
  description: "Manage student and tutor accounts across the platform",
}

export default function AdminUsersPage() {
  return <AdminUsersClient />
}
