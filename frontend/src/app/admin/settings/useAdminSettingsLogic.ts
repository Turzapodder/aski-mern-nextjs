import { useEffect, useState } from "react"
import useSWR from "swr"
import { toast } from "sonner"

import { adminApi, PlatformSettings } from "@/lib/adminApi"

export type SettingsForm = Omit<PlatformSettings, "platformFeeRate" | "minTransactionFee"> & {
  platformFeeRate?: string | number
  minTransactionFee?: string | number
}

export const useAdminSettingsLogic = () => {
  const { data, error, isLoading, mutate } = useSWR("admin-settings", () =>
    adminApi.settings.get()
  )

  const [form, setForm] = useState<SettingsForm>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (data?.data) {
      setForm(data.data)
    }
  }, [data])

  const handleChange = (key: keyof PlatformSettings, value: any) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleAnnouncementChange = (key: string, value: any) => {
    setForm((prev) => ({
      ...prev,
      announcement: {
        ...prev.announcement,
        [key]: value,
      },
    }))
  }

  const handleMaintenanceChange = (key: string, value: any) => {
    setForm((prev) => ({
      ...prev,
      maintenance: {
        ...prev.maintenance,
        [key]: value,
      },
    }))
  }

  const handleRegistrationChange = (key: string, value: any) => {
    setForm((prev) => ({
      ...prev,
      registration: {
        ...prev.registration,
        [key]: value,
      },
    }))
  }

  const handleSave = async () => {
    setIsSubmitting(true)
    try {
      const parsedFee =
        form.platformFeeRate === "" || form.platformFeeRate === undefined
          ? undefined
          : Number(form.platformFeeRate)
      const parsedMinFee =
        form.minTransactionFee === "" || form.minTransactionFee === undefined
          ? undefined
          : Number(form.minTransactionFee)

      const payload: PlatformSettings = {
        ...form,
        platformFeeRate: parsedFee,
        minTransactionFee: parsedMinFee,
      }

      await adminApi.settings.update(payload)
      toast.success("Settings updated")
      mutate()
    } catch (submitError: any) {
      toast.error(submitError?.message || "Unable to update settings")
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    form,
    isSubmitting,
    handleChange,
    handleAnnouncementChange,
    handleMaintenanceChange,
    handleRegistrationChange,
    handleSave,
    isLoading,
    error
  }
}
