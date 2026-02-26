import { useFormik } from "formik";
import { loginSchema } from "@/validation/schemas";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useLoginUserMutation } from "@/lib/services/auth";
import { useConvertFormToAssignmentMutation } from "@/lib/services/student";

export type LoginRole = "user" | "tutor" | "admin";

const initialValues = {
  email: "",
  password: ""
};

export const normalizeRole = (value: string | null): LoginRole | null => {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  if (normalized === "user" || normalized === "student") return "user";
  if (normalized === "tutor") return "tutor";
  if (normalized === "admin") return "admin";
  return null;
};

export const useLoginLogic = () => {
  const [serverErrorMessage, setServerErrorMessage] = useState("");
  const [serverSuccessMessage, setServerSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loginUser] = useLoginUserMutation();
  const [pendingSessionId, setPendingSessionId] = useState<string>("");
  const [convertForm] = useConvertFormToAssignmentMutation();

  const loginRole = useMemo<LoginRole | null>(
    () => normalizeRole(searchParams.get("role")),
    [searchParams]
  );
  const redirect = searchParams.get("redirect");
  const authError = searchParams.get("error");
  const authErrorMessage = useMemo(() => {
    if (!authError) return "";
    if (authError === "role_mismatch") {
      return "This account cannot use this login entrypoint.";
    }
    if (authError === "oauth_failed") {
      return "Google login failed. Please try again.";
    }
    if (authError === "callback_failed") {
      return "Google login callback failed. Please try again.";
    }
    if (authError === "oauth_init_failed") {
      return "Unable to start Google login.";
    }
    return "";
  }, [authError]);
  const isRoleMissing = !loginRole;

  useEffect(() => {
    if (isRoleMissing) {
      setServerErrorMessage(
        "Login role is required. Use /account/login?role=user, /account/login?role=tutor, or /account/login?role=admin."
      );
      return;
    }
    if (authErrorMessage) {
      setServerErrorMessage(authErrorMessage);
      return;
    }
    setServerErrorMessage("");
  }, [isRoleMissing, authErrorMessage]);

  useEffect(() => {
    if (loginRole === "admin") return;
    const storedSessionId = localStorage.getItem("pendingFormSessionId");
    if (storedSessionId) {
      setPendingSessionId(storedSessionId);
    }
  }, [loginRole]);

  const handleFormConversion = async () => {
    if (!pendingSessionId || loginRole === "admin") return;
    try {
      await convertForm({ sessionId: pendingSessionId }).unwrap();
      localStorage.removeItem("pendingFormSessionId");
    } catch (error) {
      console.error("Failed to convert form:", error);
    }
  };

  const formik = useFormik({
    initialValues,
    validationSchema: loginSchema,
    onSubmit: async (formValues, action) => {
      if (!loginRole) {
        setServerErrorMessage(
          "Login role is required. Use /account/login?role=user, /account/login?role=tutor, or /account/login?role=admin."
        );
        return;
      }

      setLoading(true);
      try {
        const response: any = await loginUser({
          ...formValues,
          role: loginRole,
        });

        if (response.data && response.data.status === "success") {
          setServerSuccessMessage(response.data.message);
          setServerErrorMessage("");
          action.resetForm();

          await handleFormConversion();

          setTimeout(() => {
            const user = response.data.user;
            const isAdmin = user?.roles?.includes("admin");
            const isTutor = user?.roles?.includes("tutor");
            const onboardingStatus = user?.onboardingStatus;

            if (isAdmin) {
              router.push("/admin");
              return;
            }

            if (
              isTutor &&
              onboardingStatus &&
              onboardingStatus !== "completed" &&
              onboardingStatus !== "approved"
            ) {
              router.push("/account/tutor-onboarding");
              return;
            }

            if (redirect === "whatsapp") {
              window.location.href = "https://wa.me/";
              return;
            }

            router.push("/user/dashboard");
          }, 1000);
          return;
        }

        if (response.error && response.error.data?.status === "failed") {
          setServerErrorMessage(response.error.data.message);
          setServerSuccessMessage("");
        }
      } catch (error: any) {
        setServerErrorMessage(error?.message || "Unable to login");
        setServerSuccessMessage("");
      } finally {
        setLoading(false);
      }
    },
  });

  const handleGoogleLogin = () => {
    if (!loginRole) return;
    window.open(
      `http://localhost:8000/auth/google?role=${loginRole}`,
      "_self"
    );
  };

  return {
    formik,
    loading,
    loginRole,
    isRoleMissing,
    serverErrorMessage,
    serverSuccessMessage,
    handleGoogleLogin,
  };
};
