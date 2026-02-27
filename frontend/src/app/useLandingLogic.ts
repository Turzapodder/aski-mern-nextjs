import { useRouter } from "next/navigation";
import { useAppSelector } from "@/lib/hooks";

export const useLandingLogic = () => {
  const router = useRouter();
  const { isAuthenticated, userRole } = useAppSelector((state) => state.auth);

  const handleWhatsAppClick = () => {
    if (isAuthenticated) {
      window.open('https://wa.me/', '_blank');
    } else {
      router.push('/account/login?role=user&redirect=whatsapp');
    }
  };

  return {
    handleWhatsAppClick
  };
};
