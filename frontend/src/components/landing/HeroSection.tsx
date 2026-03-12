import React from 'react';
import UploadProjectForm from '@/components/UploadProjectForm';

export const HeroSection = () => {
  return (
    <section className="pt-24 sm:pt-32 pb-16 sm:pb-20 px-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 right-0 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-purple-100/50 rounded-full blur-[80px] sm:blur-[100px] -z-10 translate-x-1/3 -translate-y-1/4"></div>
      <div className="absolute top-20 left-0 w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] bg-blue-100/50 rounded-full blur-[60px] sm:blur-[80px] -z-10 -translate-x-1/3"></div>

      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
        <div className="max-w-2xl text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] sm:text-xs font-semibold mb-6 border border-blue-100 mx-auto lg:mx-0">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            Join 10,000+ Students Today
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.1] mb-6 tracking-tight">
            Master Your <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Academic Journey
            </span>{' '}
            <br className="hidden sm:block" />
            with Expert Guidance
          </h1>
          <p className="text-lg sm:text-xl text-gray-500 mb-8 leading-relaxed max-w-lg mx-auto lg:mx-0">
            Connect with top-rated tutors for personalized assignment help, project support, and
            1-on-1 learning.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-1.5 bg-white border border-gray-200 rounded-2xl sm:rounded-full max-w-md shadow-sm mb-10 mx-auto lg:mx-0">
            <input
              type="text"
              placeholder="What subject do you need help?"
              className="flex-1 px-4 py-2.5 sm:py-2 bg-transparent outline-none text-gray-700 placeholder:text-gray-400 text-sm sm:text-base"
            />
            <button className="bg-black text-white px-6 py-2.5 rounded-xl sm:rounded-full font-medium hover:bg-gray-800 transition-colors text-sm sm:text-base">
              Find Tutors
            </button>
          </div>

          <div className="flex gap-6 sm:gap-8 items-center justify-center lg:justify-start text-sm">
            <div className="text-center lg:text-left">
              <h4 className="font-bold text-xl sm:text-2xl">10k+</h4>
              <p className="text-gray-500 text-xs sm:text-sm">Active Students</p>
            </div>
            <div className="h-8 w-px bg-gray-200"></div>
            <div className="text-center lg:text-left">
              <h4 className="font-bold text-xl sm:text-2xl">4.9</h4>
              <div className="flex justify-center lg:justify-start text-yellow-400 text-[10px] sm:text-xs mt-1">
                ★★★★★
              </div>
              <p className="text-gray-500 mt-1 text-xs sm:text-sm">Student Satisfaction</p>
            </div>
          </div>
        </div>

        <div className="relative mt-8 lg:mt-0">
          {/* Component Injection */}
          <div className="relative z-10 transform scale-[0.9] sm:scale-[0.95] md:scale-100 origin-center lg:origin-top-right">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
              <UploadProjectForm />
            </div>
          </div>

          {/* Decorative elements behind the form */}
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-[2rem] blur-xl -z-10"></div>
        </div>
      </div>
    </section>
  );
};
