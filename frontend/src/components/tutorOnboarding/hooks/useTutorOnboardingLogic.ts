import { useCallback, useEffect, useRef, useState } from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import {
  useGetUserQuery,
  useGenerateQuizMutation,
  useLogoutUserMutation,
} from '@/lib/services/auth';
import {
  useSubmitTutorApplicationMutation,
  useGetTutorApplicationStatusQuery,
} from '@/lib/services/tutor';
import { useRouter } from 'nextjs-toploader/app';
import { useAppDispatch } from '@/lib/hooks';
import { logout } from '@/lib/features/auth/authSlice';

export interface User {
  name: string;
  email: string;
  is_verified: boolean;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  topic: string;
}

export interface QuizSummary {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  timeSpent: number;
  topicPerformance: Record<string, any>;
  answers?: any[];
}

export interface FormData {
  name: string;
  email: string;
  phoneNumber: string;
  university: string;
  degree: string;
  gpa: string;
  country: string;
  subject: string;
  topics: string[];
  quizSummary: QuizSummary | null;
  certificate: File | null;
  profilePicture: File | null;
}

export const validationSchema = [
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
  const dispatch = useAppDispatch();
  const [user, setUser] = useState<User>({
    name: '',
    email: '',
    is_verified: false,
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizLoading, setQuizLoading] = useState(false);
  const [tempFormData, setTempFormData] = useState<FormData | null>(null);
  const [countdown, setCountdown] = useState(30);
  const [showSubmit, setShowSubmit] = useState(true);
  const [applicationSubmitted, setApplicationSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [existingApplication, setExistingApplication] = useState<any>(null);
  const [isFlowReady, setIsFlowReady] = useState(false);
  const hasTriggeredLogoutRef = useRef(false);

  const [initialFormValues, setInitialFormValues] = useState<Partial<FormData>>({});

  const [generateQuiz] = useGenerateQuizMutation();
  const [submitApplication] = useSubmitTutorApplicationMutation();
  const [logoutUser] = useLogoutUserMutation();
  const { data: userData, isSuccess: userSuccess, isLoading: userLoading } = useGetUserQuery();

  const logoutAndGoHome = useCallback(async () => {
    if (hasTriggeredLogoutRef.current) return;
    hasTriggeredLogoutRef.current = true;

    try {
      await logoutUser({}).unwrap();
    } catch (error) {
      // Even if server logout fails, clear client auth state to avoid redirect flicker.
    } finally {
      dispatch(logout());
      router.replace('/');
    }
  }, [dispatch, logoutUser, router]);

  const {
    data: applicationData,
    isSuccess: applicationSuccess,
    isLoading: applicationLoading,
    isError: applicationError,
  } = useGetTutorApplicationStatusQuery();

  // Load onboarding draft state from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Restore form values
    const savedFormValues = localStorage.getItem('tutor_onboarding_form_values');
    if (savedFormValues) {
      try {
        const parsed = JSON.parse(savedFormValues);
        setInitialFormValues(parsed);
      } catch (err) {
        console.error('Failed to parse onboarding form values draft:', err);
      }
    }

    // 2. Restore step status and quiz draft
    const savedDraft = localStorage.getItem('tutor_onboarding_draft');
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        if (draft.currentStep && (draft.currentStep === 1 || draft.currentStep === 2)) {
          setCurrentStep(draft.currentStep);
        }
        if (draft.tempFormData) {
          setTempFormData(draft.tempFormData);
        }
        if (draft.quizQuestions) {
          setQuizQuestions(draft.quizQuestions);
        }
      } catch (err) {
        console.error('Failed to parse tutor onboarding draft:', err);
      }
    }
  }, []);

  const formik = useFormik<FormData>({
    enableReinitialize: true,
    initialValues: {
      name: initialFormValues.name || user?.name || '',
      email: initialFormValues.email || user?.email || '',
      phoneNumber: initialFormValues.phoneNumber || '',
      university: initialFormValues.university || '',
      degree: initialFormValues.degree || '',
      gpa: initialFormValues.gpa || '',
      country: initialFormValues.country || '',
      subject: initialFormValues.subject || '',
      topics: initialFormValues.topics || [],
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
          // Check if user can apply for this subject
          if (values.subject) {
            try {
              const canApplyResponse = await fetch(
                `${
                  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
                }/api/tutor/can-apply/${encodeURIComponent(values.subject)}`,
                {
                  credentials: 'include',
                  headers: {
                    Accept: 'application/json',
                  },
                }
              );

              const canApplyData = await canApplyResponse.json();

              if (!canApplyData.canApply) {
                setErrorMessage(canApplyData.message);
                setIsSubmitting(false);
                return;
              }
            } catch (error) {
              console.error('Error checking application eligibility:', error);
              // Continue with the process if check fails
            }
          }

          setTempFormData(values);
          setQuizLoading(true);

          console.log('Generating quiz for:', values.subject, values.topics);

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
    if (applicationSubmitted || isSubmitting || !tempFormData) {
      console.log('Application already submitted or in progress, skipping...');
      return;
    }

    try {
      console.log('Starting application submission...');
      setIsSubmitting(true);
      setApplicationSubmitted(true);

      const applicationData = {
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
        quizSummary: quizSummary,
        documents: {
          certificate: tempFormData.certificate || undefined,
          profilePicture: tempFormData.profilePicture || undefined,
        },
      };

      console.log('Submitting application data:', applicationData);

      const response = await submitApplication(applicationData).unwrap();

      if (response.status === 'success') {
        console.log('Application submitted successfully:', response);
        // Clear drafts on successful final submission
        if (typeof window !== 'undefined') {
          localStorage.removeItem('tutor_onboarding_draft');
          localStorage.removeItem('tutor_onboarding_form_values');
        }
        setCurrentStep(3);
      } else {
        throw new Error(response.message || 'Failed to submit application');
      }
    } catch (error: any) {
      console.error('Failed to submit application:', error);
      setErrorMessage(error.data?.message || error.message || 'Failed to submit application');
      setApplicationSubmitted(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Auto-save form inputs (Step 1)
  useEffect(() => {
    if (typeof window === 'undefined' || currentStep !== 1) return;

    const formValues = {
      name: formik.values.name,
      email: formik.values.email,
      phoneNumber: formik.values.phoneNumber,
      university: formik.values.university,
      degree: formik.values.degree,
      gpa: formik.values.gpa,
      country: formik.values.country,
      subject: formik.values.subject,
      topics: formik.values.topics,
    };
    localStorage.setItem('tutor_onboarding_form_values', JSON.stringify(formValues));
  }, [
    formik.values.name,
    formik.values.email,
    formik.values.phoneNumber,
    formik.values.university,
    formik.values.degree,
    formik.values.gpa,
    formik.values.country,
    formik.values.subject,
    formik.values.topics,
    currentStep,
  ]);

  // Auto-save step draft (Steps 1 & 2 / Quiz progress)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Step 3 represents final submission and is handled strictly by the database query state. Wipes the local storage drafts.
    if (currentStep === 3) {
      localStorage.removeItem('tutor_onboarding_draft');
      localStorage.removeItem('tutor_onboarding_form_values');
      return;
    }

    const draft = {
      currentStep,
      tempFormData,
      quizQuestions,
    };
    localStorage.setItem('tutor_onboarding_draft', JSON.stringify(draft));
  }, [currentStep, tempFormData, quizQuestions]);

  // Sync user profile query data to state
  useEffect(() => {
    if (userData && userSuccess) {
      setUser(userData.user);
    }
  }, [userData, userSuccess]);

  // Handle backend existing application redirects and state
  useEffect(() => {
    if (applicationData && applicationSuccess) {
      if (applicationData.application?.applicationStatus === 'approved') {
        router.replace('/user/dashboard');
        return;
      }

      setExistingApplication(applicationData.application);
      // Database-approved or pending applications force step 3
      setCurrentStep(3);
    }
  }, [applicationData, applicationSuccess, router]);

  // Eliminate race-conditions and flickers: only render when all queries have loaded and no active redirects are taking place
  useEffect(() => {
    const isApproved = applicationData?.application?.applicationStatus === 'approved';
    if (isApproved) return; // Keep rendering loading skeleton while redirecting

    if (applicationLoading || userLoading) return;

    if ((applicationSuccess || applicationError) && (userSuccess || !userData)) {
      setIsFlowReady(true);
    }
  }, [applicationLoading, userLoading, applicationSuccess, applicationError, userSuccess, userData, applicationData]);

  // Countdown timer for Step 3
  useEffect(() => {
    if (currentStep === 3 && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (currentStep === 3 && countdown === 0) {
      logoutAndGoHome();
    }
  }, [currentStep, countdown, logoutAndGoHome]);

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
    isFlowReady,
    logoutAndGoHome,
    handleFinalSubmit,
    router,
  };
};

