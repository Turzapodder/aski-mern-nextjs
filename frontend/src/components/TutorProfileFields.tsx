'use client';

import React from 'react';
import { TutorProfile } from '@/lib/services/profile';
import AvailabilityPicker from '@/components/AvailabilityPicker';
import ChipsInput from '@/components/ChipsInput';
import { AvailabilityValue } from '@/lib/availability';

interface TutorProfileFieldsProps {
  values: TutorProfile;
  onChange: (field: keyof TutorProfile, value: any) => void;
  availabilityValue: AvailabilityValue;
  onAvailabilityChange: (value: AvailabilityValue) => void;
  variant?: 'settings' | 'profile';
  showSectionTitles?: boolean;
  showAvailability?: boolean;
}

const TutorProfileFields: React.FC<TutorProfileFieldsProps> = ({
  values,
  onChange,
  availabilityValue,
  onAvailabilityChange,
  variant = 'settings',
  showSectionTitles = true,
  showAvailability = true,
}) => {
  const [currentMonth, setCurrentMonth] = React.useState(() => new Date());

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const blankDays = Array.from({ length: firstDayOfMonth });
  const monthDays = Array.from({ length: totalDaysInMonth }, (_, i) => i + 1);

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const toggleOffday = (dateStr: string) => {
    const current = values.offdays || [];
    const next = current.includes(dateStr)
      ? current.filter((d) => d !== dateStr)
      : [...current, dateStr];
    onChange('offdays', next);
  };

  const styles =
    variant === 'profile'
      ? {
          label: 'text-sm font-semibold text-gray-900 mb-2',
          input:
            'w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors',
          select:
            'w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors',
          textarea:
            'w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors',
          sectionTitle: 'text-base font-semibold text-gray-900',
        }
      : {
          label: 'text-sm font-medium text-gray-700 mb-2',
          input:
            'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500',
          select:
            'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500',
          textarea:
            'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500',
          sectionTitle: 'text-sm font-semibold text-gray-900 uppercase tracking-wide',
        };

  return (
    <div className="space-y-8">
      {showSectionTitles && <h4 className={styles.sectionTitle}>Professional profile</h4>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={styles.label}>Professional Title</label>
          <input
            type="text"
            value={values.professionalTitle || ''}
            onChange={(e) => onChange('professionalTitle', e.target.value)}
            placeholder="e.g. Senior Mathematics Tutor"
            className={styles.input}
          />
        </div>
        <div>
          <label className={styles.label}>Qualification</label>
          <input
            type="text"
            value={values.qualification || ''}
            onChange={(e) => onChange('qualification', e.target.value)}
            placeholder="e.g. PhD in Economics"
            className={styles.input}
          />
        </div>
        <div>
          <label className={styles.label}>Current Institution</label>
          <input
            type="text"
            value={values.currentInstitution || ''}
            onChange={(e) => onChange('currentInstitution', e.target.value)}
            placeholder="e.g. North South University"
            className={styles.input}
          />
        </div>
        <div>
          <label className={styles.label}>Teaching Mode</label>
          <select
            value={values.teachingMode || ''}
            onChange={(e) => onChange('teachingMode', e.target.value || undefined)}
            className={styles.select}
          >
            <option value="">Select mode</option>
            <option value="Online">Online</option>
            <option value="Offline">Offline</option>
            <option value="Hybrid">Hybrid</option>
          </select>
        </div>
        <div>
          <label className={styles.label}>Hourly Rate (BDT)</label>
          <input
            type="number"
            value={values.hourlyRate ?? ''}
            onChange={(e) => {
              const raw = e.target.value;
              onChange('hourlyRate', raw === '' ? undefined : Number(raw));
            }}
            placeholder="Hourly price"
            className={styles.input}
          />
        </div>
        <div>
          <label className={styles.label}>Half-Hourly Rate (BDT)</label>
          <input
            type="number"
            value={values.halfHourlyRate ?? ''}
            onChange={(e) => {
              const raw = e.target.value;
              onChange('halfHourlyRate', raw === '' ? undefined : Number(raw));
            }}
            placeholder={values.hourlyRate ? `Suggested: ${Math.round(values.hourlyRate * 0.6)} BDT` : '30 mins price'}
            className={styles.input}
          />
        </div>
        <div className="md:col-span-2">
          <label className={styles.label}>Allowed Session Lengths</label>
          <div className="flex gap-6 mt-1">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                checked={(values.allowedSessionDurations || [30, 60]).includes(30)}
                onChange={(e) => {
                  const current = values.allowedSessionDurations || [30, 60];
                  const next = e.target.checked
                    ? Array.from(new Set([...current, 30]))
                    : current.filter((v) => v !== 30);
                  onChange('allowedSessionDurations', next);
                }}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              30 minutes (Half Hour)
            </label>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                checked={(values.allowedSessionDurations || [30, 60]).includes(60)}
                onChange={(e) => {
                  const current = values.allowedSessionDurations || [30, 60];
                  const next = e.target.checked
                    ? Array.from(new Set([...current, 60]))
                    : current.filter((v) => v !== 60);
                  onChange('allowedSessionDurations', next);
                }}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              60 minutes (1 Hour)
            </label>
          </div>
        </div>
        <div>
          <label className={styles.label}>Experience (years)</label>
          <input
            type="number"
            value={values.experienceYears ?? ''}
            onChange={(e) => {
              const raw = e.target.value;
              onChange('experienceYears', raw === '' ? undefined : Number(raw));
            }}
            className={styles.input}
          />
        </div>
        <div className="md:col-span-2">
          <ChipsInput
            label="Expertise Subjects"
            items={values.expertiseSubjects || []}
            onChange={(items) => onChange('expertiseSubjects', items)}
            placeholder="Add subject"
            helperText="Press Enter or comma to add multiple."
            variant={variant}
          />
        </div>
        <div className="md:col-span-2">
          <ChipsInput
            label="Skills"
            items={values.skills || []}
            onChange={(items) => onChange('skills', items)}
            placeholder="Add skill"
            helperText="Press Enter or comma to add multiple."
            variant={variant}
          />
        </div>
        <div className="md:col-span-2">
          <label className={styles.label}>Achievements</label>
          <textarea
            value={values.achievements || ''}
            onChange={(e) => onChange('achievements', e.target.value)}
            rows={3}
            placeholder="Awards, certifications, notable results..."
            className={styles.textarea}
          />
        </div>
      </div>

      {showAvailability && (
        <div className="space-y-6">
          <div className="space-y-3">
            {showSectionTitles && <h4 className={styles.sectionTitle}>Weekly Availability</h4>}
            <AvailabilityPicker
              value={availabilityValue}
              onChange={onAvailabilityChange}
              variant={variant}
            />
          </div>

          {/* Block Holidays / Vacation Days Calendar */}
          <div className="p-5 rounded-2xl border border-gray-200 bg-white shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h4 className="text-sm font-semibold text-gray-900">Vacation & Blocked Days Planner</h4>
                <p className="text-xs text-gray-500 mt-0.5">Click on dates below to block booking requests for those days.</p>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-center">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1 px-2.5 rounded-lg border border-gray-200 text-xs font-semibold hover:bg-gray-50 transition-colors"
                >
                  ◀
                </button>
                <span className="text-xs font-bold text-gray-800 min-w-[100px] text-center select-none">
                  {monthNames[month]} {year}
                </span>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1 px-2.5 rounded-lg border border-gray-200 text-xs font-semibold hover:bg-gray-50 transition-colors"
                >
                  ▶
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="max-w-md">
              <div className="grid grid-cols-7 gap-1 text-center mb-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                <div>Su</div>
                <div>Mo</div>
                <div>Tu</div>
                <div>We</div>
                <div>Th</div>
                <div>Fr</div>
                <div>Sa</div>
              </div>
              <div className="grid grid-cols-7 gap-1">
                {blankDays.map((_, idx) => (
                  <div key={`blank-${idx}`} className="h-9" />
                ))}
                {monthDays.map((dayNum) => {
                  const dayDateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${dayNum.toString().padStart(2, '0')}`;
                  const isOffday = (values.offdays || []).includes(dayDateStr);
                  return (
                    <button
                      key={dayDateStr}
                      type="button"
                      onClick={() => toggleOffday(dayDateStr)}
                      className={`h-9 w-9 text-xs rounded-xl flex items-center justify-center font-medium transition-all select-none hover:scale-105 active:scale-95 ${
                        isOffday
                          ? 'bg-rose-600 text-white font-bold shadow-md shadow-rose-200/50'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-150'
                      }`}
                    >
                      {dayNum}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Blocked Summary */}
            {(values.offdays || []).length > 0 && (
              <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Blocked Dates:
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-[70px] overflow-y-auto">
                  {(values.offdays || []).map((d) => (
                    <span
                      key={`badge-${d}`}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-600 bg-gray-100 px-2.5 py-0.5 rounded-full border border-gray-200"
                    >
                      {d}
                      <button
                        type="button"
                        onClick={() => toggleOffday(d)}
                        className="text-gray-400 hover:text-gray-600 font-bold"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TutorProfileFields;
