import { useEffect, useState } from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useGetUserQuery, useGenerateQuizMutation } from '@/lib/services/auth';
import {
  useSubmitTutorApplicationMutation,
  useGetTutorApplicationStatusQuery,
} from '@/lib/services/tutor';
import { useRouter } from 'next/navigation';
import type { User, QuizQuestion, QuizSummary, OnboardingFormData } from '../types';

const validationSchema = [
  Yup.object({
    name: Yup.string().required('Full name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    phoneNumber: Yup.string().required('Phone number is required'),
    university: Yup.string().required('University name is required'),
    degree: Yup.string().required('Degree is required'),
    gpa: Yup.string().required('GPA is required'),
    country: Yup.string().required('Country is required'),
    subject: Yup.string().required('Subject is required'),
    topics: Yup.array().min(1, 'Select at least one topic').required('Topics are required'),
    profilePicture: Yup.mixed().required('Profile picture is required'),
  }),
  Yup.object({}),
  Yup.object({}),
];

export const useTutorOnboardingLogic = () => {
  const router = useRouter();
  const [user, setUser] = useState<User>({ name: '', email: '', is_verified: false });
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizLoading, setQuizLoading] = useState(false);
  const [tempFormData, setTempFormData] = useState<OnboardingFormData | null>(null);
  const [countdown, setCountdown] = useState(30);
  const [showSubmit, setShowSubmit] = useState(true);
  const [applicationSubmitted, setApplicationSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [existingApplication, setExistingApplication] = useState<unknown>(null);

  const [generateQuiz] = useGenerateQuizMutation();
  const [submitApplication] = useSubmitTutorApplicationMutation();
  const { data: userData, isSuccess: userSuccess } = useGetUserQuery();
  const {
    data: applicationData,
    isSuccess: applicationSuccess,
  } = useGetTutorApplicationStatusQuery();

  const formik = useFormik<OnboardingFormData>({
    enableReinitialize: true,
    initialValues: {
      name: user?.name || '',
      email: user?.email || '',
      phoneNumber: '',
      university: '',
      degree: '',
      gpa: '',
      country: '',
      subject: '',
      topics: [],
      quizSummary: null,
      certificate: null,
      profilePicture: null,
    },
    validationSchema: validationSchema[currentStep - 1],
    onSubmit: async (values) => {
      setIsSubmitting(true);
      setErrorMessage('');

      try {
        if (currentStep === 1) {
          if (values.subject) {
            try {
              const canApplyResponse = await fetch(
                `${
                  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
                }/api/tutor/can-apply/${encodeURIComponent(values.subject)}`,
                { credentials: 'include', headers: { Accept: 'application/json' } }
              );
              const canApplyData = await canApplyResponse.json();
              if (!canApplyData.canApply) {
                setErrorMessage(canApplyData.message);
                setIsSubmitting(false);
                return;
              }
            } catch (error) {
              console.error('Error checking application eligibility:', error);
            }
          }

          setTempFormData(values);
          setQuizLoading(true);

          try {
            const response = await generateQuiz({
              subject: values.subject,
              topics: values.topics,
            }).unwrap();

            if (response?.data?.questions) {
              setQuizQuestions(response.data.questions);
              setCurrentStep(2);
            } else {
              throw new Error('Failed to generate quiz - no questions received');
            }
          } catch (quizError) {
            console.error('Quiz generation error:', quizError);
            setErrorMessage('Failed to generate quiz. Please try again.');
          }
        }
      } catch (error) {
        console.error('Error:', error);
        setErrorMessage('An error occurred. Please try again.');
      } finally {
        setIsSubmitting(false);
        setQuizLoading(false);
      }
    },
  });

  const handleFinalSubmit = async (quizSummary: QuizSummary) => {
    if (applicationSubmitted || isSubmitting || !tempFormData) return;

    try {
      setIsSubmitting(true);
      setApplicationSubmitted(true);

      const payload = {
        personalInfo: {
          name: tempFormData.name,
          email: tempFormData.email,
          phoneNumber: tempFormData.phoneNumber,
          university: tempFormData.university,
          degree: tempFormData.degree,
          gpa: tempFormData.gpa,
          country: tempFormData.country,
        },
        academicInfo: {
          subject: tempFormData.subject,
          topics: tempFormData.topics,
        },
        quizSummary,
        documents: {
          certificate: tempFormData.certificate || undefined,
          profilePicture: tempFormData.profilePicture || undefined,
        },
      };

      const response = await submitApplication(payload).unwrap();

      if (response.status === 'success') {
        setCurrentStep(3);
      } else {
        throw new Error(response.message || 'Failed to submit application');
      }
    } catch (error: unknown) {
      console.error('Failed to submit application:', error);
      const apiError = error as { data?: { message?: string }; message?: string };
      setErrorMessage(apiError.data?.message || apiError.message || 'Failed to submit application');
      setApplicationSubmitted(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (userData && userSuccess) setUser(userData.user);
  }, [userData, userSuccess]);

  useEffect(() => {
    if (applicationData && applicationSuccess) {
      setExistingApplication(applicationData.application);
      setCurrentStep(3);
    }
  }, [applicationData, applicationSuccess]);

  useEffect(() => {
    if (currentStep === 3 && countdown > 0) {
      const timer = setTimeout(() => setCountdown((n) => n - 1), 1000);
      return () => clearTimeout(timer);
    } else if (currentStep === 3 && countdown === 0) {
      router.push('/user/dashboard');
    }
  }, [currentStep, countdown, router]);

  return {
    formik,
    currentStep,
    isSubmitting,
    quizQuestions,
    quizLoading,
    countdown,
    showSubmit,
    applicationSubmitted,
    errorMessage,
    setErrorMessage,
    existingApplication,
    handleFinalSubmit,
    router,
  };
};
