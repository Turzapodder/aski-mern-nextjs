"use client"

import { CheckCircle2, FileText, UserX } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import AdminSectionNav from "@/components/admin/AdminSectionNav"
import { TutorApplication, formatDate, useAdminTutorVerificationLogic } from "./useAdminTutorVerificationLogic"

export const AdminTutorVerificationClient = () => {
  const {
    applications,
    selected,
    reviewOpen, setReviewOpen,
    rejectReason, setRejectReason,
    isSubmitting,
    openReview,
    handleApprove,
    handleReject,
    isLoading,
    error
  } = useAdminTutorVerificationLogic();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Tutor Verification</h1>
        <p className="text-sm text-gray-500">Review pending applications and approve qualified tutors.</p>
        <div className="mt-3">
          <AdminSectionNav
            items={[
              { label: "Active tutors", href: "/admin/tutors" },
              { label: "Verification queue", href: "/admin/tutors/verification" },
            ]}
          />
        </div>
      </div>

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-44 w-full rounded-2xl" />
          ))}
        </div>
      )}

      {!isLoading && error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          Unable to load pending tutors.
        </div>
      )}

      {!isLoading && !error && applications.length === 0 && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
          No pending tutor applications.
        </div>
      )}

      {!isLoading && !error && applications.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {applications.map((application: TutorApplication) => (
            <Card key={application._id} className="border border-gray-200/70 bg-white/90 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-semibold">
                  {application.user?.name || application.personalInfo?.name || "Tutor"}
                </CardTitle>
                <p className="text-xs text-gray-500">Applied {formatDate(application.createdAt)}</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Quiz score</span>
                  <span className="font-semibold text-gray-900">
                    {application.quizResult?.percentage || 0}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Documents</span>
                  <span className="font-semibold text-gray-900">
                    {application.documents ? Object.values(application.documents).length : 0}
                  </span>
                </div>
                <Button
                  onClick={() => openReview(application)}
                  className="w-full"
                  variant="secondary"
                >
                  Review application
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Review tutor application</DialogTitle>
            <DialogDescription>
              Confirm profile details, quiz scores, and documentation before approving.
            </DialogDescription>
          </DialogHeader>

          {selected && (
            <Tabs defaultValue="profile" className="space-y-4">
              <TabsList>
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="quiz">Quiz</TabsTrigger>
                <TabsTrigger value="docs">Documents</TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="space-y-3">
                <Card>
                  <CardContent className="grid gap-4 p-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs text-gray-500">Name</p>
                      <p className="text-sm font-medium text-gray-900">
                        {selected.personalInfo?.name || selected.user?.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="text-sm font-medium text-gray-900">
                        {selected.personalInfo?.email || selected.user?.email}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">University</p>
                      <p className="text-sm font-medium text-gray-900">
                        {selected.personalInfo?.university || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Degree</p>
                      <p className="text-sm font-medium text-gray-900">
                        {selected.personalInfo?.degree || "N/A"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="quiz" className="space-y-3">
                <Card>
                  <CardContent className="grid gap-4 p-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs text-gray-500">Score</p>
                      <p className="text-sm font-medium text-gray-900">
                        {selected.quizResult?.percentage || 0}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Correct answers</p>
                      <p className="text-sm font-medium text-gray-900">
                        {selected.quizResult?.correctAnswers || 0} / {selected.quizResult?.totalQuestions || 0}
                      </p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-xs text-gray-500">Subject</p>
                      <p className="text-sm font-medium text-gray-900">
                        {selected.quizResult?.subject || "N/A"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="docs" className="space-y-3">
                <Card>
                  <CardContent className="space-y-3 p-4">
                    {selected.documents?.certificate && (
                      <a
                        href={selected.documents.certificate.url}
                        className="flex items-center gap-2 text-sm text-primary"
                        target="_blank"
                        rel="noreferrer"
                      >
                        <FileText className="h-4 w-4" />
                        Certificate
                      </a>
                    )}
                    {selected.documents?.profilePicture && (
                      <a
                        href={selected.documents.profilePicture.url}
                        className="flex items-center gap-2 text-sm text-primary"
                        target="_blank"
                        rel="noreferrer"
                      >
                        <FileText className="h-4 w-4" />
                        Profile photo
                      </a>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}

          <div className="space-y-3">
            <Textarea
              value={rejectReason}
              onChange={(event) => setRejectReason(event.target.value)}
              placeholder="Reason for rejection (required if rejecting)"
              rows={3}
            />
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button
                variant="outline"
                onClick={() => setReviewOpen(false)}
                disabled={isSubmitting}
              >
                Close
              </Button>
              <Button
                onClick={handleReject}
                className="bg-rose-600 hover:bg-rose-700"
                disabled={isSubmitting || rejectReason.trim().length === 0}
              >
                <UserX className="h-4 w-4" />
                Reject
              </Button>
              <Button onClick={handleApprove} disabled={isSubmitting}>
                <CheckCircle2 className="h-4 w-4" />
                Approve
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
