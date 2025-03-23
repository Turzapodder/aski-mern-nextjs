'use client';

import { useState } from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { User, Lock, Users, Share2 } from 'lucide-react';

const steps = [
  {
    id: 1,
    title: 'Your details',
    description: 'Please provide your name and email',
    icon: User,
  },
  {
    id: 2,
    title: 'Choose a password',
    description: 'Must be at least 8 characters',
    icon: Lock,
  },
  {
    id: 3,
    title: 'Invite your team',
    description: 'Start collaborating with your team',
    icon: Users,
  },
  {
    id: 4,
    title: 'Add your socials',
    description: 'Share posts to your social accounts',
    icon: Share2,
  },
];

const validationSchema = [
  // Step 1
  Yup.object({
    firstName: Yup.string().required('First name is required'),
    lastName: Yup.string().required('Last name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
  }),
  // Step 2
  Yup.object({
    password: Yup.string()
      .min(8, 'Password must be at least 8 characters')
      .required('Password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password')], 'Passwords must match')
      .required('Confirm password is required'),
  }),
  // Step 3
  Yup.object({
    teamMembers: Yup.array().of(
      Yup.string().email('Invalid email')
    ).min(1, 'Add at least one team member'),
  }),
  // Step 4
  Yup.object({
    twitter: Yup.string().url('Invalid URL'),
    linkedin: Yup.string().url('Invalid URL'),
  }),
];

export default function TutorOnboarding() {
  const [currentStep, setCurrentStep] = useState(1);

  // Add this state near the top of the component
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Update the onSubmit handler
  const formik:any = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      teamMembers: [''],
      twitter: '',
      linkedin: '',
    },
    validationSchema: validationSchema[currentStep - 1],
    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        if (currentStep < steps.length) {
          setCurrentStep(currentStep + 1);
        } else {
          console.log('Form submitted:', values);
          // Handle final submission here
        }
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <button
                type="button"
                className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-50"
              >
                {/* Google SVG remains the same */}
                Sign up with Google
              </button>
            </div>
            <div className="text-center">
              <span className="px-2 bg-white text-sm text-gray-500">OR</span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">First name</label>
              <input
                type="text"
                name="firstName"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.firstName}
                placeholder="Enter your first name"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              />
              {formik.touched.firstName && formik.errors.firstName && (
                <div className="text-red-500 text-sm mt-1">{formik.errors.firstName}</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Last name</label>
              <input
                type="text"
                name="lastName"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.lastName}
                placeholder="Enter your last name"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              />
              {formik.touched.lastName && formik.errors.lastName && (
                <div className="text-red-500 text-sm mt-1">{formik.errors.lastName}</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.email}
                placeholder="Enter your email"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              />
              {formik.touched.email && formik.errors.email && (
                <div className="text-red-500 text-sm mt-1">{formik.errors.email}</div>
              )}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                name="password"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.password}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              />
              {formik.touched.password && formik.errors.password && (
                <div className="text-red-500 text-sm mt-1">{formik.errors.password}</div>
              )}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Team Member Email</label>
              <input
                type="email"
                name="teamMembers[0]"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.teamMembers[0]}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              />
              {formik.touched.teamMembers?.[0] && formik.errors.teamMembers?.[0] && (
                <div className="text-red-500 text-sm mt-1">{formik.errors.teamMembers[0]}</div>
              )}
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Twitter Profile URL</label>
              <input
                type="url"
                name="twitter"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.twitter}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              />
              {formik.touched.twitter && formik.errors.twitter && (
                <div className="text-red-500 text-sm mt-1">{formik.errors.twitter}</div>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-full max-w-6xl bg-white rounded-lg shadow-lg overflow-hidden flex flex-col md:flex-row">
        {/* Mobile Stepper */}
        <div className="md:hidden p-4 bg-white border-b">
          <div className="flex justify-between items-center">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`flex flex-col items-center ${
                  step.id === currentStep
                    ? 'text-green-600'
                    : step.id < currentStep
                    ? 'text-green-400'
                    : 'text-gray-400'
                }`}
              >
                <step.icon className="w-6 h-6" />
                <div className="text-xs mt-1">{step.title}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop Stepper */}
        <div className="hidden md:block w-1/3 bg-gray-50 p-8 border-r">
          <div className="space-y-8">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`flex items-start gap-4 ${
                  step.id === currentStep
                    ? 'text-green-600'
                    : step.id < currentStep
                    ? 'text-green-400'
                    : 'text-gray-400'
                }`}
              >
                <step.icon className="w-6 h-6 mt-1" />
                <div>
                  <h3 className="font-medium">{step.title}</h3>
                  <p className="text-sm">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 p-8">
          <form onSubmit={formik.handleSubmit} className="max-w-lg mx-auto">
            <h2 className="text-2xl font-bold mb-8">{steps[currentStep - 1].title}</h2>
            {renderStepContent()}
            <div className="mt-8">
              // Update the submit button in the return JSX
              <button
                type="submit"
                disabled={isSubmitting || !formik.isValid}
                className="w-full bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Processing...' : currentStep === steps.length ? 'Submit' : 'Continue'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}