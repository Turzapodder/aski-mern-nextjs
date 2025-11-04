"use client";

import React from "react";
import {
  User,
  Eye,
  Shield,
  CreditCard,
  ChevronRight,
  MapPin,
  Calendar,
  Clock,
  FileText,
  Users,
  CheckCircle,
  XCircle,
  Briefcase,
} from "lucide-react";
import Image from "next/image";

const TutorDashboard = ({user}: {user: any}) => {
  return (
    <div className="bg-[#f0f8ff] min-h-screen">
      <div className="mx-auto p-6">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Hello, {user?.name?.toUpperCase()}
            </h1>
            <p className="text-gray-600 mb-4 max-w-md">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed diam nonummy
              eirmod tempor invidunt ut labore et dolore magna aliquam erat, sed diam
            </p>
            <div className="flex flex-col sm:flex-row gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-500" />
                <span>Member since</span>
                <span className="font-medium">24 March 2019</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-500" />
                <span>Profile Views</span>
                <span className="font-medium">9,516</span>
              </div>
            </div>
          </div>
          
          {/* Illustration */}
          <div className="mt-6 lg:mt-0">
            <div className="w-48 h-48 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
              <div className="w-32 h-32 bg-blue-500 rounded-full flex items-center justify-center">
                <User className="w-16 h-16 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Profile Completion */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-2xl font-bold text-blue-600">83%</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Your profile is 83% complete</h3>
            <button className="flex items-center text-blue-600 text-sm font-medium hover:text-blue-700">
              Update Profile
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>

          {/* Verification */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Verify</h3>
            <p className="text-gray-600 text-sm mb-3">You need to address verify</p>
            <button className="flex items-center text-blue-600 text-sm font-medium hover:text-blue-700">
              Verification
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>

          {/* Invoice */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-2xl font-bold text-blue-600">05</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Invoice</h3>
            <p className="text-gray-600 text-sm mb-3">You need to pay those invoices</p>
            <button className="flex items-center text-blue-600 text-sm font-medium hover:text-blue-700">
              Pay Now
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Upcoming Schedules */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Upcoming schedules</h3>
            
            <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-xl">
              <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 text-sm text-blue-600 font-medium mb-1">
                  <span>Job ID: 68416</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">Class Test:</h4>
                <p className="text-gray-700 mb-2">Math Chap 12.2</p>
                <p className="text-gray-600 text-sm mb-3">Ques 5 To 10</p>
                
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>4:30 PM</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Sunday</span>
                  </div>
                  <span>Nov 23 2019</span>
                </div>
              </div>
            </div>
          </div>

          {/* Nearby Jobs */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Nearby Jobs</h3>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-10 h-10 text-blue-600" />
              </div>
              
              <div className="text-4xl font-bold text-gray-900 mb-2">30</div>
              <div className="text-gray-600 text-sm mb-1">JOBS</div>
              <div className="text-gray-500 text-xs mb-4">In Your Nearest Area!</div>
              
              <button className="flex items-center text-blue-600 text-sm font-medium hover:text-blue-700 mx-auto">
                Nearby Jobs
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-blue-100">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">20</div>
            <div className="text-gray-600 text-sm">Applied</div>
          </div>

          <div className="bg-blue-500 rounded-2xl p-6 text-center shadow-sm text-white">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold mb-1">12</div>
            <div className="text-blue-100 text-sm">Short Listed</div>
          </div>

          <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-blue-100">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">10</div>
            <div className="text-gray-600 text-sm">Appointed</div>
          </div>

          <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-blue-100">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">05</div>
            <div className="text-gray-600 text-sm">Confirmed</div>
          </div>

          <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-blue-100">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <XCircle className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">15</div>
            <div className="text-gray-600 text-sm">Rejected</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorDashboard;