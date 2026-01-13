import React from 'react';
import { Send, DollarSign } from 'lucide-react';

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

      <div className="space-y-6">
        {/* Proposal Letter (Removed) */}
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
            disabled={!budget.trim()}
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