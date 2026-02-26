"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Bell, Shield, Moon, Sun, Monitor, Save } from "lucide-react";
import { useGetUserQuery, useUpdateUserMutation } from "@/lib/services/auth";
import { Skeleton } from "@/components/ui/skeleton";
import TutorProfileFields from "@/components/TutorProfileFields";
import { buildAvailabilityValue } from "@/lib/availability";

const parseCommaList = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const parseNumericInput = (value: any) => {
  if (value === "" || value === null || value === undefined) return undefined;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
};

type SettingsState = {
  name: string;
  email: string;
  bio: string;
  timezone: string;
  city: string;
  country: string;
  languages: string;
  professionalTitle: string;
  qualification: string;
  hourlyRate: number | undefined;
  experienceYears: number | undefined;
  expertiseSubjects: string[];
  skills: string[];
  currentInstitution: string;
  teachingMode: "" | "Online" | "Offline" | "Hybrid";
  achievements: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  messageNotifications: boolean;
  sessionReminders: boolean;
  weeklyReports: boolean;
  profileVisibility: string;
  showOnlineStatus: boolean;
  allowDirectMessages: boolean;
  theme: string;
  language: string;
  autoAcceptSessions: boolean;
  maxSessionsPerDay: number;
  bufferTimeBetweenSessions: number;
};

const SettingSection = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="bg-white rounded-lg shadow p-6 mb-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
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
    type="button"
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

