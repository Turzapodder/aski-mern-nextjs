import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export const useLandingLogic = () => {
  const router = useRouter();

  const handleWhatsAppClick = () => {
    const isAuth = Cookies.get('is_auth');
    if (isAuth === 'true') {
      window.open('https://wa.me/', '_blank');
    } else {
      router.push('/account/login?role=user&redirect=whatsapp');
    }
  };

  return {
    handleWhatsAppClick
  };
};
