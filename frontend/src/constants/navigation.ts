import {
  AlertTriangle,
  BookOpen,
  DollarSign,
  FileText,
  Flag,
  GraduationCap,
  LayoutDashboard,
  Settings,
  Users,
} from "lucide-react";

export const ADMIN_NAV_ITEMS = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Tutors", href: "/admin/tutors", icon: GraduationCap },
  { label: "Assignments", href: "/admin/assignments", icon: FileText },
  { label: "Finance", href: "/admin/finance", icon: DollarSign },
  { label: "Disputes", href: "/admin/reports", icon: AlertTriangle },
  { label: "Reports", href: "/admin/content-reports", icon: Flag },
  { label: "Settings", href: "/admin/settings", icon: Settings },
] as const;
