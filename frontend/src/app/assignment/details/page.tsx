"use client";
import { useSearchParams, useRouter } from "next/navigation";
import {
  MapPin,
  Clock,
  Star,
  Flag,
  Heart,
  Copy,
  FileText,
  Send,
  CheckCircle,
  MessageSquare,
  CreditCard,
  Award,
} from "lucide-react";
import { useState } from "react";
import ProposalsComponent from "@/components/ProposalsComponent";
import TutorProposalsComponent from "@/components/TutorProposalsComponent";
import PaymentComponent from "@/components/PaymentComponent";
import CompletionFeedbackComponent from "@/components/CompletionFeedbackComponent";
import TopNavbar from "@/components/TopNavbar";

const AssignmentDetails = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id");
  const [showProposal, setShowProposal] = useState(false);
  const [proposal, setProposal] = useState("");
  const [budget, setBudget] = useState("");

  // State to track which step is active
  const [activeStep, setActiveStep] = useState<string>("details");
  const [progressWidth, setProgressWidth] = useState<string>("25%");

  const handleSendProposal = () => {
    // Scroll to bottom of the page where proposal component will be shown
    setShowProposal(true);

    // Scroll to the bottom of the page after a short delay to ensure the component is rendered
    setTimeout(() => {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth",
      });
    }, 100);
  };

  const submitProposal = () => {
    console.log("Proposal submitted:", { proposal, budget });
    // Handle proposal submission
    alert("Proposal submitted successfully!");
    setProposal("");
    setBudget("");
    setShowProposal(false);
    // Move to payment step
    setActiveStep("payment");
    setProgressWidth("50%");
  };

  const handlePaymentComplete = () => {
    // Move to completion step
    setActiveStep("completion");
    setProgressWidth("75%");
  };

  const handleFeedbackSubmit = (rating: number, feedback: string) => {
    console.log("Feedback submitted:", { rating, feedback });
    alert("Thank you for your feedback!");
    setProgressWidth("100%");
  };

  return (
    <div className='w-full mx-auto'>
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
        {/* Left Column - Main Content */}
        <div className='lg:col-span-2 space-y-6'>
          {/* Header */}
          <div className='bg-white rounded-lg p-6 shadow-sm'>
            <div className='flex items-start justify-between mb-4'>
              <div className='flex-1'>
                <h1 className='text-2xl font-bold text-gray-900 mb-2'>
                  Calculus II - Integration by Parts Assignment
                </h1>
                <div className='flex items-center space-x-4 text-sm text-gray-600'>
                  <div className='flex items-center space-x-1'>
                    <Clock size={16} />
                    <span>Due in 3 days</span>
                  </div>
                  <div className='flex items-center space-x-1'>
                    <MapPin size={16} />
                    <span>United International University</span>
                  </div>
                </div>
              </div>
              <div className='flex space-x-2'>
                <button className='bg-primary-300 hover:bg-primary-600 text-white px-6 py-2 rounded-lg font-medium transition-colors'>
                  Submit Solution
                </button>

                <button className='border border-primary-300 text-primary-300 hover:bg-primary-50 px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2'>
                  <Heart size={16} />
                </button>
              </div>
            </div>

            <div className='text-sm text-gray-600 mb-4 flex items-center'>
              <span className='text-primary-300 font-medium'>
                Report assignment issue
              </span>{" "}
              <button className='text-gray-400 hover:text-gray-600 p-2'>
                <Flag size={16} />
              </button>
            </div>

            {/* Assignment Timeline */}
            <div className='mt-6 pt-4 border-t border-gray-200'>
              <h3 className='text-sm font-medium text-gray-700 mb-4'>
                Assignment Progress
              </h3>
              <div className='relative'>
                {/* Timeline Track */}
                <div className='absolute top-5 left-0 right-0 h-1.5 bg-gray-200 z-0'>
                  {/* Completed Progress */}
                  <div
                    className='absolute top-0 left-0 h-full bg-primary-500'
                    style={{ width: progressWidth }}
                  ></div>
                </div>

                {/* Timeline Steps */}
                <div className='relative z-10 flex justify-between'>
                  {/* Step 1: Details */}
                  <div
                    className='flex flex-col items-center w-24 cursor-pointer'
                    onClick={() => {
                      setActiveStep("details");
                      setProgressWidth("25%");
                    }}
                  >
                    <div
                      className={`w-10 h-10 rounded-full ${
                        activeStep === "details" ||
                        activeStep === "proposals" ||
                        activeStep === "payment" ||
                        activeStep === "completion"
                          ? "bg-primary-500 text-white"
                          : "bg-white border border-gray-200 text-gray-400"
                      } flex items-center justify-center mb-2 shadow-md transition-colors`}
                    >
                      <CheckCircle size={18} />
                    </div>
                    <div
                      className={`text-xs font-medium ${
                        activeStep === "details"
                          ? "text-gray-900"
                          : "text-gray-700"
                      } text-center`}
                    >
                      Details
                    </div>
                    <div
                      className={`text-xs ${
                        activeStep === "details" ||
                        activeStep === "proposals" ||
                        activeStep === "payment" ||
                        activeStep === "completion"
                          ? "text-primary-300 font-medium"
                          : "text-gray-400"
                      }`}
                    >
                      Completed
                    </div>
                  </div>

                  {/* Step 2: Proposals */}
                  <div
                    className='flex flex-col items-center w-24 cursor-pointer'
                    onClick={() => {
                      setActiveStep("proposals");
                      setProgressWidth("25%");
                      setShowProposal(true);
                    }}
                  >
                    <div
                      className={`w-10 h-10 rounded-full ${
                        activeStep === "proposals"
                          ? "bg-white border-2 border-primary-500 text-primary-500"
                          : activeStep === "payment" ||
                            activeStep === "completion"
                          ? "bg-primary-500 text-white"
                          : "bg-white border border-gray-200 text-gray-400"
                      } flex items-center justify-center mb-2 shadow-sm transition-colors`}
                    >
                      <MessageSquare size={18} />
                    </div>
                    <div
                      className={`text-xs font-medium ${
                        activeStep === "proposals"
                          ? "text-gray-900"
                          : "text-gray-700"
                      } text-center`}
                    >
                      Proposals
                    </div>
                    <div
                      className={`text-xs ${
                        activeStep === "proposals"
                          ? "text-primary-300 font-medium"
                          : activeStep === "payment" ||
                            activeStep === "completion"
                          ? "text-primary-300 font-medium"
                          : "text-gray-400"
                      }`}
                    >
                      {activeStep === "proposals"
                        ? "In Progress"
                        : activeStep === "payment" ||
                          activeStep === "completion"
                        ? "Completed"
                        : "Pending"}
                    </div>
                  </div>

                  {/* Step 3: Payment */}
                  <div
                    className='flex flex-col items-center w-24 cursor-pointer'
                    onClick={() => {
                      setActiveStep("payment");
                      setProgressWidth("50%");
                    }}
                  >
                    <div
                      className={`w-10 h-10 rounded-full ${
                        activeStep === "payment"
                          ? "bg-white border-2 border-primary-500 text-primary-500"
                          : activeStep === "completion"
                          ? "bg-primary-500 text-white"
                          : "bg-white border border-gray-200 text-gray-400"
                      } flex items-center justify-center mb-2 shadow-sm transition-colors`}
                    >
                      <CreditCard size={18} />
                    </div>
                    <div
                      className={`text-xs font-medium ${
                        activeStep === "payment"
                          ? "text-gray-900"
                          : "text-gray-700"
                      } text-center`}
                    >
                      Payment
                    </div>
                    <div
                      className={`text-xs ${
                        activeStep === "payment"
                          ? "text-primary-300 font-medium"
                          : activeStep === "completion"
                          ? "text-primary-300 font-medium"
                          : "text-gray-400"
                      }`}
                    >
                      {activeStep === "payment"
                        ? "In Progress"
                        : activeStep === "completion"
                        ? "Completed"
                        : "Pending"}
                    </div>
                  </div>

                  {/* Step 4: Completion & Feedback */}
                  <div
                    className='flex flex-col items-center w-24 cursor-pointer'
                    onClick={() => {
                      setActiveStep("completion");
                      setProgressWidth("75%");
                    }}
                  >
                    <div
                      className={`w-10 h-10 rounded-full ${
                        activeStep === "completion"
                          ? "bg-white border-2 border-primary-500 text-primary-500"
                          : "bg-white border border-gray-200 text-gray-400"
                      } flex items-center justify-center mb-2 shadow-sm transition-colors`}
                    >
                      <Award size={18} />
                    </div>
                    <div
                      className={`text-xs font-medium ${
                        activeStep === "completion"
                          ? "text-gray-900"
                          : "text-gray-700"
                      } text-center`}
                    >
                      Completion & Feedback
                    </div>
                    <div
                      className={`text-xs ${
                        activeStep === "completion"
                          ? "text-primary-300 font-medium"
                          : "text-gray-400"
                      }`}
                    >
                      {activeStep === "completion" ? "In Progress" : "Pending"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Active Step Content */}
          {activeStep === "details" && (
            <div className='bg-white rounded-lg p-6 shadow-sm'>
              <h2 className='text-lg font-semibold text-gray-900 mb-4'>
                Problem Statement
              </h2>
              <p className='text-gray-700 leading-relaxed mb-4'>
                Solve the following integration problems using the integration
                by parts method. Show all steps clearly and provide detailed
                explanations for each solution.
              </p>
              <div className='bg-gray-50 rounded-lg p-4 mb-4'>
                <h3 className='font-semibold text-gray-900 mb-2'>Problem 1:</h3>
                <p className='text-gray-700 mb-2'>∫ x·e^x dx</p>

                <h3 className='font-semibold text-gray-900 mb-2 mt-4'>
                  Problem 2:
                </h3>
                <p className='text-gray-700 mb-2'>∫ x²·ln(x) dx</p>

                <h3 className='font-semibold text-gray-900 mb-2 mt-4'>
                  Problem 3:
                </h3>
                <p className='text-gray-700'>∫ x·sin(2x) dx</p>
              </div>
              <p className='text-gray-600 text-sm'>
                <strong>Note:</strong> Remember to use the LIATE rule for
                choosing u and dv, and verify your answers by differentiation.
              </p>
            </div>
          )}

          {/* We've moved the Proposals Component to the bottom of the page */}

          {/* Payment Component */}
          {activeStep === "payment" && (
            <PaymentComponent onPaymentComplete={handlePaymentComplete} />
          )}

          {/* Completion & Feedback Component */}
          {activeStep === "completion" && (
            <CompletionFeedbackComponent
              onSubmitFeedback={handleFeedbackSubmit}
            />
          )}

          {/* Only show these sections when in details view */}
          {activeStep === "details" && (
            <div className='bg-white rounded-lg p-6 shadow-sm mt-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className='flex items-center space-x-3'>
                  <div className='w-10 h-10 bg-secondary-100 rounded-lg flex items-center justify-center'>
                    <Star size={20} className='text-secondary-300' />
                  </div>
                  <div>
                    <div className='text-2xl font-bold text-gray-900'>
                      25 Points
                    </div>
                    <div className='text-sm text-gray-600'>Total marks</div>
                  </div>
                </div>

                <div className='flex items-center space-x-3'>
                  <div className='w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center'>
                    <Clock size={20} className='text-primary-300' />
                  </div>
                  <div>
                    <div className='text-lg font-semibold text-gray-900'>
                      Advanced Level
                    </div>
                    <div className='text-sm text-gray-600'>
                      Requires strong calculus foundation
                    </div>
                  </div>
                </div>
              </div>

              <div className='mt-6 pt-6 border-t border-gray-200'>
                <div className='text-sm text-gray-600'>
                  <span className='font-medium'>Assignment Type:</span>{" "}
                  Individual homework
                </div>
                <div className='text-sm text-gray-600 mt-1'>
                  <span className='font-medium'>Submission Format:</span> PDF
                  with handwritten solutions
                </div>
              </div>
            </div>
          )}

          {/* Required Knowledge - Only show in details view */}
          {activeStep === "details" && (
            <div className='bg-white rounded-lg p-6 shadow-sm mt-6'>
              <h2 className='text-lg font-semibold text-gray-900 mb-4'>
                Required Mathematical Concepts
              </h2>

              <div className='mb-6'>
                <h3 className='text-sm font-medium text-gray-700 mb-3'>
                  Prerequisites
                </h3>
                <div className='flex flex-wrap gap-2'>
                  {[
                    "Integration by Parts",
                    "LIATE Rule",
                    "Basic Integration",
                    "Differentiation",
                    "Exponential Functions",
                    "Logarithmic Functions",
                    "Trigonometric Functions",
                    "Product Rule",
                    "Chain Rule",
                    "Fundamental Theorem of Calculus",
                  ].map((concept, index) => (
                    <span
                      key={index}
                      className='px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm'
                    >
                      {concept}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Project Engagement - Only show in details view */}
          {activeStep === "details" && (
            <div className='bg-white rounded-lg p-6 shadow-sm mt-6'>
              <h2 className='text-lg font-semibold text-gray-900 mb-4'>
                Project Activity
              </h2>

              <div className='space-y-3'>
                <div className='flex justify-between items-center'>
                  <span className='text-gray-600'>Views:</span>
                  <span className='flex items-center space-x-1'>
                    <div className='w-2 h-2 bg-primary-300 rounded-full'></div>
                    <span className='font-medium'>127</span>
                  </span>
                </div>

                <div className='flex justify-between items-center'>
                  <span className='text-gray-600'>Proposals Submitted:</span>
                  <span className='font-medium'>8</span>
                </div>

                <div className='flex justify-between items-center'>
                  <span className='text-gray-600'>In Discussion:</span>
                  <span className='font-medium'>3</span>
                </div>

                <div className='flex justify-between items-center'>
                  <span className='text-gray-600'>Hired:</span>
                  <span className='font-medium'>0</span>
                </div>
              </div>

              {/* Proposal Section */}
            </div>
          )}

          {/* We don't need the old proposal section since we're using the ProposalsComponent */}
        </div>

        {/* Right Column - Course Info */}
        <div className='space-y-6'>
          {/* Assignment Weight */}
          <div className='bg-white rounded-lg p-6 shadow-sm'>
            <div className='text-center'>
              <div className='text-sm text-gray-600 mb-2'>
                Assignment Weight:
              </div>
              <div className='text-2xl font-bold text-gray-900 mb-1'>15%</div>
              <div className='text-sm text-gray-500 mb-4'>of final grade</div>
            </div>
          </div>

          {/* About the Professor */}
          <div className='bg-white rounded-lg p-6 shadow-sm'>
            <h3 className='text-lg font-semibold text-gray-900 mb-4'>
              User Information
            </h3>

            <div className='space-y-4'>
              <div className='flex items-center space-x-2'>
                <div className='w-4 h-4 bg-primary-300 rounded-full'></div>
                <span className='text-sm text-gray-600'>Turjha Podder</span>
              </div>

              <div className='flex items-center space-x-2'>
                <div className='w-4 h-4 bg-primary-300 rounded-full'></div>
                <span className='text-sm text-gray-600'>
                  Email: turjha.podder@uiu.ac.bd
                </span>
              </div>

              <div className='flex items-center space-x-1'>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={16}
                    className='text-secondary-300 fill-current'
                  />
                ))}
                <span className='text-sm font-medium text-gray-900 ml-2'>
                  4.8
                </span>
              </div>

              <div className='text-sm text-gray-600'>
                Professor Rating (124 reviews)
              </div>

              <div className='pt-4 border-t border-gray-200'>
                <div className='text-sm text-gray-900 font-medium mb-1'>
                  United International University
                </div>
                <div className='text-sm text-gray-600 mb-3'>
                  Dhaka, Bangladesh
                </div>

                <div className='space-y-2 text-sm text-gray-600'>
                  <div className='pt-2'>
                    <div className='font-medium text-gray-900'>Deadline:</div>
                    <div>2025-05-15: 11.50PM</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Resources */}
          <div className='bg-white rounded-lg p-6 shadow-sm'>
            <h3 className='text-lg font-semibold text-gray-900 mb-4'>
              Resources
            </h3>

            <div className='bg-gray-50 rounded-lg p-4 mb-4'>
              <div className='text-sm text-gray-600 mb-1'>
                <strong>Textbook:</strong> Stewart Calculus, 8th Edition
              </div>
              <div className='text-sm text-gray-600'>
                Chapter 7: Techniques of Integration
              </div>
            </div>

            <div className='space-y-3'>
              <button className='w-full flex items-center space-x-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200'>
                <div className='w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center'>
                  <FileText size={20} className='text-primary-600' />
                </div>
                <div className='flex-1 text-left'>
                  <div className='text-sm font-medium text-gray-900'>
                    Integration Formula Sheet
                  </div>
                  <div className='text-xs text-gray-500'>PDF • 2.3 MB</div>
                </div>
                <div className='text-primary-600'>
                  <Copy size={16} />
                </div>
              </button>

              <button className='w-full flex items-center space-x-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200'>
                <div className='w-10 h-10 bg-secondary-100 rounded-lg flex items-center justify-center'>
                  <FileText size={20} className='text-secondary-600' />
                </div>
                <div className='flex-1 text-left'>
                  <div className='text-sm font-medium text-gray-900'>
                    Lecture Notes - Integration by Parts
                  </div>
                  <div className='text-xs text-gray-500'>PDF • 1.8 MB</div>
                </div>
                <div className='text-primary-600'>
                  <Copy size={16} />
                </div>
              </button>

              <button className='w-full flex items-center space-x-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200'>
                <div className='w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center'>
                  <FileText size={20} className='text-green-600' />
                </div>
                <div className='flex-1 text-left'>
                  <div className='text-sm font-medium text-gray-900'>
                    Practice Problems
                  </div>
                  <div className='text-xs text-gray-500'>PDF • 1.2 MB</div>
                </div>
                <div className='text-primary-600'>
                  <Copy size={16} />
                </div>
              </button>
            </div>
            {activeStep === "details" && (
              <button
                onClick={handleSendProposal}
                className='bg-secondary-300 my-3 w-full flex justify-center hover:bg-secondary-200 text-gray-900 px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2'
              >
                <Send size={16} />
                <span>Send Proposal</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Proposal Component at the bottom of the page */}
      {showProposal && (
        <div className='mt-8 w-full'>
          <div className='bg-white rounded-lg p-6 shadow-sm'>
            <ProposalsComponent
              proposal={proposal}
              setProposal={setProposal}
              budget={budget}
              setBudget={setBudget}
              submitProposal={submitProposal}
              onCancel={() => {
                setShowProposal(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentDetails;
