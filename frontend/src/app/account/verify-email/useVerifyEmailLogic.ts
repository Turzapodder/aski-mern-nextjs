import { useFormik } from 'formik';
import { verifyEmailSchema } from '@/validation/schemas';
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useVerifyEmailMutation } from "@/lib/services/auth";

const initialValues = {
  email: "",
  otp: ""
}

export const useVerifyEmailLogic = () => {
  const searchParams = useSearchParams()
  const urlEmail = searchParams.get('email')
  const urlRole = (() => {
    const role = (searchParams.get("role") || "").toLowerCase();
    if (role === "tutor") return "tutor";
    if (role === "admin") return "admin";
    return "user";
  })();
  const loginHref = `/account/login?role=${urlRole}`;
  
  const [serverErrorMessage, setServerErrorMessage] = useState('')
  const [serverSuccessMessage, setServerSuccessMessage] = useState('')
  const [loading, setLoading] = useState(false);
  const router = useRouter()
  const [verifyEmailMutation] = useVerifyEmailMutation()
  
  const formik = useFormik({
    initialValues,
    validationSchema: verifyEmailSchema,
    onSubmit: async (values, action) => {
      setLoading(true);
      try {
        const response:any = await verifyEmailMutation({ email: urlEmail || values.email, otp: values.otp })
        if (response.data && response.data.status === "Success") {
          setServerSuccessMessage(response.data.message)
          setServerErrorMessage('')
          action.resetForm()
          setLoading(false);
          router.push(loginHref)
        }
        if (response.error && response.error.data.status === "failed") {
          setServerErrorMessage(response.error.data.message)
          setServerSuccessMessage('')
          setLoading(false);
        }
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    }
  })

  const [otpValues, setOtpValues] = useState(['', '', '', '']);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length <= 1 && /^[0-9]*$/.test(value)) {
      const newOtpValues = [...otpValues];
      newOtpValues[index] = value;
      setOtpValues(newOtpValues);
      
      const combinedOtp = newOtpValues.join('');
      formik.handleChange({ target: { name: 'otp', value: combinedOtp } });

      if (value && index < 3) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  return {
    formik,
    urlEmail,
    loginHref,
    serverErrorMessage,
    serverSuccessMessage,
    loading,
    otpValues,
    handleOtpChange,
    handleKeyDown
  }
}
