import React, { useState, useEffect } from 'react';
import { User, Lock, Loader, Upload } from 'lucide-react';
import Image from 'next/image';
import { ProfileUpdatePayload, UserProfile } from '@/lib/services/profile';

interface ProfileFormProps {
  profile: UserProfile | null;
  formData: ProfileUpdatePayload;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isUpdating: boolean;
  isUploading: boolean;
  success: string | null;
}

const ProfileForm: React.FC<ProfileFormProps> = ({
  profile,
  formData,
  handleInputChange,
  handleImageUpload,
  handleSubmit,
  isUpdating,
  isUploading,
  success
}) => {
  return (
    <div className="flex-1 bg-white p-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Personal information</h2>
        {success && (
          <div className="flex items-center text-green-600 text-sm font-medium animate-pulse">
            <Loader className="w-4 h-4 mr-2 animate-spin" />
            Saving changes
          </div>
        )}
      </div>

      <div className="mb-8">
        <div className="relative w-24 h-24 group">
          <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-100">
            {formData.profileImage ? (
              <Image
                src={formData.profileImage}
                alt="Profile"
                width={96}
                height={96}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                <User className="w-10 h-10 text-gray-400" />
              </div>
            )}
          </div>
          <label className="absolute bottom-0 right-0 bg-gray-900 text-white p-1.5 rounded-full cursor-pointer hover:bg-gray-800 transition-colors shadow-sm">
            {isUploading ? (
              <Loader className="w-3 h-3 animate-spin" />
            ) : (
              <Lock className="w-3 h-3" />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              disabled={isUploading}
            />
          </label>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">First Name</label>
            <input
              type="text"
              name="name"
              value={formData.name || ''}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors"
              placeholder="First Name"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Last Name</label>
            <input
              type="text"
              name="lastName"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors"
              placeholder="Last Name"
            />
          </div>

          <div className="md:col-span-1">
            <label className="block text-sm font-semibold text-gray-900 mb-2">Email Address</label>
            <input
              type="email"
              value={profile?.email || ''}
              disabled
              className="w-full px-4 py-3 rounded-xl border border-indigo-600 bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-indigo-600 transition-colors"
            />
          </div>

          <div className="md:col-span-1">
            <label className="block text-sm font-semibold text-gray-900 mb-2">Phone Number</label>
            <div className="flex gap-3">
              <div className="w-24 relative">
                <select className="w-full px-3 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-600 appearance-none bg-white">
                  <option>+880</option>
                </select>
              </div>
              <input
                type="tel"
                name="phone"
                value={formData.phone || ''}
                onChange={handleInputChange}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors"
                placeholder="1681 788 203"
              />
            </div>
          </div>

          <div className="md:col-span-1">
            <label className="block text-sm font-semibold text-gray-900 mb-2">Country</label>
            <div className="relative">
              <input
                type="text"
                name="country"
                value={formData.country || ''}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors appearance-none bg-white"
                placeholder="Bangladesh"
              />
            </div>
          </div>

          <div className="md:col-span-1">
            <label className="block text-sm font-semibold text-gray-900 mb-2">City</label>
            <div className="relative">
              <input
                type="text"
                name="city"
                value={formData.city || ''}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors appearance-none bg-white"
                placeholder="Sylhet"
              />
            </div>
          </div>

          <div className="md:col-span-1">
            <label className="block text-sm font-semibold text-gray-900 mb-2">Zip Code</label>
            <input
              type="text"
              name="zipCode"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors"
              placeholder="3100"
            />
          </div>
        </div>

        <div className="mt-12 p-6 bg-gray-50 rounded-2xl">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Account</h3>
          <div className="flex items-start gap-2 mb-4">
            <div className="mt-1">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
            </div>
            <p className="text-sm text-gray-500">
              After making a deletion request, you will have <span className="font-bold text-gray-900">"6 months"</span> to maintain this account.
            </p>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            To permanently erase your whole ProAcc account, click the button below. This implies that you won't have access to your enterprises, accounting and personal financial data.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            There is no reversing this action.
          </p>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isUpdating}
            className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {isUpdating ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileForm;
