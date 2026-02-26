// Server Component — no 'use client'
// All interactive logic (auth, sidebar, mobile menu) lives in UserShell.
import { UserShell } from "@/components/layout/UserShell"

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return <UserShell>{children}</UserShell>
}
