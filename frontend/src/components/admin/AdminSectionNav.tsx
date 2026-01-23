"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

type SectionNavItem = {
  label: string
  href: string
}

type AdminSectionNavProps = {
  items: SectionNavItem[]
}

const AdminSectionNav = ({ items }: AdminSectionNavProps) => {
  const pathname = usePathname()

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary-100 text-primary-700"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            {item.label}
          </Link>
        )
      })}
    </div>
  )
}

export default AdminSectionNav
