import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useGetUserQuery } from "@/lib/services/auth";

export interface PublicTutor {
  _id: string;
  name: string;
}

export const useRequestProposalLogic = () => {
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

  return {
    router,
    tutorId,
    isTutorViewer,
    tutor,
    loading
  }
}
