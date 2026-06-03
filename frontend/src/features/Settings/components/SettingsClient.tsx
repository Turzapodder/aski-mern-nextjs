'use client';

import React, { useState } from 'react';
import { Save, User, Briefcase, Mail, MapPin, Globe } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import TutorProfileFields from '@/features/Profile/components/TutorProfileFields';
import { useSettingsLogic } from '../hooks/useSettingsLogic';

const SettingSection = ({ title, icon: Icon, children }: { title: string; icon?: React.ComponentType<any>; children: React.ReactNode }) => (
  <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm transition-all duration-200">
    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-50">
      {Icon && (
        <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
          <Icon className="w-5 h-5" />
        </div>
      )}
      <h3 className="text-xl font-bold text-gray-900 tracking-tight">{title}</h3>
    </div>
    {children}
  </div>
);

export const SettingsClient = () => {
  const {
    isLoading,
    user,
    message,
    settings,
    handleSettingChange,
    handleSave,
    isUpdating,
    availability,
    setAvailability,
  } = useSettingsLogic();

  const [activeTab, setActiveTab] = useState<'personal' | 'tutor'>('personal');

  if (isLoading) {
    return (
      <div className="w-full mx-auto space-y-8 animate-pulse p-4 max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-gray-100">
          <div className="space-y-3">
            <Skeleton className="h-8 w-48 rounded-xl" />
            <Skeleton className="h-4 w-80 rounded-lg" />
          </div>
          <Skeleton className="h-12 w-36 rounded-2xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-3 space-y-3">
            <Skeleton className="h-12 w-full rounded-2xl" />
            <Skeleton className="h-12 w-full rounded-2xl" />
          </div>
          <div className="lg:col-span-9">
            <div className="bg-white rounded-3xl border border-gray-100 p-8 space-y-6">
              <Skeleton className="h-6 w-32 rounded-lg" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2"><Skeleton className="h-4 w-20 rounded-lg" /><Skeleton className="h-10 w-full rounded-xl" /></div>
                <div className="space-y-2"><Skeleton className="h-4 w-20 rounded-lg" /><Skeleton className="h-10 w-full rounded-xl" /></div>
                <div className="space-y-2 md:col-span-2"><Skeleton className="h-4 w-20 rounded-lg" /><Skeleton className="h-24 w-full rounded-xl" /></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isTutor = user?.roles?.includes('tutor');

  return (
    <div className="w-full mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 mb-8 border-b border-gray-100/80">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Account Settings</h1>
            {isTutor ? (
              <span className="px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 text-[10px] font-bold border border-purple-100 uppercase tracking-wider">
                Tutor Portal
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-100 uppercase tracking-wider">
                Student Portal
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">
            Customize your personal credentials, working hours, and tutor profiles
          </p>
        </div>
        
        <button
          type="button"
          onClick={handleSave}
          disabled={isUpdating}
          className="mt-4 sm:mt-0 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center space-x-2 disabled:opacity-50 transition-all active:scale-[0.98] shadow-lg shadow-purple-100"
        >
          {isUpdating ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
          ) : (
            <Save size={16} />
          )}
          <span>{isUpdating ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </div>

      {message && (
        <div
          className={`mb-8 p-4 rounded-2xl border text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300 ${
            message.type === 'success'
              ? 'bg-green-50 border-green-100 text-green-700'
              : 'bg-red-50 border-red-100 text-red-700'
          }`}
        >
          <div className={`w-2.5 h-2.5 rounded-full ${message.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`} />
          {message.text}
        </div>
      )}

      {/* Main Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Navigation Sidebar (Only rendered if Tutor, otherwise keep flat) */}
        {isTutor && (
          <div className="lg:col-span-3 flex flex-row lg:flex-col gap-2 p-1.5 bg-gray-50/80 rounded-2xl lg:bg-transparent lg:p-0">
            <button
              onClick={() => setActiveTab('personal')}
              className={`flex-1 lg:flex-initial flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-200 ${
                activeTab === 'personal'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-100'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <User size={18} />
              <span>Personal Details</span>
            </button>
            <button
              onClick={() => setActiveTab('tutor')}
              className={`flex-1 lg:flex-initial flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-200 ${
                activeTab === 'tutor'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-100'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Briefcase size={18} />
              <span>Tutor Profile</span>
            </button>
          </div>
        )}

        {/* Form Container */}
        <div className={isTutor ? 'lg:col-span-9 space-y-6' : 'lg:col-span-12'}>
          {(!isTutor || activeTab === 'personal') && (
            <SettingSection title="Personal Information" icon={User}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={settings.name}
                    onChange={(e) => handleSettingChange('name', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50/50 hover:bg-gray-50 border border-gray-200 focus:border-purple-500 focus:bg-white rounded-2xl transition-all duration-200 outline-none text-gray-900 placeholder-gray-400 font-medium text-sm focus:ring-2 focus:ring-purple-100/50"
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={settings.email}
                      disabled
                      className="w-full px-4 py-3 bg-gray-50/80 border border-gray-100 rounded-2xl text-gray-400 font-medium text-sm cursor-not-allowed select-none"
                    />
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 bg-gray-100 text-gray-400 rounded-lg">
                      <Mail size={14} />
                    </div>
                  </div>
                  <p className="mt-1.5 text-xs text-gray-400">
                    Email is fixed and cannot be changed.
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Country
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={settings.country}
                      onChange={(e) => handleSettingChange('country', e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-gray-50/50 hover:bg-gray-50 border border-gray-200 focus:border-purple-500 focus:bg-white rounded-2xl transition-all duration-200 outline-none text-gray-900 placeholder-gray-400 font-medium text-sm focus:ring-2 focus:ring-purple-100/50"
                      placeholder="Bangladesh"
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <Globe size={16} />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    City
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={settings.city}
                      onChange={(e) => handleSettingChange('city', e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-gray-50/50 hover:bg-gray-50 border border-gray-200 focus:border-purple-500 focus:bg-white rounded-2xl transition-all duration-200 outline-none text-gray-900 placeholder-gray-400 font-medium text-sm focus:ring-2 focus:ring-purple-100/50"
                      placeholder="Sylhet"
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <MapPin size={16} />
                    </div>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Languages (comma separated)
                  </label>
                  <input
                    type="text"
                    value={settings.languages}
                    onChange={(e) => handleSettingChange('languages', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50/50 hover:bg-gray-50 border border-gray-200 focus:border-purple-500 focus:bg-white rounded-2xl transition-all duration-200 outline-none text-gray-900 placeholder-gray-400 font-medium text-sm focus:ring-2 focus:ring-purple-100/50"
                    placeholder="English, Bangla, Spanish"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Bio
                  </label>
                  <textarea
                    value={settings.bio}
                    onChange={(e) => handleSettingChange('bio', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-50/50 hover:bg-gray-50 border border-gray-200 focus:border-purple-500 focus:bg-white rounded-2xl transition-all duration-200 outline-none text-gray-900 placeholder-gray-400 font-medium text-sm focus:ring-2 focus:ring-purple-100/50 resize-none leading-relaxed"
                    placeholder="Tell others about your professional background, qualifications, and passions..."
                  />
                </div>
              </div>
            </SettingSection>
          )}

          {isTutor && activeTab === 'tutor' && (
            <SettingSection title="Tutoring & Availability Credentials" icon={Briefcase}>
              <TutorProfileFields
                variant="profile"
                values={{
                  professionalTitle: settings.professionalTitle,
                  qualification: settings.qualification,
                  currentInstitution: settings.currentInstitution,
                  teachingMode: settings.teachingMode || undefined,
                  hourlyRate: settings.hourlyRate,
                  halfHourlyRate: settings.halfHourlyRate,
                  allowedSessionDurations: settings.allowedSessionDurations,
                  offdays: settings.offdays,
                  experienceYears: settings.experienceYears,
                  expertiseSubjects: settings.expertiseSubjects,
                  skills: settings.skills,
                  achievements: settings.achievements,
                }}
                onChange={(field, value) => handleSettingChange(field, value)}
                availabilityValue={availability}
                onAvailabilityChange={setAvailability}
              />
            </SettingSection>
          )}
        </div>
      </div>
    </div>
  );
};
