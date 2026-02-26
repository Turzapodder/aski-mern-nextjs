import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useGetUserQuery, useUpdateUserMutation } from "@/lib/services/auth";
import { buildAvailabilityValue } from "@/lib/availability";

export const parseCommaList = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

export const parseNumericInput = (value: any) => {
  if (value === "" || value === null || value === undefined) return undefined;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
};

export type SettingsState = {
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

export const useSettingsLogic = () => {
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

  return {
    userData,
    isLoading,
    user,
    message,
    settings,
    handleSettingChange,
    handleSave,
    isUpdating,
    availability,
    setAvailability
  }
}
