import { useEffect, useState } from "react";
import * as Yup from "yup";
import { useFormik } from "formik";
import { useGetUserQuery, useGenerateQuizMutation } from "@/lib/services/auth";
import {
  useSubmitTutorApplicationMutation,
  useGetTutorApplicationStatusQuery,
} from "@/lib/services/tutor";
import { useRouter } from "next/navigation";

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
    name: Yup.string().required("Full name is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    phoneNumber: Yup.string().required("Phone number is required"),
    university: Yup.string().required("University name is required"),
    degree: Yup.string().required("Degree is required"),
    gpa: Yup.string().required("GPA is required"),
    country: Yup.string().required("Country is required"),
    subject: Yup.string().required("Subject is required"),
    topics: Yup.array()
      .min(1, "Select at least one topic")
      .required("Topics are required"),
    profilePicture: Yup.mixed().required("Profile picture is required"),
  }),
  Yup.object({}),
  Yup.object({}),
];

export const useTutorOnboardingLogic = () => {
  const router = useRouter();
  const [user, setUser] = useState<User>({
    name: "",
    email: "",
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
  const [errorMessage, setErrorMessage] = useState("");
  const [existingApplication, setExistingApplication] = useState<any>(null);

  const [generateQuiz] = useGenerateQuizMutation();
  const [submitApplication] = useSubmitTutorApplicationMutation();
  const { data: userData, isSuccess: userSuccess } = useGetUserQuery();
  const {
    data: applicationData,
    isSuccess: applicationSuccess,
    isLoading: applicationLoading,
  } = useGetTutorApplicationStatusQuery();

  const formik = useFormik<FormData>({
    enableReinitialize: true,
    initialValues: {
      name: user?.name || "",
      email: user?.email || "",
      phoneNumber: "",
      university: "",
      degree: "",
      gpa: "",
      country: "",
      subject: "",
      topics: [],
      quizSummary: null,
      certificate: null,
      profilePicture: null,
    },
    validationSchema: validationSchema[currentStep - 1],
    onSubmit: async (values) => {
      setIsSubmitting(true);
      setErrorMessage("");

      try {
        if (currentStep === 1) {
          // Check if user can apply for this subject
          if (values.subject) {
            try {
              const canApplyResponse = await fetch(
                `${
                  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
                }/api/tutor/can-apply/${encodeURIComponent(values.subject)}`,
                {
                  credentials: "include",
                  headers: {
                    Accept: "application/json",
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
              console.error("Error checking application eligibility:", error);
              // Continue with the process if check fails
            }
          }

          setTempFormData(values);
          setQuizLoading(true);

          console.log("Generating quiz for:", values.subject, values.topics);

          try {
            const response = await generateQuiz({
              subject: values.subject,
              topics: values.topics,
            }).unwrap();

            if (response?.data?.questions) {
              setQuizQuestions(response.data.questions);
              setCurrentStep(2);
            } else {
              throw new Error(
                "Failed to generate quiz - no questions received"
              );
            }
          } catch (quizError) {
            console.error("Quiz generation error:", quizError);
            setErrorMessage("Failed to generate quiz. Please try again.");
          }
        }
      } catch (error) {
        console.error("Error:", error);
        setErrorMessage("An error occurred. Please try again.");
      } finally {
        setIsSubmitting(false);
        setQuizLoading(false);
      }
    },
  });

  const handleFinalSubmit = async (quizSummary: QuizSummary) => {
    if (applicationSubmitted || isSubmitting || !tempFormData) {
      console.log("Application already submitted or in progress, skipping...");
      return;
    }

    try {
      console.log("Starting application submission...");
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

      console.log("Submitting application data:", applicationData);

      const response = await submitApplication(applicationData).unwrap();

      if (response.status === "success") {
        console.log("Application submitted successfully:", response);
        setCurrentStep(3);
      } else {
        throw new Error(response.message || "Failed to submit application");
      }
    } catch (error: any) {
      console.error("Failed to submit application:", error);
      setErrorMessage(
        error.data?.message || error.message || "Failed to submit application"
      );
      setApplicationSubmitted(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (userData && userSuccess) {
      setUser(userData.user);
    }
  }, [userData, userSuccess]);

  useEffect(() => {
    if (applicationData && applicationSuccess) {
      setExistingApplication(applicationData.application);
      // If user has an existing application, show approval summary first
      setCurrentStep(3);
    }
  }, [applicationData, applicationSuccess]);

  useEffect(() => {
    if (currentStep === 3 && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (currentStep === 3 && countdown === 0) {
      router.push("/user/dashboard");
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
    router
  };
};
