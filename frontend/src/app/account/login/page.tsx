/* eslint-disable @next/next/no-img-element */
"use client"
import Link from "next/link";
import { useFormik } from 'formik';
import { loginSchema } from "@/validation/schemas";
import { useRouter } from 'next/navigation'
import { useState } from "react";
import { useLoginUserMutation } from "@/lib/services/auth";

const initialValues = {
  email: "",
  password: ""
}

const Login = () => {
  const [serverErrorMessage, setServerErrorMessage] = useState('')
  const [serverSuccessMessage, setServerSuccessMessage] = useState('')
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [loginUser] = useLoginUserMutation()
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
          setTimeout(() => {
            router.push('/user/profile')  // Fixed: Using absolute path instead of relative path
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
              <button className="flex items-center justify-center w-12 h-12 border border-black bg-black hover:bg-white transition-all rounded-full group">
                <svg className="w-5 h-5 group-hover:text-black text-white" fill="currentColor" viewBox="0 0 384 512">
                  <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
                </svg>
              </button>
              <span className="font-semibold text-2xl">Aski</span>
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
                className="w-full bg-secondary-500 text-black py-3 rounded-full font-medium hover:bg-black hover:text-white transition-colors disabled:bg-gray-400"
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
        <div className="fixed bottom-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
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