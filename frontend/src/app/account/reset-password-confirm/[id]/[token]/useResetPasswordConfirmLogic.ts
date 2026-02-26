import { useFormik } from "formik";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { resetPasswordSchema } from "@/validation/schemas";
import { useResetPasswordMutation } from "@/lib/services/auth";

const initialValues = {
  password: "",
  password_confirmation: ""
};

export const useResetPasswordConfirmLogic = () => {
  const params = useParams<{ id: string; token: string }>();
  const router = useRouter();
  const [resetPassword] = useResetPasswordMutation();
  const [serverErrorMessage, setServerErrorMessage] = useState("");
  const [serverSuccessMessage, setServerSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRedirect = () => {
    setTimeout(() => {
      router.push("/account/login?role=user");
    }, 1200);
  };

  const formik = useFormik({
    initialValues,
    validationSchema: resetPasswordSchema,
    onSubmit: async (values, action) => {
      const userId = params?.id;
      const token = params?.token;

      if (!userId || !token) {
        setServerErrorMessage("Invalid reset link.");
        return;
      }

      setLoading(true);
      setServerErrorMessage("");
      setServerSuccessMessage("");

      try {
        const response: any = await resetPassword({
          id: userId,
          token,
          ...values
        });

        if (response.data && response.data.status === "success") {
          setServerSuccessMessage(response.data.message);
          action.resetForm();
          handleRedirect();
        } else if (response.error?.data?.status === "failed") {
          setServerErrorMessage(response.error.data.message);
        } else {
          setServerErrorMessage("Unable to reset password.");
        }
      } catch (error) {
        setServerErrorMessage("Unable to reset password.");
      } finally {
        setLoading(false);
      }
    }
  });

  return { formik, loading, serverErrorMessage, serverSuccessMessage };
};
