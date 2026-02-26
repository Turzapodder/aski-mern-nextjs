import { useState, useEffect } from "react";
import { useFormik } from 'formik';
import { registerSchema } from '@/validation/schemas'
import { useCreateUserMutation } from "@/lib/services/auth";
import { useRouter, useSearchParams } from 'next/navigation'
import { useGetStudentFormQuery, useConvertFormToAssignmentMutation } from '@/lib/services/student'

const initialValues = {
  name: "",
  email: "",
  password: "",
  password_confirmation: "",
  role: "user" // Add role to initial values
}

export const useRegisterLogic = () => {
  const [serverErrorMessage, setServerErrorMessage] = useState('')
  const [serverSuccessMessage, setServerSuccessMessage] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState("user");
  const router = useRouter()
  const searchParams = useSearchParams();
  const [pendingSessionId, setPendingSessionId] = useState<string>('')
  const [showFormNotification, setShowFormNotification] = useState(false)
  const [createUser] = useCreateUserMutation()
  const [convertForm] = useConvertFormToAssignmentMutation()
  
  // Check for pending form data
  const { data: formData } = useGetStudentFormQuery(pendingSessionId, {
    skip: !pendingSessionId
  })
  
  // Handle form conversion after successful registration
  const handleFormConversion = async () => {
    if (pendingSessionId) {
      try {
        await convertForm({ sessionId: pendingSessionId }).unwrap()
        localStorage.removeItem('pendingFormSessionId')
        console.log('Form converted successfully')
      } catch (error) {
        console.error('Failed to convert form:', error)
      }
    }
  }

  const formik = useFormik({
    initialValues,
    validationSchema: registerSchema,
    onSubmit: async (values, action) => {
      setLoading(true);
      try {
        // Include the role in the submission
        const dataToSubmit = {
          ...values,
          role: userRole // Ensure role is included
        };
        
        const response: any = await createUser(dataToSubmit)

        if (response.data && response.data.status === "success") {
          setServerSuccessMessage(response.data.message)
          setServerErrorMessage('')
          action.resetForm()
          setLoading(false);
          
          // Redirect based on role
          if (userRole === "tutor") {
            router.push(`/account/verify-email?email=${values.email}&role=tutor`)
          } else {
            // Convert pending form if exists
            await handleFormConversion()
            router.push(`/account/verify-email?email=${values.email}`)
          }
        }

        if (response.error && response.error.data.status === "failed") {
          // If email exists but not verified, redirect to verify-email page
          if (response.error.data.message.includes("not verified")) {
            setServerSuccessMessage("A new verification code has been sent to your email")
            setServerErrorMessage('')
            setLoading(false);
            // Convert pending form if exists
            await handleFormConversion()
            // Pass email to verify page through router state
            router.push(`/account/verify-email?email=${values.email}`)
          } else {
            // Handle other errors
            setServerErrorMessage(response.error.data.message)
            setServerSuccessMessage('')
            setLoading(false);
          }
        }
      } catch (error) {
        setServerErrorMessage('Something went wrong. Please try again.')
        setLoading(false);
      }
    }
  })

  // Get role from search params
  useEffect(() => {
    const role = searchParams.get("role");
    if (role === "tutor") {
      setUserRole("tutor");
      formik.setFieldValue("role", "tutor");
    }
    
    // Check for pending form session ID
    const storedSessionId = localStorage.getItem('pendingFormSessionId')
    if (storedSessionId) {
      setPendingSessionId(storedSessionId)
      setShowFormNotification(true)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);
  
  const handleGoogleLogin = async () => {
    // Pass the role parameter to the Google auth endpoint
    window.open(
      `http://localhost:8000/auth/google?role=${userRole}`,
      "_self"
    );
  }

  return {
    formik,
    serverErrorMessage,
    serverSuccessMessage,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    loading,
    userRole,
    showFormNotification,
    formData,
    handleGoogleLogin,
  }
}
