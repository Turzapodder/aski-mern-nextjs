"use client"

import React from "react";
import UploadProjectForm from "@/components/UploadProjectForm";
import { Skeleton } from "@/components/ui/skeleton";
import { useRequestProposalLogic } from "./useRequestProposalLogic"

export const RequestProposalClient = () => {
  const {
    router,
    tutorId,
    isTutorViewer,
    tutor,
    loading
  } = useRequestProposalLogic();

  if (!tutorId) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <p className="text-sm text-gray-500">Tutor not found.</p>
      </div>
    );
  }

  if (isTutorViewer) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <p className="text-sm text-gray-500">Only students can request proposals.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <Skeleton className="h-10 w-1/2 mb-4" />
        <Skeleton className="h-56 w-full" />
      </div>
    );
  }

  if (!tutor) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <p className="text-sm text-gray-500">Tutor not found.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <UploadProjectForm
        requestedTutorId={tutorId}
        requestedTutorName={tutor.name}
        onCreated={(assignmentId) => router.push(`/user/assignments/view-details/${assignmentId}`)}
      />
    </div>
  );
}
