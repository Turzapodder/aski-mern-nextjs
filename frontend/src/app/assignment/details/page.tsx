"use client";
import { useSearchParams } from "next/navigation";
import {
  MapPin,
  Clock,
  DollarSign,
  Star,
  Flag,
  Heart,
  Copy,
  FileText,
  Send,
} from "lucide-react";
import { useState } from "react";
import CollapsibleSidebar from "@/components/CollapsibleSidebar";
import TopNavbar from "@/components/TopNavbar";

const AssignmentDetails = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [showProposal, setShowProposal] = useState(false);
  const [proposal, setProposal] = useState("");
  const [budget, setBudget] = useState("");

  const handleSendProposal = () => {
    // Scroll to proposal section
    const proposalSection = document.getElementById("proposal-section");
    if (proposalSection) {
      proposalSection.scrollIntoView({ behavior: "smooth" });
    }
    setShowProposal(true);
  };

  const submitProposal = () => {
    console.log("Proposal submitted:", { proposal, budget });
    // Handle proposal submission
    alert("Proposal submitted successfully!");
    setProposal("");
    setBudget("");
    setShowProposal(false);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Collapsible Sidebar */}
      <CollapsibleSidebar activeItem="tasks" />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <TopNavbar
          userName="Ratul"
          greeting="Good morning"
          notificationCount={3}
          onSearch={(query) => console.log("Search:", query)}
          onNotificationClick={() => console.log("Notifications clicked")}
          onProfileClick={() => console.log("Profile clicked")}
        />
        <div className="max-w-6xl mx-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                      Calculus II - Integration by Parts Assignment
                    </h1>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Clock size={16} />
                        <span>Due in 3 days</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin size={16} />
                        <span>United International University</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="bg-primary-300 hover:bg-primary-600 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                      Submit Solution
                    </button>

                    <button className="border border-primary-300 text-primary-300 hover:bg-primary-50 px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2">
                      <Heart size={16} />
                    </button>
                  </div>
                </div>

                <div className="text-sm text-gray-600 mb-4 flex items-center">
                  <span className="text-primary-300 font-medium">
                    Report assignment issue
                  </span>{" "}
                  <button className="text-gray-400 hover:text-gray-600 p-2">
                    <Flag size={16} />
                  </button>
                </div>
              </div>

              {/* Assignment Problem */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Problem Statement
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Solve the following integration problems using the integration
                  by parts method. Show all steps clearly and provide detailed
                  explanations for each solution.
                </p>
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Problem 1:
                  </h3>
                  <p className="text-gray-700 mb-2">∫ x·e^x dx</p>

                  <h3 className="font-semibold text-gray-900 mb-2 mt-4">
                    Problem 2:
                  </h3>
                  <p className="text-gray-700 mb-2">∫ x²·ln(x) dx</p>

                  <h3 className="font-semibold text-gray-900 mb-2 mt-4">
                    Problem 3:
                  </h3>
                  <p className="text-gray-700">∫ x·sin(2x) dx</p>
                </div>
                <p className="text-gray-600 text-sm">
                  <strong>Note:</strong> Remember to use the LIATE rule for
                  choosing u and dv, and verify your answers by differentiation.
                </p>
              </div>

              {/* Assignment Details */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-secondary-100 rounded-lg flex items-center justify-center">
                      <Star size={20} className="text-secondary-300" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">
                        25 Points
                      </div>
                      <div className="text-sm text-gray-600">Total marks</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                      <Clock size={20} className="text-primary-300" />
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-gray-900">
                        Advanced Level
                      </div>
                      <div className="text-sm text-gray-600">
                        Requires strong calculus foundation
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Assignment Type:</span>{" "}
                    Individual homework
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    <span className="font-medium">Submission Format:</span> PDF
                    with handwritten solutions
                  </div>
                </div>
              </div>

              {/* Required Knowledge */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Required Mathematical Concepts
                </h2>

                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Prerequisites
                  </h3>
                  <div className="flex flex-wrap gap-2">
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
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        {concept}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Project Engagement */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Project Activity
                </h2>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Views:</span>
                    <span className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-primary-300 rounded-full"></div>
                      <span className="font-medium">127</span>
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Proposals Submitted:</span>
                    <span className="font-medium">8</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">In Discussion:</span>
                    <span className="font-medium">3</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Hired:</span>
                    <span className="font-medium">0</span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center space-x-2 text-primary-300">
                    <span className="text-sm font-medium">
                      View proposal history and ratings
                    </span>
                    <div className="w-4 h-4 bg-primary-300 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">📊</span>
                    </div>
                  </div>
                </div>
                {/* Proposal Section */}
                {showProposal && (
                  <div
                    id="proposal-section"
                    className="mt-8 bg-white rounded-lg p-6 shadow-sm"
                  >
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                      Send Your Proposal
                    </h2>

                    <div className="space-y-6">
                      {/* Proposal Letter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Proposal Letter{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={proposal}
                          onChange={(e) => setProposal(e.target.value)}
                          placeholder="Describe your approach to solving this calculus assignment. Include your qualifications, methodology, and timeline..."
                          rows={6}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-300 focus:border-primary-300 resize-none"
                          required
                        />
                      </div>

                      {/* Budget */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Your Budget <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <DollarSign size={20} className="text-gray-400" />
                          </div>
                          <input
                            type="number"
                            value={budget}
                            onChange={(e) => setBudget(e.target.value)}
                            placeholder="Enter your budget (USD)"
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-300 focus:border-primary-300"
                            required
                          />
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          This is the amount you're willing to pay for
                          completing this assignment
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                        <button
                          onClick={() => setShowProposal(false)}
                          className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={submitProposal}
                          disabled={!proposal.trim() || !budget.trim()}
                          className="px-6 py-2 bg-primary-300 hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
                        >
                          <Send size={16} />
                          <span>Submit Proposal</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Course Info */}
            <div className="space-y-6">
              {/* Assignment Weight */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-2">
                    Assignment Weight:
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    15%
                  </div>
                  <div className="text-sm text-gray-500 mb-4">
                    of final grade
                  </div>
                </div>
              </div>

              {/* About the Professor */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  User Information
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-primary-300 rounded-full"></div>
                    <span className="text-sm text-gray-600">Turjha Podder</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-primary-300 rounded-full"></div>
                    <span className="text-sm text-gray-600">
                      Email: turjha.podder@uiu.ac.bd
                    </span>
                  </div>

                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={16}
                        className="text-secondary-300 fill-current"
                      />
                    ))}
                    <span className="text-sm font-medium text-gray-900 ml-2">
                      4.8
                    </span>
                  </div>

                  <div className="text-sm text-gray-600">
                    Professor Rating (124 reviews)
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-900 font-medium mb-1">
                      United International University
                    </div>
                    <div className="text-sm text-gray-600 mb-3">
                      Dhaka, Bangladesh
                    </div>

                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="pt-2">
                        <div className="font-medium text-gray-900">
                          Deadline:
                        </div>
                        <div>2025-05-15: 11.50PM</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Resources */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Resources
                </h3>

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="text-sm text-gray-600 mb-1">
                    <strong>Textbook:</strong> Stewart Calculus, 8th Edition
                  </div>
                  <div className="text-sm text-gray-600">
                    Chapter 7: Techniques of Integration
                  </div>
                </div>

                <div className="space-y-3">
                  <button className="w-full flex items-center space-x-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                      <FileText size={20} className="text-primary-600" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-sm font-medium text-gray-900">
                        Integration Formula Sheet
                      </div>
                      <div className="text-xs text-gray-500">PDF • 2.3 MB</div>
                    </div>
                    <div className="text-primary-600">
                      <Copy size={16} />
                    </div>
                  </button>

                  <button className="w-full flex items-center space-x-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200">
                    <div className="w-10 h-10 bg-secondary-100 rounded-lg flex items-center justify-center">
                      <FileText size={20} className="text-secondary-600" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-sm font-medium text-gray-900">
                        Lecture Notes - Integration by Parts
                      </div>
                      <div className="text-xs text-gray-500">PDF • 1.8 MB</div>
                    </div>
                    <div className="text-primary-600">
                      <Copy size={16} />
                    </div>
                  </button>

                  <button className="w-full flex items-center space-x-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <FileText size={20} className="text-green-600" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-sm font-medium text-gray-900">
                        Practice Problems
                      </div>
                      <div className="text-xs text-gray-500">PDF • 1.2 MB</div>
                    </div>
                    <div className="text-primary-600">
                      <Copy size={16} />
                    </div>
                  </button>
                </div>
                <button
                  onClick={handleSendProposal}
                  className="bg-secondary-300 my-3 w-full flex justify-center hover:bg-secondary-200 text-gray-900 px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                >
                  <Send size={16} />
                  <span>Send Proposal</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignmentDetails;
