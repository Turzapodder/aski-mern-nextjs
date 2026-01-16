import React, { useState } from 'react';
import Image from 'next/image';
import { Check } from 'lucide-react';

interface TutorProposal {
  id: string;
  name: string;
  role: string;
  location: string;
  price: number;
  earned: string;
  jobSuccess: string;
  isTopRated: boolean;
  coverLetter: string;
  skills: string[];
  profileImage: string;
  boosted: boolean;
}

interface TutorProposalsComponentProps {
  onMessageClick: (tutorId: string) => void;
  onHireClick: (tutorId: string) => void;
  onProfileClick: (tutorId: string) => void;
}

const TutorProposalsComponent: React.FC<TutorProposalsComponentProps> = ({
  onMessageClick,
  onHireClick,
  onProfileClick
}) => {
  // Mock data for tutor proposals
  const [proposals, setProposals] = useState<TutorProposal[]>([
    {
      id: '1',
      name: 'Blog Writer / SEO Writer',
      role: 'Blog Writer / SEO Writer',
      location: 'United States',
      price: 200.00,
      earned: '$0 earned',
      jobSuccess: '',
      isTopRated: false,
      coverLetter: 'I am writing to express my enthusiasm and interest in the position of a blogger. With a passion for writing and a strong understanding of digital marketing, I believe I can make a valuable contribution to your team. Over the years, I have...',
      skills: ['Blog', 'Blog Writing', 'Information Design'],
      profileImage: '/assets/tutor-profile.svg',
      boosted: true
    },
    {
      id: '2',
      name: 'SaaS Content Writer',
      role: 'SaaS Content Writer | 10+ Years of Marketing and IT Experience',
      location: 'United States',
      price: 200.00,
      earned: '$20K+ earned',
      jobSuccess: '100% Job Success',
      isTopRated: true,
      coverLetter: 'Comparison is the thief of joy! But comparison pieces are GREAT for SEO. My name is [Name], and I can write you a high-quality piece on the XX Best YouTube Shorts Editors Ranked. I\'m familiar with SEO tools like SurferSEO and...',
      skills: ['CRM Software', 'Copywriting', 'SEO Content', 'Blog', 'B2B Marketing', 'SaaS', 'SEO Writing', 'Salesforce', 'Content Writing'],
      profileImage: '/assets/tutor-profile.svg',
      boosted: true
    }
  ]);

  // State for payment summary modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState<TutorProposal | null>(null);

  const handleHireClick = (tutorId: string) => {
    const tutor = proposals.find(p => p.id === tutorId);
    if (tutor) {
      setSelectedTutor(tutor);
      setShowPaymentModal(true);
    }
  };

  const handleConfirmHire = () => {
    if (selectedTutor) {
      onHireClick(selectedTutor.id);
      setShowPaymentModal(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Tutor Proposals</h2>
      
      {proposals.map((proposal) => (
        <div key={proposal.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Proposal Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-start">
              {/* Profile Image */}
              <div 
                className="w-16 h-16 rounded-full overflow-hidden mr-4 cursor-pointer" 
                onClick={() => onProfileClick(proposal.id)}
              >
                <Image
                  src={proposal.profileImage}
                  alt={proposal.name}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Tutor Info */}
              <div className="flex-1">
                <div className="flex items-center">
                  {proposal.boosted && (
                    <div className="flex items-center text-green-500 mr-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
                      </svg>
                      <span className="text-xs font-medium ml-1">Boosted</span>
                    </div>
                  )}
                  <h3 className="text-base font-medium text-gray-900">{proposal.role}</h3>
                </div>
                <p className="text-sm text-gray-600 mt-1">{proposal.location}</p>
                
                <div className="flex items-center justify-between mt-2">
                  <div>
                    <p className="text-base font-bold text-gray-900">${proposal.price.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">{proposal.earned}</p>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => onMessageClick(proposal.id)}
                      className="px-4 py-1.5 border border-primary-300 text-primary-500 rounded-md hover:bg-primary-50 transition-colors"
                    >
                      Messages
                    </button>
                    <button 
                      onClick={() => handleHireClick(proposal.id)}
                      className="px-6 py-1.5 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors"
                    >
                      Hire
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Cover Letter */}
          <div className="p-6 border-b border-gray-200">
            <p className="text-sm text-gray-700 mb-2"><span className="font-medium">Cover letter - </span>{proposal.coverLetter}</p>
          </div>
          
          {/* Skills */}
          <div className="p-4 bg-gray-50">
            <div className="flex flex-wrap gap-2">
              {proposal.skills.map((skill, index) => (
                <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                  {skill}
                </span>
              ))}
            </div>
            
            {proposal.jobSuccess && (
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs font-medium text-gray-700">{proposal.jobSuccess}</span>
                {proposal.isTopRated && (
                  <div className="flex items-center bg-pink-100 px-2 py-0.5 rounded">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="0" className="text-pink-500">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                    <span className="text-xs font-bold text-pink-500 ml-1">TOP RATED PLUS</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
      
      {/* Payment Summary Modal */}
      {showPaymentModal && selectedTutor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Payment Summary</h3>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3 pb-4 border-b border-gray-200">
                <div className="w-12 h-12 rounded-full overflow-hidden">
                  <Image
                    src={selectedTutor.profileImage}
                    alt={selectedTutor.name}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{selectedTutor.role}</p>
                  <p className="text-sm text-gray-600">{selectedTutor.location}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tutor Fee</span>
                  <span className="font-medium">${selectedTutor.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Service Fee</span>
                  <span className="font-medium">${(selectedTutor.price * 0.05).toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="font-bold">Total</span>
                  <span className="font-bold">${(selectedTutor.price * 1.05).toFixed(2)}</span>
                </div>
              </div>
              
              <div className="pt-4">
                <p className="text-sm text-gray-600 mb-4">
                  By confirming, you agree to hire this tutor for the assignment at the specified rate.
                </p>
                
                <div className="flex space-x-3">
                  <button 
                    onClick={() => setShowPaymentModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleConfirmHire}
                    className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors flex items-center justify-center"
                  >
                    <Check size={16} className="mr-2" />
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TutorProposalsComponent;
