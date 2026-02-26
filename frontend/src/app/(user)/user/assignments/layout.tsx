import type { Metadata } from "next"

export const metadata: Metadata = { title: "Assignments" }

export default function AssignmentsLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>
}
