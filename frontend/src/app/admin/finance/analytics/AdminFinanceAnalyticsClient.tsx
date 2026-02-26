"use client"

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import AdminSectionNav from "@/components/admin/AdminSectionNav"
import { useAdminFinanceAnalyticsLogic } from "./useAdminFinanceAnalyticsLogic"

export const AdminFinanceAnalyticsClient = () => {
  const {
    monthlyRevenue,
    typeBreakdown,
    escrowTrend,
    topTutors,
    isLoading,
    error
  } = useAdminFinanceAnalyticsLogic();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Revenue analytics</h1>
        <p className="text-sm text-gray-500">Track trends and revenue performance over time.</p>
        <div className="mt-3">
          <AdminSectionNav
            items={[
              { label: "Transactions", href: "/admin/finance" },
              { label: "Withdrawals", href: "/admin/finance/withdrawals" },
              { label: "Analytics", href: "/admin/finance/analytics" },
            ]}
          />
        </div>
      </div>

      {isLoading && (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-72 w-full" />
          ))}
        </div>
      )}

      {!isLoading && error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          Unable to load analytics.
        </div>
      )}

      {!isLoading && !error && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border border-gray-200/70 bg-white/90 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Monthly revenue trend</CardTitle>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyRevenue}>
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="amount" stroke="#2563eb" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border border-gray-200/70 bg-white/90 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Revenue breakdown</CardTitle>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={typeBreakdown} dataKey="amount" nameKey="type" outerRadius={80} fill="#7c5cff" />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border border-gray-200/70 bg-white/90 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Escrow vs available</CardTitle>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={escrowTrend}>
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="escrow" stackId="1" stroke="#f97316" fill="#fdba74" />
                  <Area type="monotone" dataKey="available" stackId="1" stroke="#16a34a" fill="#86efac" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border border-gray-200/70 bg-white/90 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Top earning tutors</CardTitle>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topTutors}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="amount" fill="#7c5cff" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
