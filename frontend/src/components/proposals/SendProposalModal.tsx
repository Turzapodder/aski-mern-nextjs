'use client';

import React, { useState } from 'react';
import { X, Upload, FileText, DollarSign, Clock, User, BookOpen } from 'lucide-react';
import { useCreateProposalMutation } from '@/lib/services/proposals';
import { toast } from 'sonner';
import { Assignment } from '@/lib/services/assignments';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/lib/store';
import { chatApi } from '@/lib/services/chat';
import { DEFAULT_CURRENCY, formatCurrency } from '@/lib/currency';


interface SendProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: Assignment;
  currency?: string;
}

interface ProposalFormData {
  title: string;
  description: string;
  proposedPrice: number;
  estimatedDeliveryTime: number;
  relevantExperience: string;
}

const SendProposalModal: React.FC<SendProposalModalProps> = ({
  isOpen,
  onClose,
  assignment,
  currency
}) => {
  const activeCurrency = currency || DEFAULT_CURRENCY;
  const formatAmount = (value?: number) => formatCurrency(value, activeCurrency);
  const [createProposal, { isLoading }] = useCreateProposalMutation();
  const dispatch = useDispatch<AppDispatch>();
  const [attachments, setAttachments] = useState<File[]>([]);
  const [formData, setFormData] = useState<ProposalFormData>({
    title: '',
    description: '',
    proposedPrice: assignment.budget ?? assignment.estimatedCost ?? 0,
    estimatedDeliveryTime: 24,
    relevantExperience: ''
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof ProposalFormData, string>>
  >({});

  const handleInputChange = (field: keyof ProposalFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length + attachments.length > 5) {
      return;
    }

    const validFiles = files.filter(file => {
      if (file.size > 25 * 1024 * 1024) { // 25MB limit
        return false;
      }
      return true;
    });

    setAttachments(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ProposalFormData, string>> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (formData.proposedPrice <= 0) {
      newErrors.proposedPrice = 'Price must be greater than 0';
    }

    if (formData.estimatedDeliveryTime <= 0) {
      newErrors.estimatedDeliveryTime = 'Delivery time must be greater than 0';
    }



    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const submitData = new FormData();
      submitData.append('assignmentId', assignment._id);
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('proposedPrice', formData.proposedPrice.toString());
      submitData.append('estimatedDeliveryTime', formData.estimatedDeliveryTime.toString());
      submitData.append('relevantExperience', formData.relevantExperience);

      // Add attachments
      attachments.forEach((file, index) => {
        submitData.append('attachments', file);
      });

      await createProposal(submitData).unwrap();
      dispatch(chatApi.util.invalidateTags(['Chat']));
      toast.success('Proposal sent');
      onClose();

      // Reset form
      setFormData({
        title: '',
        description: '',
        proposedPrice: assignment.budget ?? assignment.estimatedCost ?? 0,
        estimatedDeliveryTime: 24,
        relevantExperience: ''
      });
      setAttachments([]);
      setErrors({});
    } catch (error: any) {
      const message =
        error?.data?.message ||
        error?.message ||
        'Unable to send proposal. Please try again.';
      toast.error(message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Send Proposal</h2>
            <p className="text-gray-600 mt-1">Submit your proposal for this assignment</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Assignment Info */}
        <div className="p-6 bg-gray-50 border-b">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-gray-900">{assignment.title}</h3>
              <p className="text-gray-600 mt-1 line-clamp-2">{assignment.description}</p>
              <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                <span className="flex items-center">
                  <DollarSign className="w-4 h-4 mr-1" />
                  Budget: {formatAmount(assignment.budget ?? assignment.estimatedCost ?? 0)}
                </span>
                <span className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  Due: {new Date(assignment.deadline).toLocaleDateString()}
                </span>
                <span className="flex items-center">
                  <User className="w-4 h-4 mr-1" />
                  {assignment.student.name}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Proposal Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
              placeholder="Enter a compelling title for your proposal"
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Proposal Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
              placeholder="Describe your approach to completing this assignment"
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
          </div>

          {/* Price and Delivery Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Proposed Price ({activeCurrency}) *
              </label>
              <input
                type="number"
                min="1"
                step="0.01"
                value={formData.proposedPrice}
                onChange={(e) => handleInputChange('proposedPrice', parseFloat(e.target.value) || 0)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.proposedPrice ? 'border-red-500' : 'border-gray-300'
                  }`}
                placeholder="0.00"
              />
              {errors.proposedPrice && <p className="text-red-500 text-sm mt-1">{errors.proposedPrice}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estimated Delivery Time (hours) *
              </label>
              <input
                type="number"
                min="1"
                value={formData.estimatedDeliveryTime}
                onChange={(e) => handleInputChange('estimatedDeliveryTime', parseInt(e.target.value) || 0)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.estimatedDeliveryTime ? 'border-red-500' : 'border-gray-300'
                  }`}
                placeholder="24"
              />
              {errors.estimatedDeliveryTime && <p className="text-red-500 text-sm mt-1">{errors.estimatedDeliveryTime}</p>}
            </div>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Attachments (Optional)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 mb-2">
                Drag and drop files here, or{' '}
                <label className="text-blue-600 hover:text-blue-700 cursor-pointer">
                  browse
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </p>
              <p className="text-sm text-gray-500">
                Maximum 5 files, 25MB each. Supported: PDF, DOC, DOCX, TXT, JPG, PNG
              </p>
            </div>

            {/* File List */}
            {attachments.length > 0 && (
              <div className="mt-4 space-y-2">
                {attachments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{file.name}</p>
                        <p className="text-xs text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Sending...' : 'Send Proposal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SendProposalModal;
