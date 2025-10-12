"use client";
import React, { useState } from "react";
import {
  Bell,
  Shield,
  User,
  Globe,
  Moon,
  Sun,
  Monitor,
  Save,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useGetUserQuery } from "@/lib/services/auth";

const SettingsPage = () => {
  const { data: userData } = useGetUserQuery();
  const user = userData?.user;

  const [settings, setSettings] = useState({
    // Profile Settings
    name: user?.name || "",
    email: user?.email || "",
    bio: "",
    timezone: "UTC-5",

    // Notification Settings
    emailNotifications: true,
    pushNotifications: true,
    messageNotifications: true,
    sessionReminders: true,
    weeklyReports: false,

    // Privacy Settings
    profileVisibility: "public",
    showOnlineStatus: true,
    allowDirectMessages: true,

    // Appearance Settings
    theme: "system",
    language: "en",

    // Tutoring Settings
    autoAcceptSessions: false,
    maxSessionsPerDay: 8,
    bufferTimeBetweenSessions: 15,
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    // Here you would typically save to backend
    console.log("Saving settings:", settings);
    // Show success message
  };

  const SettingSection = ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <div className='bg-white rounded-lg shadow p-6 mb-6'>
      <h3 className='text-lg font-semibold text-gray-900 mb-4'>{title}</h3>
      {children}
    </div>
  );

  const ToggleSwitch = ({
    enabled,
    onChange,
  }: {
    enabled: boolean;
    onChange: (value: boolean) => void;
  }) => (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        enabled ? "bg-primary-300" : "bg-gray-300"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );

  return (
    <div>
      <div className='min-h-screen bg-gray-50 p-6'>
        <div className='w-full mx-auto'>
          {/* Header */}
          <div className='flex items-center justify-between mb-6'>
            <div>
              <h1 className='text-2xl font-bold text-gray-900'>Settings</h1>
              <p className='text-gray-600'>
                Manage your account preferences and settings
              </p>
            </div>
            <button
              onClick={handleSave}
              className='bg-primary-300 hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2'
            >
              <Save size={16} />
              <span>Save Changes</span>
            </button>
          </div>

          {/* Profile Settings */}
          <SettingSection title='Profile Settings'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Full Name
                </label>
                <input
                  type='text'
                  value={settings.name}
                  onChange={(e) => handleSettingChange("name", e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Email
                </label>
                <input
                  type='email'
                  value={settings.email}
                  onChange={(e) => handleSettingChange("email", e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500'
                />
              </div>
              <div className='md:col-span-2'>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Bio
                </label>
                <textarea
                  value={settings.bio}
                  onChange={(e) => handleSettingChange("bio", e.target.value)}
                  rows={3}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500'
                  placeholder='Tell others about yourself...'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Timezone
                </label>
                <select
                  value={settings.timezone}
                  onChange={(e) =>
                    handleSettingChange("timezone", e.target.value)
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500'
                >
                  <option value='UTC-8'>Pacific Time (UTC-8)</option>
                  <option value='UTC-7'>Mountain Time (UTC-7)</option>
                  <option value='UTC-6'>Central Time (UTC-6)</option>
                  <option value='UTC-5'>Eastern Time (UTC-5)</option>
                  <option value='UTC+0'>UTC</option>
                </select>
              </div>
            </div>
          </SettingSection>

          {/* Notification Settings */}
          <SettingSection title='Notifications'>
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center space-x-3'>
                  <Bell className='w-5 h-5 text-gray-400' />
                  <div>
                    <p className='font-medium text-gray-900'>
                      Email Notifications
                    </p>
                    <p className='text-sm text-gray-500'>
                      Receive notifications via email
                    </p>
                  </div>
                </div>
                <ToggleSwitch
                  enabled={settings.emailNotifications}
                  onChange={(value) =>
                    handleSettingChange("emailNotifications", value)
                  }
                />
              </div>

              <div className='flex items-center justify-between'>
                <div className='flex items-center space-x-3'>
                  <Bell className='w-5 h-5 text-gray-400' />
                  <div>
                    <p className='font-medium text-gray-900'>
                      Push Notifications
                    </p>
                    <p className='text-sm text-gray-500'>
                      Receive push notifications in browser
                    </p>
                  </div>
                </div>
                <ToggleSwitch
                  enabled={settings.pushNotifications}
                  onChange={(value) =>
                    handleSettingChange("pushNotifications", value)
                  }
                />
              </div>

              <div className='flex items-center justify-between'>
                <div className='flex items-center space-x-3'>
                  <Bell className='w-5 h-5 text-gray-400' />
                  <div>
                    <p className='font-medium text-gray-900'>
                      Message Notifications
                    </p>
                    <p className='text-sm text-gray-500'>
                      Get notified of new messages
                    </p>
                  </div>
                </div>
                <ToggleSwitch
                  enabled={settings.messageNotifications}
                  onChange={(value) =>
                    handleSettingChange("messageNotifications", value)
                  }
                />
              </div>

              <div className='flex items-center justify-between'>
                <div className='flex items-center space-x-3'>
                  <Bell className='w-5 h-5 text-gray-400' />
                  <div>
                    <p className='font-medium text-gray-900'>
                      Session Reminders
                    </p>
                    <p className='text-sm text-gray-500'>
                      Reminders for upcoming sessions
                    </p>
                  </div>
                </div>
                <ToggleSwitch
                  enabled={settings.sessionReminders}
                  onChange={(value) =>
                    handleSettingChange("sessionReminders", value)
                  }
                />
              </div>

              <div className='flex items-center justify-between'>
                <div className='flex items-center space-x-3'>
                  <Bell className='w-5 h-5 text-gray-400' />
                  <div>
                    <p className='font-medium text-gray-900'>Weekly Reports</p>
                    <p className='text-sm text-gray-500'>
                      Weekly summary of your activity
                    </p>
                  </div>
                </div>
                <ToggleSwitch
                  enabled={settings.weeklyReports}
                  onChange={(value) =>
                    handleSettingChange("weeklyReports", value)
                  }
                />
              </div>
            </div>
          </SettingSection>

          {/* Privacy Settings */}
          <SettingSection title='Privacy & Security'>
            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Profile Visibility
                </label>
                <select
                  value={settings.profileVisibility}
                  onChange={(e) =>
                    handleSettingChange("profileVisibility", e.target.value)
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500'
                >
                  <option value='public'>
                    Public - Anyone can see your profile
                  </option>
                  <option value='students'>
                    Students Only - Only students can see your profile
                  </option>
                  <option value='private'>
                    Private - Only you can see your profile
                  </option>
                </select>
              </div>

              <div className='flex items-center justify-between'>
                <div className='flex items-center space-x-3'>
                  <Shield className='w-5 h-5 text-gray-400' />
                  <div>
                    <p className='font-medium text-gray-900'>
                      Show Online Status
                    </p>
                    <p className='text-sm text-gray-500'>
                      Let others see when you're online
                    </p>
                  </div>
                </div>
                <ToggleSwitch
                  enabled={settings.showOnlineStatus}
                  onChange={(value) =>
                    handleSettingChange("showOnlineStatus", value)
                  }
                />
              </div>

              <div className='flex items-center justify-between'>
                <div className='flex items-center space-x-3'>
                  <Shield className='w-5 h-5 text-gray-400' />
                  <div>
                    <p className='font-medium text-gray-900'>
                      Allow Direct Messages
                    </p>
                    <p className='text-sm text-gray-500'>
                      Allow students to message you directly
                    </p>
                  </div>
                </div>
                <ToggleSwitch
                  enabled={settings.allowDirectMessages}
                  onChange={(value) =>
                    handleSettingChange("allowDirectMessages", value)
                  }
                />
              </div>
            </div>
          </SettingSection>

          {/* Appearance Settings */}
          <SettingSection title='Appearance'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Theme
                </label>
                <div className='grid grid-cols-3 gap-3'>
                  {[
                    { value: "light", label: "Light", icon: Sun },
                    { value: "dark", label: "Dark", icon: Moon },
                    { value: "system", label: "System", icon: Monitor },
                  ].map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => handleSettingChange("theme", value)}
                      className={`p-3 border rounded-lg flex flex-col items-center space-y-2 ${
                        settings.theme === value
                          ? "border-primary-300 bg-primary-100 text-primary-700"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <Icon size={20} />
                      <span className='text-sm font-medium'>{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Language
                </label>
                <select
                  value={settings.language}
                  onChange={(e) =>
                    handleSettingChange("language", e.target.value)
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500'
                >
                  <option value='en'>English</option>
                  <option value='es'>Español</option>
                  <option value='fr'>Français</option>
                  <option value='de'>Deutsch</option>
                </select>
              </div>
            </div>
          </SettingSection>

          {/* Tutoring Settings */}
          <SettingSection title='Tutoring Preferences'>
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='font-medium text-gray-900'>
                    Auto-accept Sessions
                  </p>
                  <p className='text-sm text-gray-500'>
                    Automatically accept session requests
                  </p>
                </div>
                <ToggleSwitch
                  enabled={settings.autoAcceptSessions}
                  onChange={(value) =>
                    handleSettingChange("autoAcceptSessions", value)
                  }
                />
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Max Sessions Per Day
                  </label>
                  <input
                    type='number'
                    value={settings.maxSessionsPerDay}
                    onChange={(e) =>
                      handleSettingChange(
                        "maxSessionsPerDay",
                        parseInt(e.target.value)
                      )
                    }
                    min='1'
                    max='20'
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Buffer Time (minutes)
                  </label>
                  <select
                    value={settings.bufferTimeBetweenSessions}
                    onChange={(e) =>
                      handleSettingChange(
                        "bufferTimeBetweenSessions",
                        parseInt(e.target.value)
                      )
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500'
                  >
                    <option value={0}>No buffer</option>
                    <option value={5}>5 minutes</option>
                    <option value={10}>10 minutes</option>
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                  </select>
                </div>
              </div>
            </div>
          </SettingSection>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
