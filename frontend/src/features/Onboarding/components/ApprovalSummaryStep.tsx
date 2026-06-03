'use client';

import { useRouter } from 'next/navigation';
import { Clock, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

interface ApprovalSummaryStepProps {
  existingApplication: any;
  countdown: number;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'text-yellow-600 bg-yellow-100';
    case 'under_review':
      return 'text-blue-600 bg-blue-100';
    case 'approved':
      return 'text-green-600 bg-green-100';
    case 'rejected':
      return 'text-red-600 bg-red-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending':
      return <Clock className="h-14 w-14 text-yellow-500" />;
    case 'under_review':
      return <AlertTriangle className="h-14 w-14 text-blue-500" />;
    case 'approved':
      return <CheckCircle2 className="h-14 w-14 text-green-500" />;
    case 'rejected':
      return <XCircle className="h-14 w-14 text-red-500" />;
    default:
      return <AlertTriangle className="h-14 w-14 text-gray-400" />;
  }
};

export function ApprovalSummaryStep({ existingApplication, countdown }: ApprovalSummaryStepProps) {
  const router = useRouter();

  if (existingApplication) {
    return (
      <div className="min-h-[400px] p-4 sm:p-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="mb-4 flex justify-center">
              {getStatusIcon(existingApplication.applicationStatus)}
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Application Status</h2>
            <div
              className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(
                existingApplication.applicationStatus
              )}`}
            >
              {existingApplication.applicationStatus.charAt(0).toUpperCase() +
                existingApplication.applicationStatus.slice(1).replace('_', ' ')}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 sm:p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Application Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Subject</p>
                <p className="font-medium">{existingApplication.academicInfo?.subject || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Topics</p>
                <p className="font-medium">
                  {existingApplication.academicInfo?.topics?.join(', ') || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Submitted</p>
                <p className="font-medium">
                  {new Date(existingApplication.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Application ID</p>
                <p className="font-medium text-xs">{existingApplication._id}</p>
              </div>
            </div>
          </div>

          <div className="text-center">
            {existingApplication.applicationStatus === 'pending' && (
              <p className="text-gray-600 mb-4">
                Your application is being reviewed. We&apos;ll contact you within 24-48 hours with
                an update.
              </p>
            )}
            {existingApplication.applicationStatus === 'under_review' && (
              <p className="text-gray-600 mb-4">
                Your application is currently under detailed review. We&apos;ll notify you once the
                review is complete.
              </p>
            )}
            {existingApplication.applicationStatus === 'approved' && (
              <p className="text-green-600 mb-4">
                Congratulations! Your application has been approved. Welcome to our tutor community!
              </p>
            )}
            {existingApplication.applicationStatus === 'rejected' && (
              <p className="text-red-600 mb-4">
                Unfortunately, your application was not approved at this time. You may reapply after
                30 days.
              </p>
            )}
            <button
              type="button"
              onClick={() => router.push('/user/dashboard')}
              className="px-6 py-3 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Success screen after fresh submission
  return (
    <div className="min-h-[400px] flex flex-col items-center justify-center p-4 sm:p-8 text-center">
      <div className="bg-primary-500 rounded-full p-5 mb-6">
        <svg
          className="w-10 h-10 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="3"
            d="M5 13l4 4L19 7"
          ></path>
        </svg>
      </div>

      <h2 className="text-2xl sm:text-3xl font-bold mb-4">
        Thank you for the request, we&apos;ll get in contact within 1 hour.
      </h2>

      <p className="text-gray-600 mb-8 max-w-2xl">
        Our team will verify your application and credentials. You&apos;ll receive an email
        confirmation shortly with next steps for your tutor onboarding process.
      </p>

      <div className="mt-4">
        <button
          type="button"
          onClick={() => router.push('/user/dashboard')}
          className="px-6 py-3 bg-primary-500 text-white font-medium rounded-lg hover:bg-black transition-colors"
        >
          Check your inbox {countdown > 0 && `(Redirecting in ${countdown}s)`}
        </button>
      </div>
    </div>
  );
}
