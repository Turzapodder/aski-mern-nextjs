"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useUploadFilesMutation,
  UserProfile,
  ProfileUpdatePayload,
} from "@/lib/services/profile";
import {
  User,
  BookOpen,
  Award,
  FileText,
  Upload,
  AlertCircle,
  CheckCircle,
  Loader,
  X,
  Plus,
} from "lucide-react";
import Image from "next/image";

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
  const [isEditing, setIsEditing] = useState(false);
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
   * Handle nested object changes (tutor/student profiles)
   */
  const handleNestedChange = (section: string, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...(prev[section as keyof ProfileUpdatePayload] as any),
        [field]: value,
      },
    }));
  };

  /**
   * Handle array field changes - ROOT LEVEL (languages)
   */
  const updateRootArrayField = (
    field: string,
    index: number,
    value: string
  ) => {
    setFormData((prev) => {
      const array = Array.isArray(prev[field as keyof ProfileUpdatePayload])
        ? [...(prev[field as keyof ProfileUpdatePayload] as string[])]
        : [];
      array[index] = value;
      return {
        ...prev,
        [field]: array,
      };
    });
  };

  /**
   * Handle array field changes - NESTED (tutorProfile/studentProfile)
   */
  const updateArrayField = (
    section: string,
    field: string,
    index: number,
    value: string
  ) => {
    setFormData((prev) => {
      const section_data = prev[section as keyof ProfileUpdatePayload] as any;
      const array = Array.isArray(section_data?.[field])
        ? [...section_data[field]]
        : [];
      array[index] = value;
      return {
        ...prev,
        [section]: {
          ...section_data,
          [field]: array,
        },
      };
    });
  };

  /**
   * Add new array item - ROOT LEVEL
   */
  const addRootArrayItem = (field: string) => {
    setFormData((prev) => {
      const array = Array.isArray(prev[field as keyof ProfileUpdatePayload])
        ? [...(prev[field as keyof ProfileUpdatePayload] as string[])]
        : [];
      array.push("");
      return {
        ...prev,
        [field]: array,
      };
    });
  };

  /**
   * Add new array item - NESTED
   */
  const addArrayItem = (section: string, field: string) => {
    setFormData((prev) => {
      const section_data = prev[section as keyof ProfileUpdatePayload] as any;
      const array = Array.isArray(section_data?.[field])
        ? [...section_data[field]]
        : [];
      array.push("");
      return {
        ...prev,
        [section]: {
          ...section_data,
          [field]: array,
        },
      };
    });
  };

  /**
   * Remove array item - ROOT LEVEL
   */
  const removeRootArrayItem = (field: string, index: number) => {
    setFormData((prev) => {
      const array = (
        (prev[field as keyof ProfileUpdatePayload] as string[]) || []
      ).filter((_: any, i: number) => i !== index);
      return {
        ...prev,
        [field]: array,
      };
    });
  };

  /**
   * Remove array item - NESTED
   */
  const removeArrayItem = (section: string, field: string, index: number) => {
    setFormData((prev) => {
      const section_data = prev[section as keyof ProfileUpdatePayload] as any;
      const array = (section_data?.[field] || []).filter(
        (_: any, i: number) => i !== index
      );
      return {
        ...prev,
        [section]: {
          ...section_data,
          [field]: array,
        },
      };
    });
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
   * Handle document uploads
   */
  const handleDocumentsUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    section: string
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      const formDataObj = new FormData();
      Array.from(files).forEach((file) => {
        formDataObj.append("documents", file);
      });

      const result = await uploadFiles({
        userId,
        formData: formDataObj,
      }).unwrap();

      if (result.files.documents) {
        handleNestedChange(section, "documents", result.files.documents);
        setSuccess("Documents uploaded successfully");
      }
    } catch (err: any) {
      setError(err?.data?.message || "Failed to upload documents");
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
      setIsEditing(false);
    } catch (err: any) {
      setError(
        err?.data?.message || "Failed to update profile. Please try again."
      );
    }
  };

  /**
   * Calculate profile completion percentage
   */
  const completion = useMemo(() => {
    if (!profile) return 0;

    let filled = 0;
    let total = 0;

    // Common fields
    const commonFields = [
      "name",
      "phone",
      "country",
      "city",
      "about",
      "profileImage",
    ];
    commonFields.forEach((field) => {
      total++;
      if (profile[field as keyof UserProfile]) filled++;
    });

    // Tutor fields
    if (profile.roles?.includes("tutor") && profile.tutorProfile) {
      const tutorFields = [
        "qualification",
        "experienceYears",
        "hourlyRate",
        "teachingMode",
      ];
      tutorFields.forEach((field) => {
        total++;
        const value =
          profile.tutorProfile![field as keyof typeof profile.tutorProfile];
        if (value) filled++;
      });

      if (profile.tutorProfile.expertiseSubjects?.length) filled++;
      total++;
    }

    // Student fields
    if (profile.roles?.includes("user") && profile.studentProfile) {
      const studentFields = ["institutionName", "degree", "yearOfStudy"];
      studentFields.forEach((field) => {
        total++;
        const value =
          profile.studentProfile![field as keyof typeof profile.studentProfile];
        if (value) filled++;
      });
    }

    return total > 0 ? Math.round((filled / total) * 100) : 0;
  }, [profile]);

  const isTutor = profile?.roles?.includes("tutor");
  const isStudent = profile?.roles?.includes("user");

  if (isLoadingProfile) {
    return (
      <div className='flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100'>
        <div className='text-center'>
          <Loader className='w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4' />
          <p className='text-gray-600 font-medium'>Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className='flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100'>
        <div className='bg-white p-8 rounded-xl shadow-lg w-full'>
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
    <div className='min-h-screen'>
      <div className='w-full mx-auto px-4'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-4xl font-bold text-gray-900 mb-2'>My Profile</h1>
          <p className='text-gray-600'>
            Manage your account information and preferences
          </p>
        </div>

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

        {success && (
          <div className='mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <CheckCircle className='w-5 h-5 text-green-600' />
              <span className='text-green-800'>{success}</span>
            </div>
            <button
              onClick={() => setSuccess(null)}
              className='text-green-600 hover:text-green-800'
            >
              <X className='w-4 h-4' />
            </button>
          </div>
        )}

        {/* Main Card */}
        <div className='bg-white rounded-xl shadow-lg overflow-hidden'>
          {/* Header Section */}
          <div className='bg-gradient-to-r from-indigo-600 to-blue-600 px-8 py-12'>
            <div className='flex items-end gap-6 mb-8'>
              {/* Avatar */}
              <div className='relative group'>
                <div className='w-24 h-24 rounded-full bg-white flex items-center justify-center border-4 border-indigo-300 overflow-hidden'>
                  {formData.profileImage ? (
                    <Image
                      src={
                        formData?.profileImage || "/images/default-avatar.png"
                      }
                      alt='Profile'
                      height={100}
                      width={100}
                      className='rounded-full h-full w-full object-cover'
                    />
                  ) : (
                    <User className='w-12 h-12 text-indigo-600' />
                  )}
                </div>
                {isEditing && (
                  <label className='absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition'>
                    <Upload className='w-6 h-6 text-white' />
                    <input
                      type='file'
                      accept='image/*'
                      onChange={handleImageUpload}
                      className='hidden'
                      disabled={isUploading}
                    />
                  </label>
                )}
              </div>

              {/* User Info */}
              <div className='text-white flex-1'>
                <h2 className='text-3xl font-bold'>{profile?.name}</h2>
                <p className='text-indigo-100'>{profile?.email}</p>
                <div className='mt-3 flex gap-2'>
                  {isTutor && (
                    <span
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${
                        profile?.tutorProfile?.verificationStatus === "Verified"
                          ? "bg-green-400 text-green-900"
                          : "bg-yellow-400 text-yellow-900"
                      }`}
                    >
                      <Award className='w-4 h-4' />
                      Tutor
                      {profile?.tutorProfile?.verificationStatus ===
                        "Verified" && <CheckCircle className='w-4 h-4' />}
                    </span>
                  )}
                  {isStudent && (
                    <span className='inline-flex items-center gap-2 px-3 py-1 bg-blue-400 text-blue-900 rounded-full text-sm font-semibold'>
                      <BookOpen className='w-4 h-4' />
                      Student
                    </span>
                  )}
                </div>
              </div>

              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className='px-6 py-2 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-indigo-50 transition'
                >
                  Edit Profile
                </button>
              )}
            </div>

            {/* Progress Bar */}
            <div className='pt-6 border-t border-indigo-300'>
              <div className='flex items-center justify-between mb-2'>
                <span className='text-indigo-100 font-medium'>
                  Profile Completion
                </span>
                <span className='text-white font-bold text-lg'>
                  {completion}%
                </span>
              </div>
              <div className='w-full bg-indigo-300 rounded-full h-3 overflow-hidden'>
                <div
                  className='bg-white h-full rounded-full transition-all duration-500'
                  style={{ width: `${completion}%` }}
                />
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className='border-b border-gray-200 px-8 flex gap-6'>
            <button
              onClick={() => setActiveTab("personal")}
              className={`py-4 px-2 font-semibold border-b-2 transition ${
                activeTab === "personal"
                  ? "text-indigo-600 border-indigo-600"
                  : "text-gray-600 border-transparent hover:text-gray-800"
              }`}
            >
              Personal
            </button>
            {isTutor && (
              <button
                onClick={() => setActiveTab("tutor")}
                className={`py-4 px-2 font-semibold border-b-2 transition ${
                  activeTab === "tutor"
                    ? "text-indigo-600 border-indigo-600"
                    : "text-gray-600 border-transparent hover:text-gray-800"
                }`}
              >
                Professional
              </button>
            )}
            {isStudent && (
              <button
                onClick={() => setActiveTab("student")}
                className={`py-4 px-2 font-semibold border-b-2 transition ${
                  activeTab === "student"
                    ? "text-indigo-600 border-indigo-600"
                    : "text-gray-600 border-transparent hover:text-gray-800"
                }`}
              >
                Academic
              </button>
            )}
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className='px-8 py-8 space-y-6'>
            {/* Personal Tab */}
            {activeTab === "personal" && (
              <div className='space-y-6'>
                {/* Grid Layout */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  {/* Name */}
                  <div>
                    <label className='block text-sm font-semibold text-gray-700 mb-2'>
                      Full Name *
                    </label>
                    {isEditing ? (
                      <input
                        type='text'
                        name='name'
                        value={formData.name || ""}
                        onChange={handleInputChange}
                        required
                        className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 transition'
                      />
                    ) : (
                      <p className='text-gray-800 font-medium py-2'>
                        {profile?.name}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className='block text-sm font-semibold text-gray-700 mb-2'>
                      Email
                    </label>
                    <p className='text-gray-800 font-medium py-2'>
                      {profile?.email}
                    </p>
                    <p className='text-xs text-gray-500'>Cannot be changed</p>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className='block text-sm font-semibold text-gray-700 mb-2'>
                      Phone Number
                    </label>
                    {isEditing ? (
                      <input
                        type='tel'
                        name='phone'
                        value={formData.phone || ""}
                        onChange={handleInputChange}
                        className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200'
                      />
                    ) : (
                      <p className='text-gray-800 font-medium py-2'>
                        {profile?.phone || "Not provided"}
                      </p>
                    )}
                  </div>

                  {/* Gender */}
                  <div>
                    <label className='block text-sm font-semibold text-gray-700 mb-2'>
                      Gender
                    </label>
                    {isEditing ? (
                      <select
                        name='gender'
                        value={formData.gender || ""}
                        onChange={handleInputChange}
                        className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200'
                      >
                        <option value=''>Select Gender</option>
                        <option value='Male'>Male</option>
                        <option value='Female'>Female</option>
                        <option value='Other'>Other</option>
                      </select>
                    ) : (
                      <p className='text-gray-800 font-medium py-2'>
                        {profile?.gender || "Not specified"}
                      </p>
                    )}
                  </div>

                  {/* Country */}
                  <div>
                    <label className='block text-sm font-semibold text-gray-700 mb-2'>
                      Country
                    </label>
                    {isEditing ? (
                      <input
                        type='text'
                        name='country'
                        value={formData.country || ""}
                        onChange={handleInputChange}
                        className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200'
                      />
                    ) : (
                      <p className='text-gray-800 font-medium py-2'>
                        {profile?.country || "Not provided"}
                      </p>
                    )}
                  </div>

                  {/* City */}
                  <div>
                    <label className='block text-sm font-semibold text-gray-700 mb-2'>
                      City
                    </label>
                    {isEditing ? (
                      <input
                        type='text'
                        name='city'
                        value={formData.city || ""}
                        onChange={handleInputChange}
                        className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200'
                      />
                    ) : (
                      <p className='text-gray-800 font-medium py-2'>
                        {profile?.city || "Not provided"}
                      </p>
                    )}
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-2'>
                    Address
                  </label>
                  {isEditing ? (
                    <input
                      type='text'
                      name='address'
                      value={formData.address || ""}
                      onChange={handleInputChange}
                      className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200'
                    />
                  ) : (
                    <p className='text-gray-800 font-medium py-2'>
                      {profile?.address || "Not provided"}
                    </p>
                  )}
                </div>

                {/* About Me */}
                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-2'>
                    About Me
                  </label>
                  {isEditing ? (
                    <textarea
                      name='about'
                      value={formData.about || ""}
                      onChange={handleInputChange}
                      rows={4}
                      className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 resize-none'
                    />
                  ) : (
                    <p className='text-gray-800 py-2'>
                      {profile?.about || "Not provided"}
                    </p>
                  )}
                </div>

                {/* Languages */}
                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-3'>
                    Languages
                  </label>
                  {isEditing ? (
                    <div className='space-y-2'>
                      {(formData.languages || []).map((lang, idx) => (
                        <div key={idx} className='flex gap-2'>
                          <input
                            type='text'
                            value={lang}
                            onChange={(e) =>
                              updateRootArrayField(
                                "languages",
                                idx,
                                e.target.value
                              )
                            }
                            placeholder='Enter language'
                            className='flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600'
                          />
                          <button
                            type='button'
                            onClick={() =>
                              removeRootArrayItem("languages", idx)
                            }
                            className='px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition'
                          >
                            <X className='w-5 h-5' />
                          </button>
                        </div>
                      ))}
                      <button
                        type='button'
                        onClick={() => addRootArrayItem("languages")}
                        className='mt-2 px-4 py-2 text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 flex items-center gap-2 transition'
                      >
                        <Plus className='w-4 h-4' />
                        Add Language
                      </button>
                    </div>
                  ) : (
                    <div className='flex flex-wrap gap-2'>
                      {(profile?.languages || []).map((lang, idx) => (
                        <span
                          key={idx}
                          className='px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium'
                        >
                          {lang}
                        </span>
                      ))}
                      {(!profile?.languages ||
                        profile.languages.length === 0) && (
                        <p className='text-gray-500'>No languages added</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tutor Tab */}
            {activeTab === "tutor" && isTutor && (
              <div className='space-y-6'>
                {profile?.tutorProfile?.verificationStatus === "Verified" && (
                  <div className='p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3'>
                    <CheckCircle className='w-5 h-5 text-green-600' />
                    <span className='text-green-800 font-medium'>
                      Your profile is verified
                    </span>
                  </div>
                )}

                {/* Professional Fields */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div>
                    <label className='block text-sm font-semibold text-gray-700 mb-2'>
                      Professional Title
                    </label>
                    {isEditing ? (
                      <input
                        type='text'
                        value={formData.tutorProfile?.professionalTitle || ""}
                        onChange={(e) =>
                          handleNestedChange(
                            "tutorProfile",
                            "professionalTitle",
                            e.target.value
                          )
                        }
                        className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200'
                      />
                    ) : (
                      <p className='text-gray-800 font-medium py-2'>
                        {profile?.tutorProfile?.professionalTitle ||
                          "Not provided"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className='block text-sm font-semibold text-gray-700 mb-2'>
                      Qualification *
                    </label>
                    {isEditing ? (
                      <input
                        type='text'
                        value={formData.tutorProfile?.qualification || ""}
                        onChange={(e) =>
                          handleNestedChange(
                            "tutorProfile",
                            "qualification",
                            e.target.value
                          )
                        }
                        required
                        className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200'
                      />
                    ) : (
                      <p className='text-gray-800 font-medium py-2'>
                        {profile?.tutorProfile?.qualification || "Not provided"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className='block text-sm font-semibold text-gray-700 mb-2'>
                      Experience (Years)
                    </label>
                    {isEditing ? (
                      <input
                        type='number'
                        value={formData.tutorProfile?.experienceYears || ""}
                        onChange={(e) =>
                          handleNestedChange(
                            "tutorProfile",
                            "experienceYears",
                            parseInt(e.target.value) || 0
                          )
                        }
                        min='0'
                        className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200'
                      />
                    ) : (
                      <p className='text-gray-800 font-medium py-2'>
                        {profile?.tutorProfile?.experienceYears ||
                          "Not provided"}{" "}
                        years
                      </p>
                    )}
                  </div>

                  <div>
                    <label className='block text-sm font-semibold text-gray-700 mb-2'>
                      Hourly Rate (৳) *
                    </label>
                    {isEditing ? (
                      <input
                        type='number'
                        value={formData.tutorProfile?.hourlyRate || ""}
                        onChange={(e) =>
                          handleNestedChange(
                            "tutorProfile",
                            "hourlyRate",
                            parseInt(e.target.value) || 0
                          )
                        }
                        min='0'
                        required
                        className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200'
                      />
                    ) : (
                      <p className='text-gray-800 font-medium py-2'>
                        {profile?.tutorProfile?.hourlyRate || "Not provided"} ৳
                      </p>
                    )}
                  </div>

                  <div>
                    <label className='block text-sm font-semibold text-gray-700 mb-2'>
                      Current Institution
                    </label>
                    {isEditing ? (
                      <input
                        type='text'
                        value={formData.tutorProfile?.currentInstitution || ""}
                        onChange={(e) =>
                          handleNestedChange(
                            "tutorProfile",
                            "currentInstitution",
                            e.target.value
                          )
                        }
                        className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200'
                      />
                    ) : (
                      <p className='text-gray-800 font-medium py-2'>
                        {profile?.tutorProfile?.currentInstitution ||
                          "Not provided"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className='block text-sm font-semibold text-gray-700 mb-2'>
                      Teaching Mode *
                    </label>
                    {isEditing ? (
                      <select
                        value={formData.tutorProfile?.teachingMode || ""}
                        onChange={(e) =>
                          handleNestedChange(
                            "tutorProfile",
                            "teachingMode",
                            e.target.value
                          )
                        }
                        required
                        className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200'
                      >
                        <option value=''>Select Mode</option>
                        <option value='Online'>Online</option>
                        <option value='Offline'>Offline</option>
                        <option value='Hybrid'>Hybrid</option>
                      </select>
                    ) : (
                      <p className='text-gray-800 font-medium py-2'>
                        {profile?.tutorProfile?.teachingMode || "Not specified"}
                      </p>
                    )}
                  </div>
                </div>

                {/* Expertise Subjects */}
                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-3'>
                    Expertise Subjects *
                  </label>
                  {isEditing ? (
                    <div className='space-y-2'>
                      {(formData.tutorProfile?.expertiseSubjects || []).map(
                        (subject, idx) => (
                          <div key={idx} className='flex gap-2'>
                            <input
                              type='text'
                              value={subject}
                              onChange={(e) =>
                                updateArrayField(
                                  "tutorProfile",
                                  "expertiseSubjects",
                                  idx,
                                  e.target.value
                                )
                              }
                              placeholder='Enter subject'
                              className='flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600'
                            />
                            <button
                              type='button'
                              onClick={() =>
                                removeArrayItem(
                                  "tutorProfile",
                                  "expertiseSubjects",
                                  idx
                                )
                              }
                              className='px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition'
                            >
                              <X className='w-5 h-5' />
                            </button>
                          </div>
                        )
                      )}
                      <button
                        type='button'
                        onClick={() =>
                          addArrayItem("tutorProfile", "expertiseSubjects")
                        }
                        className='mt-2 px-4 py-2 text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 flex items-center gap-2 transition'
                      >
                        <Plus className='w-4 h-4' />
                        Add Subject
                      </button>
                    </div>
                  ) : (
                    <div className='flex flex-wrap gap-2'>
                      {(profile?.tutorProfile?.expertiseSubjects || []).map(
                        (subject, idx) => (
                          <span
                            key={idx}
                            className='px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium'
                          >
                            {subject}
                          </span>
                        )
                      )}
                      {(!profile?.tutorProfile?.expertiseSubjects ||
                        profile.tutorProfile.expertiseSubjects.length ===
                          0) && (
                        <p className='text-gray-500'>No subjects added</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Achievements */}
                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-2'>
                    Achievements
                  </label>
                  {isEditing ? (
                    <textarea
                      value={formData.tutorProfile?.achievements || ""}
                      onChange={(e) =>
                        handleNestedChange(
                          "tutorProfile",
                          "achievements",
                          e.target.value
                        )
                      }
                      rows={4}
                      placeholder='List your achievements, awards, certifications...'
                      className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 resize-none'
                    />
                  ) : (
                    <p className='text-gray-800 py-2'>
                      {profile?.tutorProfile?.achievements || "Not provided"}
                    </p>
                  )}
                </div>

                {/* Documents */}
                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-3'>
                    Documents (Certificates, ID, etc.)
                  </label>
                  {isEditing && (
                    <label className='block px-4 py-3 border-2 border-dashed border-indigo-300 rounded-lg cursor-pointer hover:bg-indigo-50 transition mb-3'>
                      <span className='flex items-center gap-2 text-indigo-600 font-medium'>
                        <Upload className='w-5 h-5' />
                        Click to upload documents
                      </span>
                      <input
                        type='file'
                        multiple
                        accept='.pdf,.doc,.docx,.jpg,.jpeg,.png'
                        onChange={(e) =>
                          handleDocumentsUpload(e, "tutorProfile")
                        }
                        className='hidden'
                        disabled={isUploading}
                      />
                    </label>
                  )}
                  {(profile?.tutorProfile?.documents || []).length > 0 && (
                    <div className='space-y-2'>
                      {profile?.tutorProfile?.documents?.map((doc, idx) => (
                        <a
                          key={idx}
                          href={doc.url}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition'
                        >
                          <FileText className='w-5 h-5 text-gray-600' />
                          <span className='text-gray-800 font-medium flex-1'>
                            {doc.originalName}
                          </span>
                          <span className='text-xs text-gray-500'>
                            {(doc.size / 1024).toFixed(0)} KB
                          </span>
                        </a>
                      ))}
                    </div>
                  )}
                  {(!profile?.tutorProfile?.documents ||
                    profile.tutorProfile.documents.length === 0) &&
                    !isEditing && (
                      <p className='text-gray-500'>No documents uploaded</p>
                    )}
                </div>
              </div>
            )}

            {/* Student Tab */}
            {activeTab === "student" && isStudent && (
              <div className='space-y-6'>
                {/* Academic Fields */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div>
                    <label className='block text-sm font-semibold text-gray-700 mb-2'>
                      Institution Name *
                    </label>
                    {isEditing ? (
                      <input
                        type='text'
                        value={formData.studentProfile?.institutionName || ""}
                        onChange={(e) =>
                          handleNestedChange(
                            "studentProfile",
                            "institutionName",
                            e.target.value
                          )
                        }
                        required
                        className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200'
                      />
                    ) : (
                      <p className='text-gray-800 font-medium py-2'>
                        {profile?.studentProfile?.institutionName ||
                          "Not provided"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className='block text-sm font-semibold text-gray-700 mb-2'>
                      Institution Type
                    </label>
                    {isEditing ? (
                      <select
                        value={formData.studentProfile?.institutionType || ""}
                        onChange={(e) =>
                          handleNestedChange(
                            "studentProfile",
                            "institutionType",
                            e.target.value
                          )
                        }
                        className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200'
                      >
                        <option value=''>Select Type</option>
                        <option value='College'>College</option>
                        <option value='University'>University</option>
                        <option value='High School'>High School</option>
                        <option value='Other'>Other</option>
                      </select>
                    ) : (
                      <p className='text-gray-800 font-medium py-2'>
                        {profile?.studentProfile?.institutionType ||
                          "Not specified"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className='block text-sm font-semibold text-gray-700 mb-2'>
                      Department
                    </label>
                    {isEditing ? (
                      <input
                        type='text'
                        value={formData.studentProfile?.department || ""}
                        onChange={(e) =>
                          handleNestedChange(
                            "studentProfile",
                            "department",
                            e.target.value
                          )
                        }
                        className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200'
                      />
                    ) : (
                      <p className='text-gray-800 font-medium py-2'>
                        {profile?.studentProfile?.department || "Not provided"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className='block text-sm font-semibold text-gray-700 mb-2'>
                      Degree/Program *
                    </label>
                    {isEditing ? (
                      <input
                        type='text'
                        value={formData.studentProfile?.degree || ""}
                        onChange={(e) =>
                          handleNestedChange(
                            "studentProfile",
                            "degree",
                            e.target.value
                          )
                        }
                        required
                        placeholder='e.g., Bachelor of Science'
                        className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200'
                      />
                    ) : (
                      <p className='text-gray-800 font-medium py-2'>
                        {profile?.studentProfile?.degree || "Not provided"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className='block text-sm font-semibold text-gray-700 mb-2'>
                      Year of Study *
                    </label>
                    {isEditing ? (
                      <input
                        type='text'
                        value={formData.studentProfile?.yearOfStudy || ""}
                        onChange={(e) =>
                          handleNestedChange(
                            "studentProfile",
                            "yearOfStudy",
                            e.target.value
                          )
                        }
                        required
                        placeholder='e.g., 1st Year, 2nd Year'
                        className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200'
                      />
                    ) : (
                      <p className='text-gray-800 font-medium py-2'>
                        {profile?.studentProfile?.yearOfStudy || "Not provided"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className='block text-sm font-semibold text-gray-700 mb-2'>
                      Student ID
                    </label>
                    {isEditing ? (
                      <input
                        type='text'
                        value={formData.studentProfile?.studentID || ""}
                        onChange={(e) =>
                          handleNestedChange(
                            "studentProfile",
                            "studentID",
                            e.target.value
                          )
                        }
                        className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200'
                      />
                    ) : (
                      <p className='text-gray-800 font-medium py-2'>
                        {profile?.studentProfile?.studentID || "Not provided"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className='block text-sm font-semibold text-gray-700 mb-2'>
                      CGPA
                    </label>
                    {isEditing ? (
                      <input
                        type='text'
                        value={formData.studentProfile?.cgpa || ""}
                        onChange={(e) =>
                          handleNestedChange(
                            "studentProfile",
                            "cgpa",
                            e.target.value
                          )
                        }
                        placeholder='e.g., 3.5'
                        className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200'
                      />
                    ) : (
                      <p className='text-gray-800 font-medium py-2'>
                        {profile?.studentProfile?.cgpa || "Not provided"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className='block text-sm font-semibold text-gray-700 mb-2'>
                      Guardian Contact
                    </label>
                    {isEditing ? (
                      <input
                        type='tel'
                        value={formData.studentProfile?.guardianContact || ""}
                        onChange={(e) =>
                          handleNestedChange(
                            "studentProfile",
                            "guardianContact",
                            e.target.value
                          )
                        }
                        className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200'
                      />
                    ) : (
                      <p className='text-gray-800 font-medium py-2'>
                        {profile?.studentProfile?.guardianContact ||
                          "Not provided"}
                      </p>
                    )}
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-3'>
                    Skills
                  </label>
                  {isEditing ? (
                    <div className='space-y-2'>
                      {(formData.studentProfile?.skills || []).map(
                        (skill, idx) => (
                          <div key={idx} className='flex gap-2'>
                            <input
                              type='text'
                              value={skill}
                              onChange={(e) =>
                                updateArrayField(
                                  "studentProfile",
                                  "skills",
                                  idx,
                                  e.target.value
                                )
                              }
                              placeholder='Enter skill'
                              className='flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600'
                            />
                            <button
                              type='button'
                              onClick={() =>
                                removeArrayItem("studentProfile", "skills", idx)
                              }
                              className='px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition'
                            >
                              <X className='w-5 h-5' />
                            </button>
                          </div>
                        )
                      )}
                      <button
                        type='button'
                        onClick={() => addArrayItem("studentProfile", "skills")}
                        className='mt-2 px-4 py-2 text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 flex items-center gap-2 transition'
                      >
                        <Plus className='w-4 h-4' />
                        Add Skill
                      </button>
                    </div>
                  ) : (
                    <div className='flex flex-wrap gap-2'>
                      {(profile?.studentProfile?.skills || []).map(
                        (skill, idx) => (
                          <span
                            key={idx}
                            className='px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium'
                          >
                            {skill}
                          </span>
                        )
                      )}
                      {(!profile?.studentProfile?.skills ||
                        profile.studentProfile.skills.length === 0) && (
                        <p className='text-gray-500'>No skills added</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Interests */}
                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-3'>
                    Interests
                  </label>
                  {isEditing ? (
                    <div className='space-y-2'>
                      {(formData.studentProfile?.interests || []).map(
                        (interest, idx) => (
                          <div key={idx} className='flex gap-2'>
                            <input
                              type='text'
                              value={interest}
                              onChange={(e) =>
                                updateArrayField(
                                  "studentProfile",
                                  "interests",
                                  idx,
                                  e.target.value
                                )
                              }
                              placeholder='Enter interest'
                              className='flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600'
                            />
                            <button
                              type='button'
                              onClick={() =>
                                removeArrayItem(
                                  "studentProfile",
                                  "interests",
                                  idx
                                )
                              }
                              className='px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition'
                            >
                              <X className='w-5 h-5' />
                            </button>
                          </div>
                        )
                      )}
                      <button
                        type='button'
                        onClick={() =>
                          addArrayItem("studentProfile", "interests")
                        }
                        className='mt-2 px-4 py-2 text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 flex items-center gap-2 transition'
                      >
                        <Plus className='w-4 h-4' />
                        Add Interest
                      </button>
                    </div>
                  ) : (
                    <div className='flex flex-wrap gap-2'>
                      {(profile?.studentProfile?.interests || []).map(
                        (interest, idx) => (
                          <span
                            key={idx}
                            className='px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium'
                          >
                            {interest}
                          </span>
                        )
                      )}
                      {(!profile?.studentProfile?.interests ||
                        profile.studentProfile.interests.length === 0) && (
                        <p className='text-gray-500'>No interests added</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Documents */}
                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-3'>
                    Documents (ID, Transcript, etc.)
                  </label>
                  {isEditing && (
                    <label className='block px-4 py-3 border-2 border-dashed border-indigo-300 rounded-lg cursor-pointer hover:bg-indigo-50 transition mb-3'>
                      <span className='flex items-center gap-2 text-indigo-600 font-medium'>
                        <Upload className='w-5 h-5' />
                        Click to upload documents
                      </span>
                      <input
                        type='file'
                        multiple
                        accept='.pdf,.doc,.docx,.jpg,.jpeg,.png'
                        onChange={(e) =>
                          handleDocumentsUpload(e, "studentProfile")
                        }
                        className='hidden'
                        disabled={isUploading}
                      />
                    </label>
                  )}
                  {(profile?.studentProfile?.documents || []).length > 0 && (
                    <div className='space-y-2'>
                      {profile?.studentProfile?.documents?.map((doc, idx) => (
                        <a
                          key={idx}
                          href={doc.url}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition'
                        >
                          <FileText className='w-5 h-5 text-gray-600' />
                          <span className='text-gray-800 font-medium flex-1'>
                            {doc.originalName}
                          </span>
                          <span className='text-xs text-gray-500'>
                            {(doc.size / 1024).toFixed(0)} KB
                          </span>
                        </a>
                      ))}
                    </div>
                  )}
                  {(!profile?.studentProfile?.documents ||
                    profile.studentProfile.documents.length === 0) &&
                    !isEditing && (
                      <p className='text-gray-500'>No documents uploaded</p>
                    )}
                </div>
              </div>
            )}

            {/* Form Actions */}
            {isEditing && (
              <div className='border-t border-gray-200 pt-6 flex gap-4'>
                <button
                  type='submit'
                  disabled={isUpdating || isUploading}
                  className='flex-1 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition'
                >
                  {isUpdating ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type='button'
                  onClick={() => {
                    setIsEditing(false);
                    setFormData(profile || {});
                  }}
                  className='flex-1 px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition'
                >
                  Cancel
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
