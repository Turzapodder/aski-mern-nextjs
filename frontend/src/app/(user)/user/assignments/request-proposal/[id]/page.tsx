"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import UploadProjectForm from "@/components/UploadProjectForm";
import { useGetUserQuery } from "@/lib/services/auth";
import { Skeleton } from "@/components/ui/skeleton";

interface PublicTutor {
  _id: string;
  name: string;
}

export default function RequestProposalPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const tutorId = params?.id;

  const { data: viewerData } = useGetUserQuery();
  const viewer = viewerData?.user;
  const isTutorViewer = viewer?.roles?.includes("tutor");
  const [tutor, setTutor] = useState<PublicTutor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTutor = async () => {
      if (!tutorId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const response = await fetch(`${baseUrl}/api/tutors/profile/${encodeURIComponent(tutorId)}`);
        if (!response.ok) {
          throw new Error("Tutor not found");
        }
        const result = await response.json();
        if (!result?.success) {
          throw new Error(result?.error || "Tutor not found");
        }
        setTutor(result?.data?.tutor || null);
      } catch (error) {
        setTutor(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTutor();
  }, [tutorId]);

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
