"use client";

import React from "react";
import { TutorProfile } from "@/lib/services/profile";
import AvailabilityPicker from "@/components/AvailabilityPicker";
import ChipsInput from "@/components/ChipsInput";
import { AvailabilityValue } from "@/lib/availability";

interface TutorProfileFieldsProps {
  values: TutorProfile;
  onChange: (field: keyof TutorProfile, value: any) => void;
  availabilityValue: AvailabilityValue;
  onAvailabilityChange: (value: AvailabilityValue) => void;
  variant?: "settings" | "profile";
  showSectionTitles?: boolean;
  showAvailability?: boolean;
}

const TutorProfileFields: React.FC<TutorProfileFieldsProps> = ({
  values,
  onChange,
  availabilityValue,
  onAvailabilityChange,
  variant = "settings",
  showSectionTitles = true,
  showAvailability = true,
}) => {
  const styles =
    variant === "profile"
      ? {
          label: "text-sm font-semibold text-gray-900 mb-2",
          input:
            "w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors",
          select:
            "w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors",
          textarea:
            "w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors",
          sectionTitle: "text-base font-semibold text-gray-900",
        }
      : {
          label: "text-sm font-medium text-gray-700 mb-2",
          input:
            "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500",
          select:
            "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500",
          textarea:
            "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500",
          sectionTitle: "text-sm font-semibold text-gray-900 uppercase tracking-wide",
        };

  return (
    <div className="space-y-8">
      {showSectionTitles && (
        <h4 className={styles.sectionTitle}>Professional profile</h4>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={styles.label}>Professional Title</label>
          <input
            type="text"
            value={values.professionalTitle || ""}
            onChange={(e) => onChange("professionalTitle", e.target.value)}
            placeholder="e.g. Senior Mathematics Tutor"
            className={styles.input}
          />
        </div>
        <div>
          <label className={styles.label}>Qualification</label>
          <input
            type="text"
            value={values.qualification || ""}
            onChange={(e) => onChange("qualification", e.target.value)}
            placeholder="e.g. PhD in Economics"
            className={styles.input}
          />
        </div>
        <div>
          <label className={styles.label}>Current Institution</label>
          <input
            type="text"
            value={values.currentInstitution || ""}
            onChange={(e) => onChange("currentInstitution", e.target.value)}
            placeholder="e.g. North South University"
            className={styles.input}
          />
        </div>
        <div>
          <label className={styles.label}>Teaching Mode</label>
          <select
            value={values.teachingMode || ""}
            onChange={(e) =>
              onChange("teachingMode", e.target.value || undefined)
            }
            className={styles.select}
          >
            <option value="">Select mode</option>
            <option value="Online">Online</option>
            <option value="Offline">Offline</option>
            <option value="Hybrid">Hybrid</option>
          </select>
        </div>
        <div>
          <label className={styles.label}>Hourly Rate</label>
          <input
            type="number"
            value={values.hourlyRate ?? ""}
            onChange={(e) => {
              const raw = e.target.value;
              onChange("hourlyRate", raw === "" ? undefined : Number(raw));
            }}
            className={styles.input}
          />
        </div>
        <div>
          <label className={styles.label}>Experience (years)</label>
          <input
            type="number"
            value={values.experienceYears ?? ""}
            onChange={(e) => {
              const raw = e.target.value;
              onChange("experienceYears", raw === "" ? undefined : Number(raw));
            }}
            className={styles.input}
          />
        </div>
        <div className="md:col-span-2">
          <ChipsInput
            label="Expertise Subjects"
            items={values.expertiseSubjects || []}
            onChange={(items) => onChange("expertiseSubjects", items)}
            placeholder="Add subject"
            helperText="Press Enter or comma to add multiple."
            variant={variant}
          />
        </div>
        <div className="md:col-span-2">
          <ChipsInput
            label="Skills"
            items={values.skills || []}
            onChange={(items) => onChange("skills", items)}
            placeholder="Add skill"
            helperText="Press Enter or comma to add multiple."
            variant={variant}
          />
        </div>
        <div className="md:col-span-2">
          <label className={styles.label}>Achievements</label>
          <textarea
            value={values.achievements || ""}
            onChange={(e) => onChange("achievements", e.target.value)}
            rows={3}
            placeholder="Awards, certifications, notable results..."
            className={styles.textarea}
          />
        </div>
      </div>

      {showAvailability && (
        <div className="space-y-3">
          {showSectionTitles && (
            <h4 className={styles.sectionTitle}>Availability</h4>
          )}
          <AvailabilityPicker
            value={availabilityValue}
            onChange={onAvailabilityChange}
            variant={variant}
          />
        </div>
      )}
    </div>
  );
};

export default TutorProfileFields;
