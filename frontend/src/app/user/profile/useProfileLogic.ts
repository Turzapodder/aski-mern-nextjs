import { useGetUserQuery } from "@/lib/services/auth";
import { useMemo } from "react";

export const useProfileLogic = () => {
  const { data: userData, isSuccess } = useGetUserQuery();
  const user = userData?.user;
  const userId = user?._id || user?.id;
  
  const role: any = useMemo(() => {
    const roles: string[] = user?.roles || [];
    if (roles.includes('tutor')) return 'tutor';
    if (roles.includes('student')) return 'student';
    return 'user';
  }, [user]);

  return {
    isSuccess,
    userId,
    role
  }
}
