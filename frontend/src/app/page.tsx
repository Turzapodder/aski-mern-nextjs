"use client";
import Image from "next/image";
import { Send, ArrowRight, Sparkles } from "lucide-react";
import UploadProjectForm from "@/components/UploadProjectForm";
import Link from "next/link";

import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

const LandingPage = () => {
  const router = useRouter();

  const handleWhatsAppClick = () => {
    const isAuth = Cookies.get('is_auth');
    if (isAuth === 'true') {
      window.open('https://wa.me/', '_blank');
    } else {
      router.push('/account/login?role=user&redirect=whatsapp');
    }
  };

  return (
    <div className='min-h-screen bg-white'>
      {/* Header */}
      <header className='w-full px-6 py-4'>
        <nav className='max-w-7xl mx-auto flex items-center justify-between'>
          {/* Logo */}
          <div className='flex items-center space-x-2'>
            <div className='w-8 h-8 bg-primary-900 rounded-lg flex items-center justify-center'>
              <span className='text-white font-bold text-sm'>A</span>
            </div>
            <span className='text-xl font-bold text-gray-900'>Aski</span>
          </div>

          {/* Navigation */}
          <div className='hidden md:flex items-center space-x-8'>
            <div className='flex items-center space-x-1 cursor-pointer'>
              <div className='px-6 py-2 bg-white'>
                <span className='text-gray-900 font-medium'>Home</span>
              </div>
              <div className='px-6 py-2 transition-colors'>
                <span className='text-gray-600 hover:text-gray-900 font-medium'>
                  Features
                </span>
              </div>
              <div className='px-6 py-2 transition-colors'>
                <span className='text-gray-600 hover:text-gray-900 font-medium'>
                  About Us
                </span>
              </div>
              <div className='px-6 py-2  transition-colors'>
                <span className='text-gray-600 hover:text-gray-900 font-medium'>
                  Contact
                </span>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className='flex items-center space-x-4'>
            <a href='/account/login?role=user' rel='noopener noreferrer'>
              <span className='text-gray-900 font-medium'>Sign In</span>
            </a>
            <Link
              href='/account/register'
              className='flex items-center font-medium text-white space-x-2 px-10 py-2 bg-black border-2 shadow-xl rounded-xl transition-colors'
            >
              Join Us
            </Link>
            <Link
              href='/account/register?role=tutor'
              className='bg-primary-300 text-white px-8 py-3 rounded-lg font-medium hover:bg-primary-600 transition-colors flex items-center space-x-2'
            >
              <span>Register as Tutor</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className='relative px-6 py-16 overflow-hidden'>
        <div className="max-w-7xl mx-auto grid grid-cols-1 gap-12 items-center relative z-10 bg-[url('/assets/bg-image.png')] bg-cover bg-center bg-no-repeat ">
          {/* Left Content */}
          <div className='space-y-8 flex items-center justify-center flex-col'>
            <a href='#_' className='relative inline-block text-lg group'>
              <span className='relative z-10 block px-5 py-3 overflow-hidden font-medium leading-tight text-gray-800 transition-colors duration-300 ease-out border-2 border-gray-900 rounded-lg group-hover:text-white'>
                <span className='absolute inset-0 w-full h-full px-5 py-3 rounded-lg bg-primary-600'></span>
                <span className='absolute left-0 w-48 h-48 -ml-2 transition-all duration-300 origin-top-right -rotate-90 -translate-x-full translate-y-12 bg-gray-900 group-hover:-rotate-180 ease'></span>
                <span className='relative flex flex-row-reverse gap-2 items-center text-white'>
                  Welcome to Aski
                  <Sparkles />
                </span>
              </span>
              <span
                className='absolute bottom-0 right-0 w-full h-12 -mb-1 -mr-1 transition-all duration-200 ease-linear bg-gray-900 rounded-lg group-hover:mb-0 group-hover:mr-0'
                data-rounded='rounded-lg'
              ></span>
            </a>
            <div className='space-y-6'>
              <h1 className='text-5xl lg:text-6xl font-smibold text-gray-900 leading-tight text-center'>
                The best place to learn
                <span className='block text-primary-300 font-cursive'>not from Ai</span>
              </h1>

              <p className='text-md text-gray-600 leading-relaxed text-center'>
                Discover thousands of fun and interactive learning activities to
                support your child&apos;s growth and learning process.
              </p>
            </div>

            {/* WhatsApp Action */}
            <div className="w-full max-w-md mx-auto flex flex-col items-center space-y-6">
              <button
                onClick={handleWhatsAppClick}
                className="group w-full flex items-center justify-center space-x-3 bg-primary-600 hover:bg-primary-500 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 shadow-[0_8px_30px_rgb(37,211,102,0.3)] hover:shadow-[0_8px_30px_rgb(37,211,102,0.5)] transform hover:-translate-y-1"
              >
                <Send className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
                <span>Send us your problem</span>
              </button>

              <div className="flex items-center space-x-3 w-full">
                <div className="h-px bg-gray-200 flex-1"></div>
                <span className="text-gray-400 font-medium text-sm uppercase tracking-wider">or upload manually</span>
                <div className="h-px bg-gray-200 flex-1"></div>
              </div>
            </div>

            {/* Upload Project Form */}
            <UploadProjectForm
              maxWidth='max-w-3xl'
              onSubmit={(formData) => {
                console.log("Form submitted:", formData);
                // Handle form submission
                // Note: Actual submission logic would go here, similar to DashboardComponent
                // but for anonymous users it might redirect to register/login first
              }}
              onCancel={() => {
                console.log("Form cancelled");
                // Handle form cancellation
              }}
              onSaveDraft={(formData) => {
                console.log("Draft saved:", formData);
                // Handle draft saving
              }}
              advanced={false}
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className='px-6 py-20 bg-gray-50'>
        <div className='max-w-7xl mx-auto'>
          {/* Header */}
          <div className='text-center mb-16'>
            <div className='inline-flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-full mb-6'>
              <div className='w-4 h-4 bg-secondary-300 rounded-full'></div>
              <span className='text-sm font-medium text-gray-700 uppercase tracking-wide'>
                LEARNING PLATFORM
              </span>
            </div>
            <h2 className='text-5xl font-normal text-gray-900 mb-6 leading-tight'>
              Everything you need to excel in
              <br />
              your{" "}
              <span className='inline-flex items-center bg-secondary-100 px-3 py-1 rounded-lg'>
                📚
              </span>{" "}
              academic journey
            </h2>
          </div>

          {/* Feature Cards */}
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-12'>
            {/* Card 1 - Upload Assignment */}
            <div className='space-y-6'>
              <div className='flex items-start space-x-4'>
                <div className='w-8 h-8 bg-gray-900 text-white rounded-lg flex items-center justify-center font-bold text-lg'>
                  1
                </div>
                <div>
                  <h3 className='text-2xl font-medium text-gray-900 mb-3'>
                    Upload Your Assignment
                  </h3>
                  <p className='text-gray-600 leading-relaxed'>
                    Easily submit your assignments with our intuitive upload
                    system. Track progress, get feedback, and manage deadlines
                    all in one place.
                  </p>
                </div>
              </div>

              {/* Upload Mockup */}
              <div className='bg-white rounded-2xl p-6 shadow-lg'>
                <div className='space-y-4'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center space-x-2'>
                      <div className='w-8 h-8 bg-primary-300 rounded-full flex items-center justify-center'>
                        <span className='text-white text-sm font-bold'>📄</span>
                      </div>
                      <span className='text-sm font-medium'>
                        Assignment Status
                      </span>
                    </div>
                  </div>

                  <div className='bg-primary-100 text-primary-700 p-4 rounded-xl'>
                    <div className='flex items-center space-x-2 mb-2'>
                      <div className='w-6 h-6 bg-primary-300 rounded flex items-center justify-center'>
                        <span className='text-white text-xs font-bold'>✓</span>
                      </div>
                      <span className='text-sm'>Submitted Successfully</span>
                    </div>
                    <div className='text-lg font-bold'>Math Assignment #3</div>
                    <div className='text-sm opacity-80'>
                      Due: Tomorrow 11:59 PM
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2 - Find Perfect Tutors */}
            <div className='space-y-6'>
              <div className='flex items-start space-x-4'>
                <div className='w-8 h-8 bg-gray-900 text-white rounded-lg flex items-center justify-center font-bold text-lg'>
                  2
                </div>
                <div>
                  <h3 className='text-2xl font-medium text-gray-900 mb-3'>
                    Find Your Perfect Tutors
                  </h3>
                  <p className='text-gray-600 leading-relaxed'>
                    Connect with expert tutors from around the world. Browse
                    profiles, read reviews, and find the perfect match for your
                    learning needs.
                  </p>
                </div>
              </div>

              {/* Tutor Mockup */}
              <div className='bg-white rounded-2xl p-6 shadow-lg'>
                <div className='space-y-4'>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm font-medium text-gray-900'>
                      Available Tutors
                    </span>
                    <div className='w-6 h-6 bg-secondary-300 rounded-full'></div>
                  </div>

                  <div className='text-sm text-gray-500 mb-3'>Mathematics</div>
                  <div className='text-sm text-gray-500 mb-4'>
                    Physics • Chemistry
                  </div>

                  <div className='flex items-center space-x-3 p-3 bg-gray-50 rounded-lg'>
                    <div className='w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center'>
                      <span className='text-primary-600 text-lg'>👨‍🏫</span>
                    </div>
                    <div className='flex-1'>
                      <div className='font-medium text-gray-900'>
                        Dr. Sarah Johnson
                      </div>
                      <div className='text-sm text-gray-500'>
                        PhD Mathematics • 5+ years experience • ⭐ 4.9 rating
                      </div>
                    </div>
                    <div className='text-right'>
                      <div className='font-bold text-gray-900'>$25/hr</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3 - Learn from the Best */}
            <div className='space-y-6'>
              <div className='flex items-start space-x-4'>
                <div className='w-8 h-8 bg-gray-900 text-white rounded-lg flex items-center justify-center font-bold text-lg'>
                  3
                </div>
                <div>
                  <h3 className='text-2xl font-medium text-gray-900 mb-3'>
                    Learn from the Best
                  </h3>
                  <p className='text-gray-600 leading-relaxed'>
                    Access premium courses and learning materials from top
                    educators. Track your progress and achieve your academic
                    goals with expert guidance.
                  </p>
                </div>
              </div>

              {/* Learning Mockup */}
              <div className='bg-white rounded-2xl p-6 shadow-lg'>
                <div className='space-y-4'>
                  <div className='space-y-2'>
                    <div className='text-sm text-gray-500'>Current Course</div>
                    <div className='text-sm text-gray-500'>
                      Advanced Calculus
                    </div>
                  </div>

                  <div className='border-t pt-4'>
                    <div className='text-lg font-bold text-gray-900 mb-2'>
                      Progress Tracking
                    </div>
                    <div className='text-sm text-gray-600 mb-4'>
                      Monitor your learning journey with detailed analytics and
                      personalized recommendations.
                    </div>

                    <div className='bg-secondary-200 text-gray-900 px-4 py-2 rounded-lg inline-flex items-center space-x-2'>
                      <span className='text-sm font-medium'>85% Complete</span>
                      <div className='w-4 h-4 bg-gray-900 rounded flex items-center justify-center'>
                        <span className='text-white text-xs'>📈</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Join Us Section */}
      <section className='px-6 py-16 bg-gray-50'>
        <div className='max-w-7xl mx-auto'>
          <div className='bg-white rounded-3xl shadow-xl overflow-hidden'>
            <div className='grid grid-cols-1 lg:grid-cols-2 min-h-[500px]'>
              {/* Left Content */}
              <div className='p-12 flex flex-col justify-center'>
                <h2 className='text-4xl font-bold text-gray-900 mb-6'>
                  Get in touch<br />
                  with us
                </h2>

                <p className='text-gray-600 mb-8 leading-relaxed'>
                  We&apos;re here to help! Whether you have a question about our
                  tutoring services, need assistance with your account, or want
                  to join our team of expert tutors, we&apos;re ready to assist you.
                </p>

                <div className='space-y-6 mb-8'>
                  <div>
                    <h3 className='font-semibold text-gray-900 mb-2'>Email:</h3>
                    <p className='text-gray-700'>hello@aski.com</p>
                  </div>

                  <div>
                    <h3 className='font-semibold text-gray-900 mb-2'>Phone:</h3>
                    <p className='text-gray-700'>+1 234 567 78</p>
                    <p className='text-sm text-gray-500'>
                      Available Monday to Friday, 9 AM - 6 PM GMT
                    </p>
                  </div>
                </div>

                <div className='flex space-x-4'>
                  <button className='bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center space-x-2'>
                    <span>Live Chat</span>
                    <ArrowRight size={16} />
                  </button>

                  <Link
                    href='/account/register?role=tutor'
                    className='bg-primary-300 text-white px-8 py-3 rounded-lg font-medium hover:bg-primary-600 transition-colors flex items-center space-x-2'
                  >
                    <span>Register as Tutor</span>
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>

              {/* Right Image */}
              <div className='bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center p-12'>
                <div className='text-center'>
                  <div className='w-48 h-48 bg-white rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg'>
                    <div className='text-6xl'>👨‍🏫</div>
                  </div>
                  <h3 className='text-2xl font-bold text-gray-900 mb-2'>
                    Join Our Team
                  </h3>
                  <p className='text-gray-600 max-w-sm'>
                    Become part of our community of expert tutors and help
                    students achieve their academic goals.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className='px-6 py-12 bg-primary-600'>
        <div className='max-w-7xl mx-auto'>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-8 mb-8'>
            {/* Logo and Description */}
            <div className='space-y-4'>
              <div className='flex items-center space-x-2'>
                <div className='w-8 h-8 bg-primary-300 rounded-lg flex items-center justify-center'>
                  <span className='text-white font-bold text-sm'>A</span>
                </div>
                <span className='text-xl font-bold text-white'>Aski</span>
              </div>
              <p className='text-white text-sm leading-relaxed'>
                The best place to learn with interactive activities and expert
                guidance.
              </p>
            </div>

            {/* Quick Links */}
            <div className='space-y-4'>
              <h3 className='text-white font-semibold'>Quick Links</h3>
              <div className='space-y-2'>
                <a
                  href='#'
                  className='block text-white hover:text-white transition-colors'
                >
                  Home
                </a>
                <a
                  href='#'
                  className='block text-white hover:text-white transition-colors'
                >
                  About Us
                </a>
                <a
                  href='#'
                  className='block text-white hover:text-white transition-colors'
                >
                  Features
                </a>
                <a
                  href='#'
                  className='block text-white hover:text-white transition-colors'
                >
                  Contact
                </a>
              </div>
            </div>

            {/* Support */}
            <div className='space-y-4'>
              <h3 className='text-white font-semibold'>Support</h3>
              <div className='space-y-2'>
                <a
                  href='#'
                  className='block text-white hover:text-white transition-colors'
                >
                  Help Center
                </a>
                <a
                  href='#'
                  className='block text-white hover:text-white transition-colors'
                >
                  Privacy Policy
                </a>
                <a
                  href='#'
                  className='block text-white hover:text-white transition-colors'
                >
                  Terms of Service
                </a>
                <a
                  href='#'
                  className='block text-white hover:text-white transition-colors'
                >
                  FAQ
                </a>
              </div>
            </div>

            {/* Contact */}
            <div className='space-y-4'>
              <h3 className='text-white font-semibold'>Contact</h3>
              <div className='space-y-2 text-white text-sm'>
                <p>hello@aski.com</p>
                <p>+1 (555) 123-4567</p>
                <p>
                  123 Learning Street
                  <br />
                  Education City, EC 12345
                </p>
              </div>
            </div>
          </div>

          <div className='border-t border-gray-800 pt-8'>
            <div className='flex flex-col md:flex-row justify-between items-center'>
              <p className='text-white text-sm'>
                © 2024 Aski. All rights reserved.
              </p>
              <div className='flex space-x-6 mt-4 md:mt-0'>
                <a
                  href='#'
                  className='text-gray-400 hover:text-white transition-colors'
                >
                  <span className='sr-only'>Facebook</span>
                  <div className='w-6 h-6 bg-gray-600 rounded'></div>
                </a>
                <a
                  href='#'
                  className='text-gray-400 hover:text-white transition-colors'
                >
                  <span className='sr-only'>Twitter</span>
                  <div className='w-6 h-6 bg-gray-600 rounded'></div>
                </a>
                <a
                  href='#'
                  className='text-gray-400 hover:text-white transition-colors'
                >
                  <span className='sr-only'>Instagram</span>
                  <div className='w-6 h-6 bg-gray-600 rounded'></div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
