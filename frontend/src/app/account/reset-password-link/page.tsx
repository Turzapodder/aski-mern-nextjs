"use client"
import Link from "next/link";
import { useFormik } from 'formik';
import { resetPasswordLinkSchema } from "@/validation/schemas";
import { useResetPasswordLinkMutation } from "@/lib/services/auth";
import { useState } from "react";
const initialValues = {
  email: "",
}
const ResetPasswordLink = () => {
  const [serverErrorMessage, setServerErrorMessage] = useState('')
  const [serverSuccessMessage, setServerSuccessMessage] = useState('')
  const [loading, setLoading] = useState(false);
  const [resetPasswordLink] = useResetPasswordLinkMutation()
  const { values, errors, handleChange, handleSubmit } = useFormik({
    initialValues,
    validationSchema: resetPasswordLinkSchema,
    onSubmit: async (values, action) => {
      setLoading(true);
      try {
        const response:any = await resetPasswordLink(values)
        if (response.data && response.data.status === "success") {
          setServerSuccessMessage(response.data.message)
          setServerErrorMessage('')
          action.resetForm()
          setLoading(false);
        }
        if (response.error && response.error.data.status === "failed") {
          setServerErrorMessage(response.error.data.message)
          setServerSuccessMessage('')
          setLoading(false);
        }
      } catch (error) {
        // console.log(error);
        setLoading(false);
      }
    }
  })
  return (
    <div className="flex items-center justify-center min-h-screen bg-white p-4">
      <div className="w-full max-w-[400px] p-8">
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
        </div>

        <h2 className="text-2xl font-semibold text-center mb-2">Forgot password?</h2>
        <p className="text-sm text-center mb-8 text-gray-500">
          No worries, we&apos;ll send you reset instructions.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Enter your email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={values.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="Enter your email"
            />
            {errors.email && <div className="mt-1 text-sm text-red-500">{errors.email}</div>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white font-medium py-2.5 px-4 rounded-lg hover:bg-gray-800 transition duration-200 disabled:bg-gray-400"
          >
            Reset password
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link 
            href="/account/login" 
            className="text-sm text-gray-600 hover:text-black flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to log in
          </Link>
        </div>

        {serverSuccessMessage && (
          <div className="mt-4 text-sm text-primary-500 font-medium text-center">
            {serverSuccessMessage}
          </div>
        )}
        {serverErrorMessage && (
          <div className="mt-4 text-sm text-red-500 font-medium text-center">
            {serverErrorMessage}
          </div>
        )}
      </div>
    </div>
  );
}

export default ResetPasswordLink
