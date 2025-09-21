"use client"
import Link from "next/link";
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

const Register = () => {
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
  
  // Get role from search params
  useEffect(() => {
    const role = searchParams.get("role");
    if (role === "tutor") {
      setUserRole("tutor");
      // Update formik values with the role
      values.role = "tutor";
    }
    
    // Check for pending form session ID
    const storedSessionId = localStorage.getItem('pendingFormSessionId')
    if (storedSessionId) {
      setPendingSessionId(storedSessionId)
      setShowFormNotification(true)
    }
  }, [searchParams]);
  
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

  const { values, errors, touched, handleChange, handleSubmit, handleBlur } = useFormik({
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
  
  const handleGoogleLogin = async () => {
    // Pass the role parameter to the Google auth endpoint
    window.open(
      `http://localhost:8000/auth/google?role=${userRole}`,
      "_self"
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-7xl bg-white rounded-2xl shadow-xl flex flex-col md:flex-row overflow-hidden">
        {/* Left Side - Image */}
        <div className="hidden lg:block w-1/2  relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-full">
              {/* Background Image Container */}
              <div className="relative w-full h-[100%] rounded-3xl overflow-hidden mb-6">
                <img
                  src="/assets/signup.png"
                  alt="Dashboard Preview"
                  className="w-full h-full object-cover"
                />

                {/* Chris Meadow Card - Absolute Position */}
                <div className="absolute top-6 left-6 right-6 w-3/4">
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent-500 flex items-center justify-center text-white font-bold">A</div>
                    <div>
                      <p className="font-semibold">Join Today</p>
                      <p className="text-sm text-gray-600">Join as a {userRole === "tutor" ? "teacher" : "student"}. a new world <br></br>is waiting for you</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-1/2 p-20 ">
          <div className="flex  gap-3 items-center mt-5 mb-10 ">
            <img
                src="/assets/main-logo.svg"
                alt="logo"
                className={`min-w-[30px] min-h-[30px] w-[120px] object-contain`}
              />
          </div>
          
          {/* Show form notification if user has pending form data */}
          {showFormNotification && formData?.formData && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-800 mb-2">
                📝 Your assignment request is saved!
              </h3>
              <p className="text-blue-700 text-sm">
                Complete registration to continue with: "{formData.formData.description?.substring(0, 50)}..."
              </p>
            </div>
          )}
          
          <h2 className="text-3xl font-semibold mb-5 text-gray-800">
            Create an account
            {userRole === "tutor" && <span className="text-accent-500 ml-2">as a Teacher</span>}
          </h2>
          <div className="mt-6">
            <button
              onClick={handleGoogleLogin}
              className="mt-4 w-full flex items-center justify-center gap-3 px-4 py-2 border border-gray-300 rounded-[15px] hover:bg-gray-50 transition duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
                <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
                <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
                <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
                <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
              </svg>
              Register with Google
            </button>
            <div className="relative mt-5 mb-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or use your personal email</span>
              </div>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Form fields remain unchanged */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={values.name}
                onChange={handleChange}
                onBlur={handleBlur}
                className="w-full px-4 py-2 border border-gray-300 rounded-[15px] focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter your name"
              />
              {touched.name && errors.name && <div className="mt-1 text-sm text-red-500">{errors.name}</div>}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
                className="w-full px-4 py-2 border border-gray-300 rounded-[15px] focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter your email"
              />
              {touched.email && errors.email && <div className="mt-1 text-sm text-red-500">{errors.email}</div>}
            </div>
            <div className="flex gap-5 w-full">
              <div className="w-1/2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={values.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="w-full px-4 py-2 border border-gray-300 rounded-[15px] focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>
                {touched.password && errors.password && <div className="mt-1 text-sm text-red-500">{errors.password}</div>}
              </div>

              <div className="w-1/2">
                <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="password_confirmation"
                    name="password_confirmation"
                    value={values.password_confirmation}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="w-full px-4 py-2 border border-gray-300 rounded-[15px] focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Confirm password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>
                {touched.password_confirmation && errors.password_confirmation && (
                  <div className="mt-1 text-sm text-red-500">{errors.password_confirmation}</div>
                )}
              </div>
            </div>
            <div className="flex items-start gap-2 mb-4 mt-10">
              <input
                type="checkbox"
                id="terms"
                className="mt-1 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
              />
              <label htmlFor="terms" className="text-sm text-gray-600 font-medium">
                By registering your details, you agree with our{' '}
                <Link href="/terms" className="text-indigo-600 hover:text-indigo-700">
                  Terms & Conditions
                </Link>
                , and{' '}
                <Link href="/privacy" className="text-indigo-600 hover:text-indigo-700">
                  Privacy and Cookie Policy
                </Link>
              </label>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-500 text-white py-2 px-4 rounded-[15px] hover:bg-black hover:text-white transition duration-200 disabled:bg-gray-400"
            >
              {loading ? 'Creating Account...' : 'Register'}
            </button>
          </form>

          <div className="mt-6">
            <p className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/account/login" className="text-black hover:text-indigo-700 font-semibold">
                Login
              </Link>
            </p>
          </div>

          {serverSuccessMessage && (
            <div className="mt-4 text-sm text-primary-500 font-medium text-center">{serverSuccessMessage}</div>
          )}
          {serverErrorMessage && (
            <div className="mt-4 text-sm text-red-500 font-medium text-center">{serverErrorMessage}</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Register