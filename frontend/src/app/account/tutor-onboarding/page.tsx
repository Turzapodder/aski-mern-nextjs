"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import * as Yup from "yup";
import { useFormik } from "formik";
import {
  UserRoundPen,
  BookOpenCheck,
  CircleCheck,
  PhoneIncoming,
  Rabbit,
} from "lucide-react";
import MultiSelect from "@/components/MultiSelect";
import Quiz from "@/components/Quiz";
import { subjectTopics } from "@/lib/constants";
import { useGetUserQuery, useGenerateQuizMutation } from "@/lib/services/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
    fullName: Yup.string().required("First name is required"),
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
  }),
  // Step 2 & 3
  Yup.object({}),
  Yup.object({}),
];

export default function TutorOnboarding() {
  const router = useRouter();
  const [user, setUser] = useState<any>({
    name: "",
    email: "",
    is_verified: false,
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [quizLoading, setQuizLoading] = useState(false);
  const [tempFormData, setTempFormData] = useState<any>(null);
  const [generateQuiz] = useGenerateQuizMutation();
  const { data, isSuccess } = useGetUserQuery();
  const [countdown, setCountdown] = useState(30);
  const [showSubmit, setShowSubmit] = useState(true);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      fullName: user?.name || "",
      email: user?.email || "",
      phoneNumber: "",
      university: "", // Changed from streetAddress
      degree: "", // Added new field
      gpa: "", // Added new field
      country: "", // This will be used for country
      subject: "",
      topics: [],
      quizSummary: null,
      certificate: null as File | null,
      profilePicture: null as File | null,
    },
    validationSchema: validationSchema[currentStep - 1],
    validate: (values) => {
      const errors = {};
      try {
        validationSchema[currentStep - 1].validateSync(values, {
          abortEarly: false,
        });
      } catch (err: any) {
        console.log("Validation errors:", err.errors);
      }
      return errors;
    },
    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        console.log("Form submitted:", values); // Debug log
        if (currentStep === 1) {
          setTempFormData(values);
          setQuizLoading(true);

          console.log("Generating quiz for:", values.subject, values.topics); // Debug log
          const response = await generateQuiz({
            subject: values.subject,
            topics: values.topics,
          }).unwrap();

          if (response) {
            setQuizQuestions(response.data.questions);
            setCurrentStep(2);
          } else {
            throw new Error("Failed to generate quiz");
          }
        } else if (currentStep === 3) {
          // Demo function to show all data
          handleFinalSubmit(values);
        }

        setCurrentStep(currentStep + 1);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsSubmitting(false);
        setQuizLoading(false);
      }
    },
  });

  const handleFinalSubmit = (values: any) => {
    const finalData = {
      personalInfo: {
        ...tempFormData,
        // Include any updated fields from the current values
        fullName: values.fullName,
        email: values.email,
        phoneNumber: values.phoneNumber,
        university: values.university,
        degree: values.degree,
        gpa: values.gpa,
        country: values.country,
        subject: values.subject,
        topics: values.topics,
      },
      quizSummary: values.quizSummary,
      submittedAt: new Date().toISOString(),
    };

    console.log("Final Application Data:", finalData);
  };

  useEffect(() => {
    if (data && isSuccess) {
      setUser(data.user);
      // if (data.user.onboardingStatus === "pending") {
      //   setCurrentStep(3);
      //   setShowSubmit(false);
      // }
    }
  }, [data, isSuccess]);

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

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full name*
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.fullName}
                    className="w-full px-4 py-2 border border-gray-300 rounded-[15px] focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  {formik.touched.fullName && formik.errors.fullName && (
                    <div className="text-red-500 text-sm mt-1">
                      {typeof formik.errors.fullName === "string"
                        ? formik.errors.fullName
                        : ""}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email*
                  </label>
                  <input
                    type="email"
                    name="email"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.email}
                    className="w-full px-4 py-2 border border-gray-300 rounded-[15px] focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  {formik.touched.email && formik.errors.email && (
                    <div className="text-red-500 text-sm mt-1">
                      {typeof formik.errors.email === "string"
                        ? formik.errors.email
                        : ""}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    name="phoneNumber"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.phoneNumber}
                    className="w-full px-4 py-2 border border-gray-300 rounded-[15px] focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="md:col-span-1">
                <div className="flex flex-col items-center">
                  {formik.values.profilePicture ? (
                    <div className="flex flex-col items-center space-y-3">
                      <div className="w-32 h-32 rounded-full overflow-hidden bg-yellow-400">
                        <img
                          src={URL.createObjectURL(
                            formik.values.profilePicture
                          )}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const fileInput = document.getElementById(
                            "profile-upload"
                          ) as HTMLInputElement;
                          if (fileInput) fileInput.click();
                        }}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-full text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Upload new photo
                      </button>
                      <p className="text-xs text-gray-500">
                        At least 800×800 px recommended.
                        <br />
                        JPG or PNG is allowed
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center space-y-3">
                      <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-gray-300">
                        <div className="w-full h-full flex items-center justify-center">
                          {formik.values.fullName ? (
                            <span className="text-5xl font-bold text-black">
                              {formik.values.fullName.charAt(0).toUpperCase()}
                            </span>
                          ) : (
                            <span className="text-black">
                              <Rabbit className="h-8 w-8" />
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const fileInput = document.getElementById(
                            "profile-upload"
                          ) as HTMLInputElement;
                          if (fileInput) fileInput.click();
                        }}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-full text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Upload new photo
                      </button>
                      <p className="text-xs text-gray-500 text-center">
                        At least 800×800 px recommended.
                        <br />
                        JPG or PNG is allowed
                      </p>
                    </div>
                  )}
                  <input
                    id="profile-upload"
                    name="profilePicture"
                    type="file"
                    className="sr-only"
                    accept=".jpg,.jpeg,.png"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                University or School Name*
              </label>
              <input
                type="text"
                name="university" // Changed from streetAddress
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.university}
                className="w-full px-4 py-2 border border-gray-300 rounded-[15px] focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Degree/Class*
                </label>
                <input
                  type="text"
                  name="degree" // Changed from streetAddress
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.degree}
                  className="w-full px-4 py-2 border border-gray-300 rounded-[15px] focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current GPA/Result*
                </label>
                <input
                  type="text"
                  name="gpa" // Changed from streetAddress
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.gpa}
                  className="w-full px-4 py-2 border border-gray-300 rounded-[15px] focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country*
              </label>
              <input
                type="text"
                name="country"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.country}
                className="w-full px-4 py-2 border border-gray-300 rounded-[15px] focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Choose Subject*
                </label>
                <select
                  name="subject"
                  value={formik.values.subject}
                  onChange={(e) => {
                    formik.setFieldValue("subject", e.target.value);
                    formik.setFieldValue("topics", []);
                  }}
                  onBlur={formik.handleBlur}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-600 focus:border-primary-300 focus:outline-none focus:ring-1 focus:ring-primary-300"
                >
                  <option value="">Select a subject</option>
                  {Object.keys(subjectTopics).map((subject) => (
                    <option key={subject} value={subject}>
                      {subject.charAt(0).toUpperCase() + subject.slice(1)}
                    </option>
                  ))}
                </select>
                {formik.touched.subject && formik.errors.subject && (
                  <div className="text-red-500 text-sm mt-1">
                    {formik.errors.subject}
                  </div>
                )}
              </div>

              {formik.values.subject && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2 mt-5">
                    Select Topics*
                  </label>
                  <MultiSelect
                    options={
                      subjectTopics[
                        formik.values.subject as keyof typeof subjectTopics
                      ]
                    }
                    placeholder="Choose topics"
                    onChange={(selected) => {
                      formik.setFieldValue("topics", selected);
                    }}
                  />
                  {formik.touched.topics && formik.errors.topics && (
                    <div className="text-red-500 text-sm mt-1">
                      {formik.errors.topics}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Education Certificate
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  {formik.values.certificate ? (
                    <div className="text-sm text-gray-600">
                      <p>Selected file: {formik.values.certificate.name}</p>
                      <button
                        type="button"
                        onClick={() =>
                          formik.setFieldValue("certificate", null)
                        }
                        className="text-red-500 hover:text-red-700 mt-2"
                      >
                        Remove file
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-col items-center justify-center">
                        <svg
                          className="mx-auto h-6 w-6 text-gray-400"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                          />
                        </svg>
                        <div className="mt-2 text-center">
                          <p className="text-md font-medium text-black">
                            Choose a file or drag & drop it here.
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            JPEG, PNG, PDF, and WEBP formats, up to 10 MB.
                          </p>
                        </div>
                        <button
                          type="button"
                          className="mt-4 px-4 py-2 bg-white border border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
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
                          id="file-upload"
                          type="file"
                          className="sr-only"
                          accept=".pdf,.jpg,.jpeg,.png,.webp"
                          onChange={(event) => {
                            const file = event.currentTarget.files?.[0];
                            if (file) {
                              if (file.size <= 10 * 1024 * 1024) {
                                formik.setFieldValue("certificate", file);
                              } else {
                                alert("File size should be less than 50MB");
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
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-300"></div>
          </div>
        ) : (
          <Quiz
            subject={formik.values.subject}
            topics={formik.values.topics}
            questions={quizQuestions}
            onComplete={(quizSummary) => {
              // Store the complete quiz summary object instead of just the score
              formik.setFieldValue("quizSummary", quizSummary);

              // Log the updated form data with quiz summary
              console.log("Quiz completed with summary:", quizSummary);
              console.log("Updated form data:", {
                ...formik.values,
                quizSummary: quizSummary,
              });

              setCurrentStep(3);
            }}
          />
        );
      case 3:
        return (
          <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center">
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

            <h2 className="text-3xl font-bold mb-4">
              Thank you for the request, we'll get in contact within 1 hour.
            </h2>

            <p className="text-gray-600 mb-8 max-w-2xl">
              Our team will verify your application and credentials. You'll
              receive an email confirmation shortly with next steps for your
              tutor onboarding process.
            </p>

            <div className="mt-4">
              <Link
                href="/"
                className="px-6 py-3 bg-primary-500 text-white font-medium rounded-lg hover:bg-black transition-colors"
              >
                Check your inbox{" "}
                {countdown > 0 && `(Redirecting in ${countdown}s)`}
              </Link>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-full w-4-xl h-[800px] bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="flex h-full">
          <div className="w-80 bg-gray-50 p-8 flex-shrink-0">
            <Image
              src={"/assets/main-logo.svg"}
              width={100}
              alt={"Site Logo"}
              height={70}
            />
            <div className="space-y-4">
              {steps.map((step, index) => (
                <div key={step.id} className="relative">
                  <div
                    className={`flex items-center space-x-3 pt-4 ${
                      step.id === currentStep
                        ? "text-primary-950"
                        : step.id < currentStep
                        ? "text-primary-950"
                        : "text-gray-400"
                    }`}
                  >
                    <step.icon className="h-6 w-6 z-10 relative" />
                    <div>
                      <p className="font-medium">{step.title}</p>
                      <p className="text-xs">{step.description}</p>
                    </div>
                  </div>

                  {/* Vertical separator line */}
                  {index < steps.length - 1 && (
                    <div className="absolute left-3 w-0.5 h-[25px] -ml-[1px]  bg-gray-300"></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          
            <div className="flex-1 border-t-[2rem] border-b-[2rem] border-l-[2rem] border-r-[10px]  border-white overflow-y-auto">
              <form onSubmit={formik.handleSubmit} className="pr-6">
                <h2 className="text-2xl font-bold mb-6">
                  {steps[currentStep - 1].title}
                </h2>
                {renderStepContent()}
                <div className="mt-6 sticky bottom-0 bg-white py-4">
                  {currentStep !== 2 && showSubmit && (
                    <button
                      type="submit"
                      disabled={
                        isSubmitting || (currentStep === 1 && !formik.isValid)
                      }
                      className="w-full bg-primary-500 text-white rounded-lg px-4 py-2 hover:bg-primary-950 hover:text-white disabled:bg-primary-950 disabled:cursor-not-allowed"
                    >
                      {isSubmitting
                        ? "Processing..."
                        : currentStep === 3
                        ? "Submit Application"
                        : "Confirm"}
                    </button>
                  )}
                </div>
              </form>
            </div>
        </div>
      </div>
    </div>
  );
}
