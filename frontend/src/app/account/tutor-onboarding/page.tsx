"use client";
import { useEffect, useState } from "react";
import * as Yup from "yup";
import { useFormik } from "formik";
import { UserRoundPen, BookOpenCheck, CircleCheck, Rabbit } from "lucide-react";
import MultiSelect from "@/components/MultiSelect";
import Quiz from "@/components/Quiz";
import { subjectTopics } from "@/lib/constants";
import { useGetUserQuery, useGenerateQuizMutation } from "@/lib/services/auth";
import {
  useSubmitTutorApplicationMutation,
  useGetTutorApplicationStatusQuery,
} from "@/lib/services/tutor";
import { useRouter } from "next/navigation";
import { countries } from "countries-list";

// Define proper types
interface User {
  name: string;
  email: string;
  is_verified: boolean;
}

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  topic: string;
}

interface QuizSummary {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  timeSpent: number;
  topicPerformance: Record<string, any>;
  answers?: any[];
}

interface FormData {
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

const steps = [
  {
    id: 1,
    title: "Personal Info",
    description: "Tell us about yourself",
    icon: UserRoundPen,
  },
  {
    id: 2,
    title: "Take a little Quiz",
    description: "Prove how smart you are",
    icon: BookOpenCheck,
  },
  {
    id: 3,
    title: "Approval Summary",
    description: "You are almost done!",
    icon: CircleCheck,
  },
];

const validationSchema = [
  // Step 1
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
  // Step 2 & 3
  Yup.object({}),
  Yup.object({}),
];

export default function TutorOnboarding() {
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
  const countryList = Object.values(countries).map((c: any) => c.name).sort();



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
      router.push("/");
    }
  }, [currentStep, countdown, router]);

  const getSubjectTopics = (subject: string): string[] => {
    const topics = subjectTopics as Record<string, string[]>;
    return topics[subject] || [];
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className='space-y-4'>
            {errorMessage && (
              <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md'>
                {errorMessage}
              </div>
            )}

            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              <div className='md:col-span-2 space-y-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Full name*
                  </label>
                  <input
                    type='text'
                    name='name'
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.name}
                    className='w-full px-4 py-2 border border-gray-300 rounded-[15px] focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                  />
                  {formik.touched.name && formik.errors.name && (
                    <div className='text-red-500 text-sm mt-1'>
                      {formik.errors.name}
                    </div>
                  )}
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Email*
                  </label>
                  <input
                    type='email'
                    name='email'
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.email}
                    className='w-full px-4 py-2 border border-gray-300 rounded-[15px] focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                  />
                  {formik.touched.email && formik.errors.email && (
                    <div className='text-red-500 text-sm mt-1'>
                      {formik.errors.email}
                    </div>
                  )}
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Phone Number*
                  </label>
                  <input
                    type='text'
                    name='phoneNumber'
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.phoneNumber}
                    className='w-full px-4 py-2 border border-gray-300 rounded-[15px] focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                  />
                  {formik.touched.phoneNumber && formik.errors.phoneNumber && (
                    <div className='text-red-500 text-sm mt-1'>
                      {formik.errors.phoneNumber}
                    </div>
                  )}
                </div>
              </div>

              <div className='md:col-span-1'>
                <div className='flex flex-col items-center'>
                  {formik.values.profilePicture ? (
                    <div className='flex flex-col items-center space-y-3'>
                      <div className='w-32 h-32 rounded-full overflow-hidden bg-yellow-400'>
                        <img
                          src={URL.createObjectURL(
                            formik.values.profilePicture
                          )}
                          alt='Profile'
                          className='w-full h-full object-cover'
                        />
                      </div>
                      <button
                        type='button'
                        onClick={() => {
                          const fileInput = document.getElementById(
                            "profile-upload"
                          ) as HTMLInputElement;
                          if (fileInput) fileInput.click();
                        }}
                        className='inline-flex items-center px-4 py-2 border border-gray-300 rounded-full text-sm font-medium text-gray-700 bg-white hover:bg-gray-50'
                      >
                        Upload new photo
                      </button>
                      <p className='text-xs text-gray-500'>
                        At least 800×800 px recommended.
                        <br />
                        JPG or PNG is allowed
                      </p>
                    </div>
                  ) : (
                    <div className='flex flex-col items-center space-y-3'>
                      <div className='w-32 h-32 rounded-full overflow-hidden border-2 border-gray-300'>
                        <div className='w-full h-full flex items-center justify-center'>
                          {formik.values.name ? (
                            <span className='text-5xl font-bold text-black'>
                              {formik.values.name.charAt(0).toUpperCase()}
                            </span>
                          ) : (
                            <span className='text-black'>
                              <Rabbit className='h-8 w-8' />
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        type='button'
                        onClick={() => {
                          const fileInput = document.getElementById(
                            "profile-upload"
                          ) as HTMLInputElement;
                          if (fileInput) fileInput.click();
                        }}
                        className='inline-flex items-center px-4 py-2 border border-gray-300 rounded-full text-sm font-medium text-gray-700 bg-white hover:bg-gray-50'
                      >
                        Upload new photo
                      </button>
                      <p className='text-xs text-gray-500 text-center'>
                        At least 800×800 px recommended.
                        <br />
                        JPG or PNG is allowed
                      </p>
                    </div>
                  )}
                  <input
                    id='profile-upload'
                    name='profilePicture'
                    type='file'
                    className='sr-only'
                    accept='.jpg,.jpeg,.png'
                    onChange={(event) => {
                      const file = event.currentTarget.files?.[0];
                      if (file) {
                        if (
                          file.type === "image/jpeg" ||
                          file.type === "image/png"
                        ) {
                          formik.setFieldValue("profilePicture", file);
                        } else {
                          alert("Only JPG or PNG files are allowed");
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                University or School Name*
              </label>
              <input
                type='text'
                name='university'
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.university}
                className='w-full px-4 py-2 border border-gray-300 rounded-[15px] focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
              />
              {formik.touched.university && formik.errors.university && (
                <div className='text-red-500 text-sm mt-1'>
                  {formik.errors.university}
                </div>
              )}
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Current Degree/Class*
                </label>
                <input
                  type='text'
                  name='degree'
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.degree}
                  className='w-full px-4 py-2 border border-gray-300 rounded-[15px] focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                />
                {formik.touched.degree && formik.errors.degree && (
                  <div className='text-red-500 text-sm mt-1'>
                    {formik.errors.degree}
                  </div>
                )}
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Current GPA/Result*
                </label>
                <input
                  type='text'
                  name='gpa'
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.gpa}
                  className='w-full px-4 py-2 border border-gray-300 rounded-[15px] focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                />
                {formik.touched.gpa && formik.errors.gpa && (
                  <div className='text-red-500 text-sm mt-1'>
                    {formik.errors.gpa}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Country*
              </label>
              <select
                name='country'
                onChange={(e) => {
                  formik.handleChange(e);
                }}
                onBlur={formik.handleBlur}
                value={formik.values.country}
                className='w-full px-4 py-2 border border-gray-300 rounded-[15px] focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white'
              >
                <option value=''>Select a country</option>
                {countryList.map((country: string) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
              {formik.touched.country && formik.errors.country && (
                <div className='text-red-500 text-sm mt-1'>
                  {formik.errors.country}
                </div>
              )}
            </div>

            <div>
              <div>
                <label className='block text-sm font-medium text-gray-600 mb-2'>
                  Choose Subject*
                </label>
                <select
                  name='subject'
                  value={formik.values.subject}
                  onChange={(e) => {
                    formik.setFieldValue("subject", e.target.value);
                    formik.setFieldValue("topics", []);
                    setErrorMessage(""); // Clear error when subject changes
                  }}
                  onBlur={formik.handleBlur}
                  className='w-full rounded-md border border-gray-300 px-3 py-2 text-gray-600 focus:border-primary-300 focus:outline-none focus:ring-1 focus:ring-primary-300'
                >
                  <option value=''>Select a subject</option>
                  {Object.keys(subjectTopics).map((subject) => (
                    <option key={subject} value={subject}>
                      {subject.charAt(0).toUpperCase() + subject.slice(1)}
                    </option>
                  ))}
                </select>
                {formik.touched.subject && formik.errors.subject && (
                  <div className='text-red-500 text-sm mt-1'>
                    {formik.errors.subject}
                  </div>
                )}
              </div>

              {formik.values.subject && (
                <div>
                  <label className='block text-sm font-medium text-gray-600 mb-2 mt-5'>
                    Select Topics*
                  </label>
                  <MultiSelect
                    options={getSubjectTopics(formik.values.subject)}
                    placeholder='Choose topics'
                    onChange={(selected) => {
                      formik.setFieldValue("topics", selected);
                    }}
                  />
                  {formik.touched.topics && formik.errors.topics && (
                    <div className='text-red-500 text-sm mt-1'>
                      {formik.errors.topics}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Last Education Certificate (Optional)
              </label>
              <div className='mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md'>
                <div className='space-y-1 text-center'>
                  {formik.values.certificate ? (
                    <div className='text-sm text-gray-600'>
                      <p>Selected file: {formik.values.certificate.name}</p>
                      <button
                        type='button'
                        onClick={() =>
                          formik.setFieldValue("certificate", null)
                        }
                        className='text-red-500 hover:text-red-700 mt-2'
                      >
                        Remove file
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className='flex flex-col items-center justify-center'>
                        <svg
                          className='mx-auto h-6 w-6 text-gray-400'
                          stroke='currentColor'
                          fill='none'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth='2'
                            d='M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12'
                          />
                        </svg>
                        <div className='mt-2 text-center'>
                          <p className='text-md font-medium text-black'>
                            Choose a file or drag & drop it here.
                          </p>
                          <p className='text-xs text-gray-500 mt-1'>
                            JPEG, PNG, PDF, and WEBP formats, up to 10 MB.
                          </p>
                        </div>
                        <button
                          type='button'
                          className='mt-4 px-4 py-2 bg-white border border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none'
                          onClick={() => {
                            const fileInput = document.getElementById(
                              "file-upload"
                            ) as HTMLInputElement;
                            if (fileInput) fileInput.click();
                          }}
                        >
                          Browse File
                        </button>
                        <input
                          id='file-upload'
                          type='file'
                          className='sr-only'
                          accept='.pdf,.jpg,.jpeg,.png,.webp'
                          onChange={(event) => {
                            const file = event.currentTarget.files?.[0];
                            if (file) {
                              if (file.size <= 10 * 1024 * 1024) {
                                formik.setFieldValue("certificate", file);
                              } else {
                                alert("File size should be less than 10MB");
                              }
                            }
                          }}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      case 2:
        return quizLoading ? (
          <div className='flex flex-col items-center justify-center py-20'>
            <div className='animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-300'></div>
            <p className='mt-4 text-gray-600'>Generating quiz questions...</p>
          </div>
        ) : (
          <div className='space-y-4'>
            {isSubmitting && (
              <div className='bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-md text-center'>
                Submitting your application... Please wait.
              </div>
            )}
            <Quiz
              subject={formik.values.subject}
              topics={formik.values.topics}
              questions={quizQuestions}
              onComplete={(quizSummary: QuizSummary) => {
                console.log("Quiz completed with summary:", quizSummary);
                if (!isSubmitting && !applicationSubmitted) {
                  handleFinalSubmit(quizSummary);
                }
              }}
            />
          </div>
        );
      case 3:
        // If there's an existing application, show approval summary
        if (existingApplication) {
          const getStatusColor = (status: string) => {
            switch (status) {
              case "pending":
                return "text-yellow-600 bg-yellow-100";
              case "under_review":
                return "text-blue-600 bg-blue-100";
              case "approved":
                return "text-green-600 bg-green-100";
              case "rejected":
                return "text-red-600 bg-red-100";
              default:
                return "text-gray-600 bg-gray-100";
            }
          };

          const getStatusIcon = (status: string) => {
            switch (status) {
              case "pending":
                return "⏳";
              case "under_review":
                return "👀";
              case "approved":
                return "✅";
              case "rejected":
                return "❌";
              default:
                return "📋";
            }
          };

          return (
            <div className='min-h-[400px] p-8'>
              <div className='max-w-2xl mx-auto'>
                <div className='text-center mb-8'>
                  <div className='text-6xl mb-4'>
                    {getStatusIcon(existingApplication.applicationStatus)}
                  </div>
                  <h2 className='text-3xl font-bold mb-4'>
                    Application Status
                  </h2>
                  <div
                    className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(
                      existingApplication.applicationStatus
                    )}`}
                  >
                    {existingApplication.applicationStatus
                      .charAt(0)
                      .toUpperCase() +
                      existingApplication.applicationStatus
                        .slice(1)
                        .replace("_", " ")}
                  </div>
                </div>

                <div className='bg-gray-50 rounded-lg p-6 mb-6'>
                  <h3 className='text-lg font-semibold mb-4'>
                    Application Details
                  </h3>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                      <p className='text-sm text-gray-600'>Subject</p>
                      <p className='font-medium'>
                        {existingApplication.academicInfo?.subject || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className='text-sm text-gray-600'>Topics</p>
                      <p className='font-medium'>
                        {existingApplication.academicInfo?.topics?.join(", ") ||
                          "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className='text-sm text-gray-600'>Submitted</p>
                      <p className='font-medium'>
                        {new Date(
                          existingApplication.createdAt
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className='text-sm text-gray-600'>Application ID</p>
                      <p className='font-medium text-xs'>
                        {existingApplication._id}
                      </p>
                    </div>
                  </div>
                </div>

                {/* {existingApplication.quizResult && (
                  <div className="bg-gray-50 rounded-lg p-6 mb-6">
                    <h3 className="text-lg font-semibold mb-4">Quiz Results</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-primary-600">{existingApplication.quizResult.score}</p>
                        <p className="text-sm text-gray-600">Score</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-primary-600">{existingApplication.quizResult.percentage}%</p>
                        <p className="text-sm text-gray-600">Percentage</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-primary-600">{existingApplication.quizResult.totalQuestions}</p>
                        <p className="text-sm text-gray-600">Total Questions</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-primary-600">{Math.floor(existingApplication.quizResult.timeSpent / 60)}m</p>
                        <p className="text-sm text-gray-600">Time Spent</p>
                      </div>
                    </div>
                  </div>
                )} */}

                <div className='text-center'>
                  {existingApplication.applicationStatus === "pending" && (
                    <p className='text-gray-600 mb-4'>
                      Your application is being reviewed. We'll contact you
                      within 24-48 hours with an update.
                    </p>
                  )}
                  {existingApplication.applicationStatus === "under_review" && (
                    <p className='text-gray-600 mb-4'>
                      Your application is currently under detailed review. We'll
                      notify you once the review is complete.
                    </p>
                  )}
                  {existingApplication.applicationStatus === "approved" && (
                    <p className='text-green-600 mb-4'>
                      Congratulations! Your application has been approved.
                      Welcome to our tutor community!
                    </p>
                  )}
                  {existingApplication.applicationStatus === "rejected" && (
                    <p className='text-red-600 mb-4'>
                      Unfortunately, your application was not approved at this
                      time. You may reapply after 30 days.
                    </p>
                  )}

                  <button
                    onClick={() => router.push("/")}
                    className='px-6 py-3 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition-colors'
                  >
                    Go to Dashboard
                  </button>
                </div>
              </div>
            </div>
          );
        }

        // Default success message for new applications
        return (
          <div className='min-h-[400px] flex flex-col items-center justify-center p-8 text-center'>
            <div className='bg-primary-500 rounded-full p-5 mb-6'>
              <svg
                className='w-10 h-10 text-white'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='3'
                  d='M5 13l4 4L19 7'
                ></path>
              </svg>
            </div>

            <h2 className='text-3xl font-bold mb-4'>
              Thank you for the request, we'll get in contact within 1 hour.
            </h2>

            <p className='text-gray-600 mb-8 max-w-2xl'>
              Our team will verify your application and credentials. You'll
              receive an email confirmation shortly with next steps for your
              tutor onboarding process.
            </p>

            <div className='mt-4'>
              <button
                onClick={() => router.push("/")}
                className='px-6 py-3 bg-primary-500 text-white font-medium rounded-lg hover:bg-black transition-colors'
              >
                Check your inbox{" "}
                {countdown > 0 && `(Redirecting in ${countdown}s)`}
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className='min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-full w-4-xl h-[800px] bg-white rounded-lg shadow-lg overflow-hidden'>
        <div className='flex h-full'>
          <div className='w-80 bg-gray-50 p-8 flex-shrink-0'>
            <div className='mb-8'>
              <h1 className='text-2xl font-bold'>Tutor Application</h1>
            </div>
            <div className='space-y-4'>
              {steps.map((step, index) => (
                <div key={step.id} className='relative'>
                  <div
                    className={`flex items-center space-x-3 pt-4 ${
                      step.id === currentStep
                      ? "text-primary-950"
                      : step.id < currentStep
                        ? "text-primary-950"
                        : "text-gray-400"
                      }`}
                  >
                    <step.icon className='h-6 w-6 z-10 relative' />
                    <div>
                      <p className='font-medium'>{step.title}</p>
                      <p className='text-xs'>{step.description}</p>
                    </div>
                  </div>

                  {index < steps.length - 1 && (
                    <div className='absolute left-3 w-0.5 h-[25px] -ml-[1px] bg-gray-300'></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className='flex-1 border-t-[2rem] border-b-[2rem] border-l-[2rem] border-r-[10px] border-white overflow-y-auto'>
            <form onSubmit={formik.handleSubmit} className='pr-6'>
              <h2 className='text-2xl font-bold mb-6'>
                {steps[currentStep - 1]?.title}
              </h2>
              {renderStepContent()}
              {!existingApplication && (
                <div className='mt-6 sticky bottom-0 bg-white py-4'>
                  {currentStep !== 2 && showSubmit && !applicationSubmitted && (
                    <button
                      type='submit'
                      disabled={
                        isSubmitting || (currentStep === 1 && !formik.isValid)
                      }
                      className='w-full bg-primary-500 text-white rounded-lg px-4 py-2 hover:bg-primary-950 hover:text-white disabled:bg-gray-400 disabled:cursor-not-allowed'
                    >
                      {isSubmitting
                        ? "Processing..."
                        : currentStep === 3
                          ? "Submit Application"
                          : "Continue to Quiz"}
                    </button>
                  )}
                  {errorMessage && currentStep === 1 && (
                    <div className='mt-2 text-red-600 text-sm text-center'>
                      {errorMessage}
                    </div>
                  )}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
