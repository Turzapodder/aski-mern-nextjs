import React from 'react';
import { Send, DollarSign, Star, MapPin, Clock } from 'lucide-react';

interface ProposalsComponentProps {
  proposal: string;
  setProposal: (value: string) => void;
  budget: string;
  setBudget: (value: string) => void;
  submitProposal: () => void;
  onCancel: () => void;
}

const ProposalsComponent: React.FC<ProposalsComponentProps> = ({
  proposal,
  setProposal,
  budget,
  setBudget,
  submitProposal,
  onCancel
}) => {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Send Your Proposal
      </h2>

      {/* Freelancer Cards - Based on the image */}
      <div className="mb-8 border border-gray-200 rounded-lg overflow-hidden">
        {/* First Freelancer */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <span className="text-green-600 font-semibold">CB</span>
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <h3 className="font-semibold text-gray-900">Cara B.</h3>
                <button className="bg-green-500 text-white text-sm px-4 py-1 rounded-md">Post Job To Invite</button>
              </div>
              <p className="text-sm text-gray-600 mb-1">Landing Pages | Unbounce | Wordpress</p>
              <div className="flex items-center text-sm text-gray-700 mb-2">
                <span className="font-semibold mr-2">$125.00</span> / hr
                <span className="mx-3 text-gray-400">•</span>
                <span className="mr-2">$200K+</span> earned
                <span className="mx-3 text-gray-400">•</span>
                <div className="flex items-center">
                  <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden mr-2">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: '87%' }}></div>
                  </div>
                  <span>87% Job Success</span>
                </div>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <MapPin size={14} className="mr-1" />
                <span>Charlottesv..., VA</span>
              </div>
              <p className="text-sm text-gray-600 mt-2">I am easy to work with and have streamlined my design process. Get in touch and...</p>
              <p className="text-xs text-gray-500 mt-1">Suggested because they worked on 10 jobs that match your search.</p>
            </div>
            <div>
              <button className="border border-green-500 text-green-500 rounded-full p-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Second Freelancer */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 font-semibold">CH</span>
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <h3 className="font-semibold text-gray-900">Chris H.</h3>
                <button className="bg-green-500 text-white text-sm px-4 py-1 rounded-md">Post Job To Invite</button>
              </div>
              <p className="text-sm text-gray-600 mb-1">Landing Page Copywriting Pro</p>
              <div className="flex items-center text-sm text-gray-700 mb-2">
                <span className="font-semibold mr-2">$35.00</span> / hr
                <span className="mx-3 text-gray-400">•</span>
                <span className="mr-2">$30K+</span> earned
                <span className="mx-3 text-gray-400">•</span>
                <div className="flex items-center">
                  <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden mr-2">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: '83%' }}></div>
                  </div>
                  <span>83% Job Success</span>
                </div>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <MapPin size={14} className="mr-1" />
                <span>Littleton, CO</span>
              </div>
              <p className="text-sm text-gray-600 mt-2">Your website does a great job of informing your customers. Problem is, they're...</p>
              <p className="text-xs text-gray-500 mt-1">Suggested because they worked on 8 jobs that match your search.</p>
            </div>
            <div>
              <button className="border border-green-500 text-green-500 rounded-full p-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Third Freelancer */}
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
              <span className="text-purple-600 font-semibold">MP</span>
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <h3 className="font-semibold text-gray-900">Michelle P.</h3>
                <button className="bg-green-500 text-white text-sm px-4 py-1 rounded-md">Post Job To Invite</button>
              </div>
              <p className="text-sm text-gray-600 mb-1">Website Designer | Landing Page Expert | Webflow Certified</p>
              <div className="flex items-center text-sm text-gray-700 mb-2">
                <span className="font-semibold mr-2">$85.00</span> / hr
                <span className="mx-3 text-gray-400">•</span>
                <span className="mr-2">$100K+</span> earned
                <span className="mx-3 text-gray-400">•</span>
                <div className="flex items-center">
                  <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden mr-2">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: '95%' }}></div>
                  </div>
                  <span>95% Job Success</span>
                </div>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <MapPin size={14} className="mr-1" />
                <span>San Diego, CA</span>
              </div>
              <p className="text-sm text-gray-600 mt-2">I'm a website designer specializing in creating high-converting landing pages...</p>
              <p className="text-xs text-gray-500 mt-1">Suggested because they worked on 12 jobs that match your search.</p>
            </div>
            <div>
              <button className="border border-green-500 text-green-500 rounded-full p-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Proposal Letter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Proposal Letter <span className="text-red-500">*</span>
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
            This is the amount you're willing to pay for completing this assignment
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
          <button
            onClick={onCancel}
            className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={submitProposal}
            disabled={!proposal.trim() || !budget.trim()}
            className="px-6 py-2 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <Send size={16} />
            <span>Submit Proposal</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProposalsComponent;