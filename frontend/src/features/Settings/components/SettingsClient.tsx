'use client';

import React, { useState } from 'react';
import { Save, User, Briefcase, Mail, MapPin, Globe, CreditCard } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import TutorProfileFields from '@/features/Profile/components/TutorProfileFields';
import { useSettingsLogic } from '../hooks/useSettingsLogic';

const SettingSection = ({ title, icon: Icon, children }: { title: string; icon?: React.ComponentType<any>; children: React.ReactNode }) => (
  <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm transition-all duration-200">
    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-50">
      {Icon && (
        <div className="p-2.5 rounded-xl bg-black text-white">
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

  const [activeTab, setActiveTab] = useState<'personal' | 'tutor' | 'bank'>('personal');

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
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Profile Settings</h1>
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
          className="mt-4 sm:mt-0 bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center space-x-2 disabled:opacity-50 transition-all active:scale-[0.98] shadow-lg shadow-gray-200"
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
                  ? 'bg-black text-white shadow-md shadow-gray-200'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <User size={18} />
              <span>Personal Details</span>
            </button>
            <button
              onClick={() => setActiveTab('tutor')}
              className={`flex-1 lg:flex-initial flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-200 ${
                activeTab === 'tutor'
                  ? 'bg-black text-white shadow-md shadow-gray-200'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <Briefcase size={18} />
              <span>Tutor Profile</span>
            </button>
            <button
              onClick={() => setActiveTab('bank')}
              className={`flex-1 lg:flex-initial flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-200 ${
                activeTab === 'bank'
                  ? 'bg-black text-white shadow-md shadow-gray-200'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <CreditCard size={18} />
              <span>Bank Information</span>
            </button>
          </div>
        )}

        {/* Form Container */}
        <div className={isTutor ? 'lg:col-span-9 space-y-6' : 'lg:col-span-12'}>
          {(!isTutor || activeTab === 'personal') && (
            <SettingSection title="Personal Information" icon={User}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={settings.name}
                    onChange={(e) => handleSettingChange('name', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50/50 hover:bg-gray-50 border border-gray-200 focus:border-black focus:bg-white rounded-2xl transition-all duration-200 outline-none text-gray-900 placeholder-gray-400 font-medium text-sm focus:ring-2 focus:ring-black/10"
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
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
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Country
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={settings.country}
                      onChange={(e) => handleSettingChange('country', e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-gray-50/50 hover:bg-gray-50 border border-gray-200 focus:border-black focus:bg-white rounded-2xl transition-all duration-200 outline-none text-gray-900 placeholder-gray-400 font-medium text-sm focus:ring-2 focus:ring-black/10"
                      placeholder="Bangladesh"
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <Globe size={16} />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    City
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={settings.city}
                      onChange={(e) => handleSettingChange('city', e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-gray-50/50 hover:bg-gray-50 border border-gray-200 focus:border-black focus:bg-white rounded-2xl transition-all duration-200 outline-none text-gray-900 placeholder-gray-400 font-medium text-sm focus:ring-2 focus:ring-black/10"
                      placeholder="Sylhet"
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <MapPin size={16} />
                    </div>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Languages (comma separated)
                  </label>
                  <input
                    type="text"
                    value={settings.languages}
                    onChange={(e) => handleSettingChange('languages', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50/50 hover:bg-gray-50 border border-gray-200 focus:border-black focus:bg-white rounded-2xl transition-all duration-200 outline-none text-gray-900 placeholder-gray-400 font-medium text-sm focus:ring-2 focus:ring-black/10"
                    placeholder="English, Bangla, Spanish"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Bio
                  </label>
                  <textarea
                    value={settings.bio}
                    onChange={(e) => handleSettingChange('bio', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-50/50 hover:bg-gray-50 border border-gray-200 focus:border-black focus:bg-white rounded-2xl transition-all duration-200 outline-none text-gray-900 placeholder-gray-400 font-medium text-sm focus:ring-2 focus:ring-black/10 resize-none leading-relaxed"
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

          {isTutor && activeTab === 'bank' && (
            <SettingSection title="Bank Information" icon={CreditCard}>
              <div className="space-y-6">
                {/* Payment Method Selector Tabs */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
                    Select Preferred Payout Method
                  </label>
                  <div className="flex flex-wrap gap-2 p-1.5 bg-gray-50 rounded-2xl border border-gray-100">
                    {[
                      { id: 'bank', label: 'Bank Transfer' },
                      { id: 'mobile_banking', label: 'Mobile Banking' },
                      { id: 'card', label: 'Card Payment' }
                    ].map((method) => (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => {
                          handleSettingChange('bankDetails', {
                            ...settings.bankDetails,
                            paymentMethod: method.id
                          });
                        }}
                        className={`flex-1 min-w-[120px] px-4 py-2.5 rounded-xl font-bold text-xs transition-all duration-200 ${
                          settings.bankDetails.paymentMethod === method.id
                            ? 'bg-black text-white shadow-md shadow-gray-200'
                            : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100/50'
                        }`}
                      >
                        {method.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Form Fields based on Payment Method */}
                {settings.bankDetails.paymentMethod === 'bank' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-200">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                        Bank Name
                      </label>
                      <input
                        type="text"
                        value={settings.bankDetails.bankName || ''}
                        onChange={(e) => {
                          handleSettingChange('bankDetails', {
                            ...settings.bankDetails,
                            bankName: e.target.value
                          });
                        }}
                        className="w-full px-4 py-3 bg-gray-50/50 hover:bg-gray-50 border border-gray-200 focus:border-black focus:bg-white rounded-2xl transition-all duration-200 outline-none text-gray-900 placeholder-gray-400 font-medium text-sm focus:ring-2 focus:ring-black/10"
                        placeholder="e.g. Dutch-Bangla Bank"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                        Account Name
                      </label>
                      <input
                        type="text"
                        value={settings.bankDetails.accountName || ''}
                        onChange={(e) => {
                          handleSettingChange('bankDetails', {
                            ...settings.bankDetails,
                            accountName: e.target.value
                          });
                        }}
                        className="w-full px-4 py-3 bg-gray-50/50 hover:bg-gray-50 border border-gray-200 focus:border-black focus:bg-white rounded-2xl transition-all duration-200 outline-none text-gray-900 placeholder-gray-400 font-medium text-sm focus:ring-2 focus:ring-black/10"
                        placeholder="e.g. John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                        Account Number
                      </label>
                      <input
                        type="text"
                        value={settings.bankDetails.accountNumber || ''}
                        onChange={(e) => {
                          handleSettingChange('bankDetails', {
                            ...settings.bankDetails,
                            accountNumber: e.target.value
                          });
                        }}
                        className="w-full px-4 py-3 bg-gray-50/50 hover:bg-gray-50 border border-gray-200 focus:border-black focus:bg-white rounded-2xl transition-all duration-200 outline-none text-gray-900 placeholder-gray-400 font-medium text-sm focus:ring-2 focus:ring-black/10"
                        placeholder="e.g. 1234567890"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                        Branch Name
                      </label>
                      <input
                        type="text"
                        value={settings.bankDetails.branchName || ''}
                        onChange={(e) => {
                          handleSettingChange('bankDetails', {
                            ...settings.bankDetails,
                            branchName: e.target.value
                          });
                        }}
                        className="w-full px-4 py-3 bg-gray-50/50 hover:bg-gray-50 border border-gray-200 focus:border-black focus:bg-white rounded-2xl transition-all duration-200 outline-none text-gray-900 placeholder-gray-400 font-medium text-sm focus:ring-2 focus:ring-black/10"
                        placeholder="e.g. Banani Branch"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                        Routing Number
                      </label>
                      <input
                        type="text"
                        value={settings.bankDetails.routingNumber || ''}
                        onChange={(e) => {
                          handleSettingChange('bankDetails', {
                            ...settings.bankDetails,
                            routingNumber: e.target.value
                          });
                        }}
                        className="w-full px-4 py-3 bg-gray-50/50 hover:bg-gray-50 border border-gray-200 focus:border-black focus:bg-white rounded-2xl transition-all duration-200 outline-none text-gray-900 placeholder-gray-400 font-medium text-sm focus:ring-2 focus:ring-black/10"
                        placeholder="e.g. 090261314"
                      />
                    </div>
                  </div>
                )}

                {settings.bankDetails.paymentMethod === 'mobile_banking' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-200">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                        Provider
                      </label>
                      <select
                        value={settings.bankDetails.provider || 'bKash'}
                        onChange={(e) => {
                          handleSettingChange('bankDetails', {
                            ...settings.bankDetails,
                            provider: e.target.value
                          });
                        }}
                        className="w-full px-4 py-3 bg-gray-50/50 hover:bg-gray-50 border border-gray-200 focus:border-black focus:bg-white rounded-2xl transition-all duration-200 outline-none text-gray-900 font-medium text-sm focus:ring-2 focus:ring-black/10"
                      >
                        <option value="bKash">bKash</option>
                        <option value="Nagad">Nagad</option>
                        <option value="Rocket">Rocket</option>
                        <option value="Upay">Upay</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                        Account Type
                      </label>
                      <select
                        value={settings.bankDetails.accountType || 'Personal'}
                        onChange={(e) => {
                          handleSettingChange('bankDetails', {
                            ...settings.bankDetails,
                            accountType: e.target.value
                          });
                        }}
                        className="w-full px-4 py-3 bg-gray-50/50 hover:bg-gray-50 border border-gray-200 focus:border-black focus:bg-white rounded-2xl transition-all duration-200 outline-none text-gray-900 font-medium text-sm focus:ring-2 focus:ring-black/10"
                      >
                        <option value="Personal">Personal</option>
                        <option value="Agent">Agent</option>
                        <option value="Merchant">Merchant</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                        Mobile Number
                      </label>
                      <input
                        type="text"
                        value={settings.bankDetails.mobileNumber || ''}
                        onChange={(e) => {
                          handleSettingChange('bankDetails', {
                            ...settings.bankDetails,
                            mobileNumber: e.target.value
                          });
                        }}
                        className="w-full px-4 py-3 bg-gray-50/50 hover:bg-gray-50 border border-gray-200 focus:border-black focus:bg-white rounded-2xl transition-all duration-200 outline-none text-gray-900 placeholder-gray-400 font-medium text-sm focus:ring-2 focus:ring-black/10"
                        placeholder="e.g. 017XXXXXXXX"
                      />
                    </div>
                  </div>
                )}

                {settings.bankDetails.paymentMethod === 'card' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-200">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                        Card Type
                      </label>
                      <select
                        value={settings.bankDetails.cardType || 'Visa'}
                        onChange={(e) => {
                          handleSettingChange('bankDetails', {
                            ...settings.bankDetails,
                            cardType: e.target.value
                          });
                        }}
                        className="w-full px-4 py-3 bg-gray-50/50 hover:bg-gray-50 border border-gray-200 focus:border-black focus:bg-white rounded-2xl transition-all duration-200 outline-none text-gray-900 font-medium text-sm focus:ring-2 focus:ring-black/10"
                      >
                        <option value="Visa">Visa</option>
                        <option value="Mastercard">Mastercard</option>
                        <option value="AMEX">AMEX</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        value={settings.bankDetails.cardholderName || ''}
                        onChange={(e) => {
                          handleSettingChange('bankDetails', {
                            ...settings.bankDetails,
                            cardholderName: e.target.value
                          });
                        }}
                        className="w-full px-4 py-3 bg-gray-50/50 hover:bg-gray-50 border border-gray-200 focus:border-black focus:bg-white rounded-2xl transition-all duration-200 outline-none text-gray-900 placeholder-gray-400 font-medium text-sm focus:ring-2 focus:ring-black/10"
                        placeholder="e.g. John Doe"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                        Card Number
                      </label>
                      <input
                        type="text"
                        value={settings.bankDetails.cardNumber || ''}
                        onChange={(e) => {
                          handleSettingChange('bankDetails', {
                            ...settings.bankDetails,
                            cardNumber: e.target.value
                          });
                        }}
                        className="w-full px-4 py-3 bg-gray-50/50 hover:bg-gray-50 border border-gray-200 focus:border-black focus:bg-white rounded-2xl transition-all duration-200 outline-none text-gray-900 placeholder-gray-400 font-medium text-sm focus:ring-2 focus:ring-black/10"
                        placeholder="e.g. 4111222233334444"
                      />
                    </div>
                  </div>
                )}
              </div>
            </SettingSection>
          )}
        </div>
      </div>
    </div>
  );
};
