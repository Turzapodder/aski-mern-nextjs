"use client"

import Link from "next/link"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useAdminSettingsLogic } from "./useAdminSettingsLogic"

export const AdminSettingsClient = () => {
  const {
    form,
    isSubmitting,
    handleChange,
    handleAnnouncementChange,
    handleMaintenanceChange,
    handleRegistrationChange,
    handleSave,
    isLoading,
    error
  } = useAdminSettingsLogic();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500">Configure platform-wide operational settings.</p>
      </div>

      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-40 w-full" />
          ))}
        </div>
      )}

      {!isLoading && error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          Unable to load settings.
        </div>
      )}

      {!isLoading && !error && (
        <div className="space-y-6">
          <Card className="border border-gray-200/70 bg-white/90 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Commission settings</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs text-gray-500 mb-2">Platform fee rate (0-1)</p>
                <Input
                  type="number"
                  value={form.platformFeeRate ?? ""}
                  onChange={(event) => handleChange("platformFeeRate", event.target.value)}
                />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-2">Minimum transaction fee</p>
                <Input
                  type="number"
                  value={form.minTransactionFee ?? ""}
                  onChange={(event) => handleChange("minTransactionFee", event.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200/70 bg-white/90 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Global announcement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                value={form.announcement?.message || ""}
                onChange={(event) => handleAnnouncementChange("message", event.target.value)}
                placeholder="Write announcement text"
                rows={3}
              />
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  type="date"
                  value={form.announcement?.expiresAt ? String(form.announcement?.expiresAt).slice(0, 10) : ""}
                  onChange={(event) => handleAnnouncementChange("expiresAt", event.target.value)}
                />
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Switch
                    checked={Boolean(form.announcement?.isActive)}
                    onCheckedChange={(value) => handleAnnouncementChange("isActive", value)}
                  />
                  Publish announcement
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200/70 bg-white/90 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold">System maintenance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Switch
                  checked={Boolean(form.maintenance?.enabled)}
                  onCheckedChange={(value) => handleMaintenanceChange("enabled", value)}
                />
                Maintenance mode
              </div>
              <Input
                type="datetime-local"
                value={form.maintenance?.scheduledFor ? String(form.maintenance?.scheduledFor).slice(0, 16) : ""}
                onChange={(event) => handleMaintenanceChange("scheduledFor", event.target.value)}
              />
              <Textarea
                value={form.maintenance?.message || ""}
                onChange={(event) => handleMaintenanceChange("message", event.target.value)}
                placeholder="Maintenance message"
                rows={2}
              />
            </CardContent>
          </Card>

          <Card className="border border-gray-200/70 bg-white/90 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Registration control</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Switch
                  checked={Boolean(form.registration?.disabled)}
                  onCheckedChange={(value) => handleRegistrationChange("disabled", value)}
                />
                Disable new registrations
              </div>
              <Textarea
                value={form.registration?.reason || ""}
                onChange={(event) => handleRegistrationChange("reason", event.target.value)}
                placeholder="Reason shown to users"
                rows={2}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save settings"}
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border border-gray-200/70 bg-white/90 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Quiz management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-gray-600">
                <p>Update onboarding question banks and difficulty settings.</p>
                <Link className="text-primary font-medium" href="/admin/settings/quiz">
                  Open quiz manager
                </Link>
              </CardContent>
            </Card>
            <Card className="border border-gray-200/70 bg-white/90 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Admin accounts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-gray-600">
                <p>Grant or revoke admin access and set permission tiers.</p>
                <Link className="text-primary font-medium" href="/admin/settings/admins">
                  Manage admins
                </Link>
              </CardContent>
            </Card>
            <Card className="border border-gray-200/70 bg-white/90 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Test guide</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-gray-600">
                <p>Review QA steps and validation flows inside the admin UI.</p>
                <Link className="text-primary font-medium" href="/admin/test-guide">
                  Open test guide
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
