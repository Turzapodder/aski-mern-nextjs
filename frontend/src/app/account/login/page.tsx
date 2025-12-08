/* eslint-disable @next/next/no-img-element */
"use client"
import Link from "next/link";
import { useFormik } from 'formik';
import { loginSchema } from "@/validation/schemas";
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from "react";
import { useLoginUserMutation } from "@/lib/services/auth";
import { useConvertFormToAssignmentMutation } from '@/lib/services/student'

const initialValues = {
  email: "",
  password: ""
}

const Login = () => {
  const [serverErrorMessage, setServerErrorMessage] = useState('')
  const [serverSuccessMessage, setServerSuccessMessage] = useState('')
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loginUser] = useLoginUserMutation()
  const [pendingSessionId, setPendingSessionId] = useState<string>('')
  const [convertForm] = useConvertFormToAssignmentMutation()

  // Check for pending form data
  useEffect(() => {
    const storedSessionId = localStorage.getItem('pendingFormSessionId')
    if (storedSessionId) {
      setPendingSessionId(storedSessionId)
    }
  }, [])

  // Handle form conversion after successful login
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

  const { values, errors, handleChange, handleSubmit } = useFormik({
    initialValues,
    validationSchema: loginSchema,
    onSubmit: async (values, action) => {
      setLoading(true);
      try {
        const response: any = await loginUser(values)
        if (response.data && response.data.status === "success") {
          setServerSuccessMessage(response.data.message)
          setServerErrorMessage('')
          action.resetForm()

          // Convert pending form if exists
          await handleFormConversion()

          setTimeout(() => {
            const redirect = searchParams.get('redirect');
            const user = response.data.user; // Assuming the response contains the user object

            if (user && user.roles.includes('tutor') && user.onboardingStatus !== 'completed') {
              router.push('/account/tutor-onboarding');
            } else if (redirect === 'whatsapp') {
              window.location.href = 'https://wa.me/';
            } else {
              router.push('/user/dashboard');
            }
          }, 1000)
          setLoading(false);
        }
        if (response.error && response.error.data.status === "failed") {
          setServerErrorMessage(response.error.data.message)
          setServerSuccessMessage('')
          setLoading(false);
        }
      } catch (error: any) {
        // console.log(error);
        setLoading(false);
      }
    }
  })

  const handleGoogleLogin = async () => {
    window.open(
      `http://localhost:8000/auth/google`,
      "_self"
    );
  }


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-6xl w-full mx-auto bg-white rounded-3xl shadow-lg overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          {/* Left Section - Login Form */}
          <div className="w-full lg:w-1/2 p-8 lg:p-12 flex flex-col justify-between">
            <div className="flex  gap-3 items-center mt-5 mb-20 ">
              <img
                src="/assets/main-logo.svg"
                alt="logo"
                className={`min-w-[30px] min-h-[30px] w-[120px] object-contain`}
              />
            </div>
            <div className="mb-8">
              <h2 className="text-xl font-medium mb-4">ACCOUNT</h2>
              <h1 className="text-3xl font-bold mb-3">Sign in to your account</h1>
              <p className="text-black text-lg font-regular">Enter your credentials here</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-black mb-2">
                  Email address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={values.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-full border text-gray-900 border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                  placeholder="Email address"
                />
                {errors.email && <div className="text-sm text-red-500 mt-1">{errors.email}</div>}
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-black mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={values.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-full border text-gray-900 border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                  placeholder="Password"
                />
                {errors.password && <div className="text-sm text-red-500 mt-1">{errors.password}</div>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-500 text-white py-3 rounded-full font-medium hover:bg-black hover:text-white transition-colors disabled:bg-gray-400"
              >
                Submit
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
              </div>

              <button
                onClick={handleGoogleLogin}
                className="mt-4 w-full flex items-center justify-center gap-3 px-4 py-2 border border-gray-300 rounded-full hover:bg-gray-50 transition duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
                  <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
                  <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
                  <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
                  <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
                </svg>
                Register with Google
              </button>
            </form>
            <div className="mt-6">
              <p className="text-center text-sm text-gray-600">
                Don't have an account?{' '}
                <Link href="/account/register" className="text-black hover:text-indigo-700 font-semibold">
                  Sign up
                </Link>
              </p>
            </div>
          </div>

          {/* Right Section - Statistics Display */}
          <div className="hidden lg:block w-1/2  relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full h-full">
                {/* Background Image Container */}
                <div className="relative w-full h-[100%] rounded-3xl overflow-hidden mb-6">
                  <img
                    src="/assets/login.png"
                    alt="Dashboard Preview"
                    className="w-full h-full object-cover"
                  />

                  {/* Chris Meadow Card - Absolute Position */}
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-accent-500 flex items-center justify-center text-white font-bold">A</div>
                      <div>
                        <p className="font-semibold">Welcome Back!</p>
                        <p className="text-sm text-gray-600">Accepted a new project Cascade</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success/Error Messages */}
      {serverSuccessMessage && (
        <div className="fixed bottom-4 right-4 bg-primary-100 border border-primary-400 text-primary-700 px-4 py-3 rounded">
          {serverSuccessMessage}
        </div>
      )}
      {serverErrorMessage && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {serverErrorMessage}
        </div>
      )}
    </div>
  );
}

export default Login