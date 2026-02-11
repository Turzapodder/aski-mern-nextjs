"use client"

import { useMemo, useState } from "react"
import { useParams } from "next/navigation"
import useSWR from "swr"
import { FileText } from "lucide-react"
import { toast } from "sonner"

import { adminApi } from "@/lib/adminApi"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import ResolveDisputeModal from "@/components/admin/ResolveDisputeModal"

type DisputeDetails = {
  assignment?: Record<string, any>
  chatHistory?: Record<string, any>[]
  files?: {
    attachments?: Record<string, any>[]
    submissions?: Record<string, any>[]
  }
  escrowAmount?: number
  financiallyActionable?: boolean
  hasGatewayRefundData?: boolean
}

const formatDate = (value?: string) => {
  if (!value) return "N/A"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "N/A"
  return date.toLocaleString()
}

export default function AdminDisputeDetailsPage() {
  const params = useParams<{ id: string }>()
  const disputeId = params?.id
  const [resolutionType, setResolutionType] = useState<"refund" | "release" | "split">("refund")
  const [studentPercent, setStudentPercent] = useState(50)
  const [modalOpen, setModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data, error, isLoading, mutate } = useSWR(
    disputeId ? ["admin-dispute", disputeId] : null,
    () => adminApi.disputes.getById(disputeId)
  )

  const { data: settingsResponse } = useSWR("admin-settings-preview", () => adminApi.settings.get())

  const payload = data?.data as DisputeDetails | undefined
  const assignment = payload?.assignment
  const chatHistory = payload?.chatHistory ?? []
  const attachments = payload?.files?.attachments ?? []
  const submissions = payload?.files?.submissions ?? []
  const escrowAmount = payload?.escrowAmount || 0
  const financiallyActionable = Boolean(payload?.financiallyActionable)
  const hasGatewayRefundData = Boolean(payload?.hasGatewayRefundData)
  const platformFeeRate = settingsResponse?.data?.platformFeeRate || 0
  const minFee = settingsResponse?.data?.minTransactionFee || 0
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.REACT_APP_API_URL ||
    "http://localhost:8000"
  const resolveFileUrl = (url?: string) => {
    if (!url) return ""
    if (url.startsWith("http")) return url
    return `${apiBaseUrl}${url}`
  }

  const summary = useMemo(() => {
    let studentAmount = 0
    let tutorAmount = 0
    let platformFee = 0

    if (resolutionType === "refund") {
      studentAmount = escrowAmount
    } else if (resolutionType === "release") {
      platformFee = platformFeeRate > 0 ? Math.max(escrowAmount * platformFeeRate, minFee) : 0
      tutorAmount = Math.max(0, escrowAmount - platformFee)
    } else {
      const percent = Math.min(100, Math.max(0, studentPercent))
      studentAmount = Number((escrowAmount * (percent / 100)).toFixed(2))
      const tutorShare = Math.max(0, escrowAmount - studentAmount)
      platformFee = platformFeeRate > 0 ? Math.max(tutorShare * platformFeeRate, minFee) : 0
      tutorAmount = Math.max(0, tutorShare - platformFee)
    }

    return {
      resolutionType,
      escrowAmount,
      studentAmount,
      tutorAmount,
      platformFee,
    }
  }, [escrowAmount, minFee, platformFeeRate, resolutionType, studentPercent])

  const handleResolve = async (note?: string) => {
    if (!assignment?._id) return
    setIsSubmitting(true)
    try {
      const response = await adminApi.disputes.resolve(assignment._id, {
        resolutionType,
        studentPercent: resolutionType === "split" ? studentPercent : undefined,
        reason: note,
      })
      if ((response?.data as any)?.noFinancialTransfer) {
        toast.success("Dispute resolved (no payout/refund because payment is not completed)")
      } else {
        toast.success("Dispute resolved")
      }
      setModalOpen(false)
      mutate()
    } catch (submitError: any) {
      toast.error(submitError?.message || "Unable to resolve dispute")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
    )
  }

  if (error || !assignment) {
    return (
      <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
        Unable to load dispute details.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dispute courtroom</h1>
        <p className="text-sm text-gray-500">Review evidence, chat history, and resolve the dispute.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border border-gray-200/70 bg-white/90 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Case information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="text-xs text-gray-500">Assignment</p>
              <p className="text-sm font-medium text-gray-900">{assignment.title}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Escrow amount</p>
              <p className="text-sm font-medium text-gray-900">{escrowAmount}</p>
              {!financiallyActionable && (
                <p className="mt-1 text-xs text-amber-700">
                  Payment is not completed for this dispute. Resolution will close the case only.
                </p>
              )}
            </div>
            <div>
              <p className="text-xs text-gray-500">Student</p>
              <p className="text-sm font-medium text-gray-900">{assignment.student?.name || "N/A"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Tutor</p>
              <p className="text-sm font-medium text-gray-900">{assignment.assignedTutor?.name || "N/A"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Last updated</p>
              <p className="text-sm font-medium text-gray-900">{formatDate(assignment.updatedAt)}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200/70 bg-white/90 shadow-sm lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Evidence viewer</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="chat" className="space-y-4">
              <TabsList className="w-full">
                <TabsTrigger value="chat" className="flex-1">Chat</TabsTrigger>
                <TabsTrigger value="submissions" className="flex-1">Submissions</TabsTrigger>
                <TabsTrigger value="requirements" className="flex-1">Requirements</TabsTrigger>
              </TabsList>

              <TabsContent value="chat">
                {chatHistory.length === 0 && <p className="text-sm text-gray-500">No messages recorded.</p>}
                {chatHistory.length > 0 && (
                  <ScrollArea className="h-56 rounded-lg border border-gray-200 p-3">
                    <div className="space-y-3 text-sm">
                      {chatHistory.map((message: Record<string, any>) => (
                        <div key={message._id} className="rounded-lg border border-gray-100 p-2">
                          <p className="text-xs text-gray-500">
                            {message.sender?.name || "User"} | {formatDate(message.createdAt)}
                          </p>
                          <p className="text-gray-700">{message.content || "Attachment"}</p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </TabsContent>

              <TabsContent value="submissions">
                {submissions.length === 0 && <p className="text-sm text-gray-500">No submission files.</p>}
                {submissions.length > 0 && (
                  <div className="space-y-2">
                    {submissions.map((file: Record<string, any>) => (
                      <a
                        key={file.url}
                        href={resolveFileUrl(file.url)}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 text-sm text-primary"
                      >
                        <FileText className="h-4 w-4" />
                        {file.originalName || file.filename}
                      </a>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="requirements">
                <p className="text-sm text-gray-600">{assignment.description}</p>
                {attachments.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {attachments.map((file: Record<string, any>) => (
                      <a
                        key={file.url}
                        href={resolveFileUrl(file.url)}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 text-sm text-primary"
                      >
                        <FileText className="h-4 w-4" />
                        {file.originalName || file.filename}
                      </a>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card className="border border-gray-200/70 bg-white/90 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Resolution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!financiallyActionable && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                Unpaid dispute: this action resolves the case without payout/refund transfer.
              </div>
            )}
            {financiallyActionable && !hasGatewayRefundData && (
              <div className="rounded-lg border border-sky-200 bg-sky-50 p-3 text-xs text-sky-800">
                No gateway refund metadata found. Wallet transfer will still be processed internally.
              </div>
            )}
            <div className="space-y-2 text-sm text-gray-700">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={resolutionType === "refund"}
                  onChange={() => setResolutionType("refund")}
                />
                Full refund to student
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={resolutionType === "release"}
                  onChange={() => setResolutionType("release")}
                />
                Release payment to tutor
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={resolutionType === "split"}
                  onChange={() => setResolutionType("split")}
                />
                Split decision
              </label>
            </div>

            {resolutionType === "split" && (
              <div className="space-y-2">
                <p className="text-xs text-gray-500">Student share: {studentPercent}%</p>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={studentPercent}
                  onChange={(event) => setStudentPercent(Number(event.target.value))}
                  className="w-full"
                />
              </div>
            )}

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700 space-y-1">
              <p>Student amount: {summary.studentAmount}</p>
              <p>Tutor amount: {summary.tutorAmount}</p>
              <p>Platform fee: {summary.platformFee}</p>
            </div>

            <Button onClick={() => setModalOpen(true)} disabled={isSubmitting} className="w-full">
              Resolve dispute
            </Button>
          </CardContent>
        </Card>
      </div>

      <ResolveDisputeModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        summary={summary}
        isSubmitting={isSubmitting}
        onConfirm={handleResolve}
      />
    </div>
  )
}
