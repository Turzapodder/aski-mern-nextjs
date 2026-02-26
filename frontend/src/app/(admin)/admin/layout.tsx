// Server Component — no 'use client'
// All interactive logic (auth, nav, mobile sheet) lives in AdminShell.
import { AdminShell } from "@/components/layout/AdminShell"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>
}