const SettingsPage = () => {
  const { data: userData, isLoading, refetch } = useGetUserQuery();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const user = userData?.user;
  const scrollContainerRef = useRef<HTMLElement | null>(null);
  const lastScrollTopRef = useRef(0);

  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [settings, setSettings] = useState<SettingsState>({
    // Profile Settings
    name: "",
    email: "",
    bio: "",
    timezone: "UTC-5",
    city: "",
    country: "",
    languages: "",

    // Tutor Profile Settings
    professionalTitle: "",
    qualification: "",
    hourlyRate: 0,
    experienceYears: 0,
    expertiseSubjects: [] as string[],
    skills: [] as string[],
    currentInstitution: "",
    teachingMode: "",
    achievements: "",

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

  const [availability, setAvailability] = useState<{
    days: string[];
    slotsByDay: Record<string, string[]>;
  }>({
    days: [],
    slotsByDay: {},
  });

  useEffect(() => {
    const container = document.querySelector("main");
    if (!container) return;
    scrollContainerRef.current = container as HTMLElement;
    const handleScroll = () => {
      lastScrollTopRef.current = container.scrollTop;
    };
    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useLayoutEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    if (container.scrollTop !== lastScrollTopRef.current) {
      container.scrollTop = lastScrollTopRef.current;
    }
  }, [settings, availability]);

  useEffect(() => {
    if (!user) return;
    const tutorProfile = user.tutorProfile || {};
    const availableDays = tutorProfile.availableDays || [];
    const availableTimeSlots = tutorProfile.availableTimeSlots || [];

    setSettings((prev) => ({
      ...prev,
      name: user.name || "",
      email: user.email || "",
      bio: user.roles?.includes("tutor")
        ? tutorProfile?.bio || user.about || ""
        : user.about || "",
      city: user.city || "",
      country: user.country || "",
      languages: user.languages?.join(", ") || "",
      professionalTitle: tutorProfile?.professionalTitle || "",
      qualification: tutorProfile?.qualification || "",
      hourlyRate: tutorProfile?.hourlyRate ?? 0,
      experienceYears: tutorProfile?.experienceYears ?? 0,
      expertiseSubjects: tutorProfile?.expertiseSubjects || [],
      skills: tutorProfile?.skills || [],
      currentInstitution: tutorProfile?.currentInstitution || "",
      teachingMode: tutorProfile?.teachingMode || "",
      achievements: tutorProfile?.achievements || "",
    }));

    setAvailability(buildAvailabilityValue(availableDays, availableTimeSlots));
  }, [user]);

  const handleSettingChange = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setMessage(null);
    try {
      const expertiseSubjects = settings.expertiseSubjects
        .map((item) => item.trim())
        .filter(Boolean);
      const skills = settings.skills.map((item) => item.trim()).filter(Boolean);
      const languages = parseCommaList(settings.languages);
      const hourlyRate = parseNumericInput(settings.hourlyRate);
      const experienceYears = parseNumericInput(settings.experienceYears);
      const teachingMode = settings.teachingMode || undefined;

      const availableTimeSlots = availability.days.map((day) => ({
        day,
        slots: availability.slotsByDay[day] || [],
      }));

      const payload: Record<string, any> = {
        name: settings.name,
        bio: settings.bio,
        city: settings.city,
        country: settings.country,
        languages,
        professionalTitle: settings.professionalTitle,
        qualification: settings.qualification,
        currentInstitution: settings.currentInstitution,
        achievements: settings.achievements,
        expertiseSubjects,
        skills,
      };

      if (hourlyRate !== undefined) payload.hourlyRate = hourlyRate;
      if (experienceYears !== undefined) payload.experienceYears = experienceYears;
      if (teachingMode !== undefined) payload.teachingMode = teachingMode;

      if (user?.roles?.includes("tutor")) {
        payload.availableDays = availability.days;
        payload.availableTimeSlots = availableTimeSlots;
      }

      const res = await updateUser(payload).unwrap();

      if (res.status === "success") {
        setMessage({ type: "success", text: "Profile updated successfully!" });
        refetch();
      } else {
        setMessage({
          type: "error",
          text: res.message || "Failed to update profile",
        });
      }
    } catch (error: any) {
      console.error(error);
      setMessage({
        type: "error",
        text: error?.data?.message || "Something went wrong!",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="w-full mx-auto space-y-6">
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-4 w-72" />
          </div>
          <Skeleton className="h-10 w-36 rounded-lg" />
        </div>
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <Skeleton className="h-5 w-48" />
            <div className="mt-4 space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="w-full mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">
            Manage your account preferences and settings
          </p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={isUpdating}
          className="bg-primary-300 hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 disabled:opacity-50"
        >
          {isUpdating ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
          ) : (
            <Save size={16} />
          )}
          <span>{isUpdating ? "Saving..." : "Save Changes"}</span>
        </button>
      </div>

      {message && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            message.type === "success"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <SettingSection title="Profile Settings">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={settings.name}
              onChange={(e) => handleSettingChange("name", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={settings.email}
              disabled
              className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
            />
            <p className="mt-1 text-xs text-gray-400">
              Email is set at registration and can&apos;t be changed.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Country
            </label>
            <input
              type="text"
              value={settings.country}
              onChange={(e) => handleSettingChange("country", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Bangladesh"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City
            </label>
            <input
              type="text"
              value={settings.city}
              onChange={(e) => handleSettingChange("city", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Sylhet"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Languages (comma separated)
            </label>
            <input
              type="text"
              value={settings.languages}
              onChange={(e) => handleSettingChange("languages", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="English, Bangla"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bio
            </label>
            <textarea
              value={settings.bio}
              onChange={(e) => handleSettingChange("bio", e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Tell others about yourself..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Timezone
            </label>
            <select
              value={settings.timezone}
              onChange={(e) => handleSettingChange("timezone", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="UTC-8">Pacific Time (UTC-8)</option>
              <option value="UTC-7">Mountain Time (UTC-7)</option>
              <option value="UTC-6">Central Time (UTC-6)</option>
              <option value="UTC-5">Eastern Time (UTC-5)</option>
              <option value="UTC+0">UTC</option>
            </select>
          </div>
        </div>
      </SettingSection>

      {user?.roles?.includes("tutor") && (
        <SettingSection title="Tutor Profile">
          <TutorProfileFields
            variant="settings"
            values={{
              professionalTitle: settings.professionalTitle,
              qualification: settings.qualification,
              currentInstitution: settings.currentInstitution,
              teachingMode: settings.teachingMode || undefined,
              hourlyRate: settings.hourlyRate,
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

      <SettingSection title="Notifications">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bell className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">Email Notifications</p>
                <p className="text-sm text-gray-500">
                  Receive notifications via email
                </p>
              </div>
            </div>
            <ToggleSwitch
              enabled={settings.emailNotifications}
              onChange={(value) => handleSettingChange("emailNotifications", value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bell className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">Push Notifications</p>
                <p className="text-sm text-gray-500">
                  Receive push notifications in browser
                </p>
              </div>
            </div>
            <ToggleSwitch
              enabled={settings.pushNotifications}
              onChange={(value) => handleSettingChange("pushNotifications", value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bell className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">Message Notifications</p>
                <p className="text-sm text-gray-500">
                  Get notified of new messages
                </p>
              </div>
            </div>
            <ToggleSwitch
              enabled={settings.messageNotifications}
              onChange={(value) => handleSettingChange("messageNotifications", value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bell className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">Session Reminders</p>
                <p className="text-sm text-gray-500">
                  Reminders for upcoming sessions
                </p>
              </div>
            </div>
            <ToggleSwitch
              enabled={settings.sessionReminders}
              onChange={(value) => handleSettingChange("sessionReminders", value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bell className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">Weekly Reports</p>
                <p className="text-sm text-gray-500">
                  Weekly summary of your activity
                </p>
              </div>
            </div>
            <ToggleSwitch
              enabled={settings.weeklyReports}
              onChange={(value) => handleSettingChange("weeklyReports", value)}
            />
          </div>
        </div>
      </SettingSection>

      <SettingSection title="Privacy & Security">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profile Visibility
            </label>
            <select
              value={settings.profileVisibility}
              onChange={(e) =>
                handleSettingChange("profileVisibility", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="public">Public - Anyone can see your profile</option>
              <option value="students">
                Students Only - Only students can see your profile
              </option>
              <option value="private">Private - Only you can see your profile</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">Show Online Status</p>
                <p className="text-sm text-gray-500">
                  Let others see when you are online
                </p>
              </div>
            </div>
            <ToggleSwitch
              enabled={settings.showOnlineStatus}
              onChange={(value) => handleSettingChange("showOnlineStatus", value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">
                  Allow Direct Messages
                </p>
                <p className="text-sm text-gray-500">
                  Allow students to message you directly
                </p>
              </div>
            </div>
            <ToggleSwitch
              enabled={settings.allowDirectMessages}
              onChange={(value) => handleSettingChange("allowDirectMessages", value)}
            />
          </div>
        </div>
      </SettingSection>

      <SettingSection title="Appearance">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Theme
            </label>
            <div className="grid grid-cols-3 gap-3">
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
                  <span className="text-sm font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Language
            </label>
            <select
              value={settings.language}
              onChange={(e) => handleSettingChange("language", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="en">English</option>
              <option value="es">Espanol</option>
              <option value="fr">Francais</option>
              <option value="de">Deutsch</option>
            </select>
          </div>
        </div>
      </SettingSection>

      <SettingSection title="Tutoring Preferences">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Auto-accept Sessions</p>
              <p className="text-sm text-gray-500">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Sessions Per Day
              </label>
              <input
                type="number"
                value={settings.maxSessionsPerDay}
                onChange={(e) =>
                  handleSettingChange(
                    "maxSessionsPerDay",
                    parseInt(e.target.value, 10)
                  )
                }
                min="1"
                max="20"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buffer Time (minutes)
              </label>
              <select
                value={settings.bufferTimeBetweenSessions}
                onChange={(e) =>
                  handleSettingChange(
                    "bufferTimeBetweenSessions",
                    parseInt(e.target.value, 10)
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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
  );
};

export default SettingsPage;
