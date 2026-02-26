"use client"

import Link from "next/link";
import { useVerifyEmailLogic } from "./useVerifyEmailLogic";

export const VerifyEmailClient = () => {
  const {
    formik,
    urlEmail,
    loginHref,
    serverErrorMessage,
    serverSuccessMessage,
    loading,
    otpValues,
    handleOtpChange,
    handleKeyDown
  } = useVerifyEmailLogic();

  const { values, handleSubmit } = formik;

  return (
    <div className="flex items-center justify-center min-h-screen bg-white p-4">
      <div className="w-full max-w-[400px] p-8">
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          </div>
        </div>
        
        <h2 className="text-2xl font-semibold text-center mb-2">Verify your email</h2>
        <p className="text-sm text-center mb-8 text-gray-500">
          We sent a code to <span className="font-medium text-gray-700">{values.email || urlEmail || 'your email'}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center gap-3 mb-6">
            {otpValues.map((digit, index) => (
              <input
                key={index}
                type="text"
                id={`otp-${index}`}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-14 h-14 text-center text-2xl border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                maxLength={1}
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white font-medium py-2.5 px-4 rounded-lg hover:bg-gray-800 transition duration-200 disabled:bg-gray-400"
          >
            Continue
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Didn&apos;t receive the email?{' '}
            <button className="text-black font-semibold hover:underline">
              Click to resend
            </button>
          </p>
        </div>

        <div className="mt-8 text-center">
          <Link 
            href={loginHref} 
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
