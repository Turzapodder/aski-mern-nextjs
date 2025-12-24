"use client";

import React, { useState, useEffect } from "react";
import {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useUploadFilesMutation,
  UserProfile,
  ProfileUpdatePayload,
} from "@/lib/services/profile";
import {
  AlertCircle,
  Loader,
  X,
  CheckCircle,
} from "lucide-react";
import ProfileSidebar from "./ProfileSidebar";
import ProfileForm from "./ProfileForm";

interface ProfileEditorProps {
  userId: string;
  role?: string;
}

/**
 * ProfileEditor Component
 * Displays and manages user profile for both students and tutors
 * Real-time data fetching and updating
 */
export default function ProfileEditor({ userId, role }: ProfileEditorProps) {
  const {
    data: profileData,
    isLoading: isLoadingProfile,
    error: profileError,
  } = useGetProfileQuery(userId);
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const [uploadFiles, { isLoading: isUploading }] = useUploadFilesMutation();

  // State management
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState<ProfileUpdatePayload>({});
  const [activeTab, setActiveTab] = useState("personal");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Sync profile data when loaded
  useEffect(() => {
    if (profileData?.user) {
      setProfile(profileData.user);
      setFormData(profileData.user);
    }
  }, [profileData]);

  // Clear alerts after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  /**
   * Handle simple input changes
   */
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /**
   * Handle profile image upload
   */
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formDataObj = new FormData();
      formDataObj.append("profileImage", file);

      const result = await uploadFiles({
        userId,
        formData: formDataObj,
      }).unwrap();

      if (result.files.profileImage) {
        setFormData((prev) => ({
          ...prev,
          profileImage: result.files.profileImage!.url,
        }));
        setSuccess("Profile image updated successfully");
      }
    } catch (err: any) {
      setError(err?.data?.message || "Failed to upload image");
    }
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      // Validate required fields
      if (!formData.name || formData.name.trim().length < 2) {
        setError("Name must be at least 2 characters long");
        return;
      }

      const result = await updateProfile({
        userId,
        data: formData,
      }).unwrap();

      setProfile(result.user);
      setSuccess("Profile updated successfully!");
    } catch (err: any) {
      setError(
        err?.data?.message || "Failed to update profile. Please try again."
      );
    }
  };

  if (isLoadingProfile) {
    return (
      <div className='flex items-center justify-center min-h-screen bg-gray-50'>
        <div className='text-center'>
          <Loader className='w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4' />
          <p className='text-gray-600 font-medium'>Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className='flex items-center justify-center min-h-screen bg-gray-50'>
        <div className='bg-white p-8 rounded-xl shadow-lg w-full max-w-md'>
          <AlertCircle className='w-12 h-12 text-red-600 mx-auto mb-4' />
          <p className='text-gray-800 text-center font-semibold'>
            Failed to load profile
          </p>
          <p className='text-gray-600 text-center mt-2 text-sm'>
            Please refresh the page and try again
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen flex'>
      {/* Sidebar */}
      <ProfileSidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content */}
      <div className="flex-1 p-8">
        {/* Alerts */}
        {error && (
          <div className='mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <AlertCircle className='w-5 h-5 text-red-600' />
              <span className='text-red-800'>{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className='text-red-600 hover:text-red-800'
            >
              <X className='w-4 h-4' />
            </button>
          </div>
        )}

        {/* Content based on active tab */}
        {activeTab === 'personal' ? (
          <ProfileForm
            profile={profile}
            formData={formData}
            handleInputChange={handleInputChange}
            handleImageUpload={handleImageUpload}
            handleSubmit={handleSubmit}
            isUpdating={isUpdating}
            isUploading={isUploading}
            success={success}
          />
        ) : (
          <div className="bg-white p-8 rounded-xl shadow-sm h-full flex items-center justify-center text-gray-500">
            Content for {activeTab} will be implemented soon.
          </div>
        )}
      </div>
    </div>
  );
}
