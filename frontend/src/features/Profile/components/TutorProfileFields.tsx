'use client';

import React from 'react';
import { Briefcase, GraduationCap, Building2, Monitor, Clock, CalendarOff, Trophy, ChevronLeft, ChevronRight } from 'lucide-react';
import { TutorProfile } from '@/lib/services/profile';
import AvailabilityPicker from './AvailabilityPicker';
import ChipsInput from './ChipsInput';
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

/* ── Shared sub-component: mini section divider ──────────────────────── */
const SectionLabel = ({ icon: Icon, title, subtitle }: { icon: React.ComponentType<any>; title: string; subtitle?: string }) => (
  <div className="flex items-center gap-2.5 pb-3 mb-4 border-b border-gray-100">
    <div className="w-7 h-7 rounded-lg bg-black text-white flex items-center justify-center">
      <Icon className="w-3.5 h-3.5" />
    </div>
    <div>
      <h4 className="text-sm font-bold text-gray-900 leading-tight">{title}</h4>
      {subtitle && <p className="text-[11px] text-gray-400">{subtitle}</p>}
    </div>
  </div>
);

/* ── Shared input classes ────────────────────────────────────────────── */
const inputCx = 'w-full px-4 py-3 bg-gray-50/50 hover:bg-gray-50 border border-gray-200 focus:border-black focus:bg-white rounded-2xl transition-all duration-200 outline-none text-gray-900 placeholder-gray-400 font-medium text-sm focus:ring-2 focus:ring-black/10';
const selectCx = 'w-full px-4 py-3 bg-gray-50/50 hover:bg-gray-50 border border-gray-200 focus:border-black focus:bg-white rounded-2xl transition-all duration-200 outline-none text-gray-900 font-medium text-sm focus:ring-2 focus:ring-black/10';
const textareaCx = 'w-full px-4 py-3 bg-gray-50/50 hover:bg-gray-50 border border-gray-200 focus:border-black focus:bg-white rounded-2xl transition-all duration-200 outline-none text-gray-900 placeholder-gray-400 font-medium text-sm focus:ring-2 focus:ring-black/10 resize-none leading-relaxed';
const labelCx = 'block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2';

const TEACHING_MODES = [
  { value: '', label: 'Select mode' },
  { value: 'Online', label: '🌐  Online' },
  { value: 'Offline', label: '🏫  In-Person' },
  { value: 'Hybrid', label: '🔄  Hybrid' },
];

const TutorProfileFields: React.FC<TutorProfileFieldsProps> = ({
  values,
  onChange,
  availabilityValue,
  onAvailabilityChange,
  showSectionTitles = true,
  showAvailability = true,
}) => {
  const [currentMonth, setCurrentMonth] = React.useState(() => new Date());

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const blankDays = Array.from({ length: firstDayOfMonth });
  const monthDays = Array.from({ length: totalDaysInMonth }, (_, i) => i + 1);

  const toggleOffday = (dateStr: string) => {
    const current = values.offdays || [];
    const next = current.includes(dateStr)
      ? current.filter((d) => d !== dateStr)
      : [...current, dateStr];
    onChange('offdays', next);
  };

  const allowedDurations = values.allowedSessionDurations || [30, 60];

  return (
    <div className="space-y-8">
      {/* ── Professional Profile ─────────────────────────────────────── */}
      {showSectionTitles && (
        <SectionLabel icon={Briefcase} title="Professional Profile" subtitle="Your credentials and teaching details" />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className={labelCx}>Professional Title</label>
          <input
            type="text"
            value={values.professionalTitle || ''}
            onChange={(e) => onChange('professionalTitle', e.target.value)}
            placeholder="e.g. Senior Mathematics Tutor"
            className={inputCx}
          />
        </div>
        <div>
          <label className={labelCx}>
            <span className="inline-flex items-center gap-1.5">Qualification</span>
          </label>
          <input
            type="text"
            value={values.qualification || ''}
            onChange={(e) => onChange('qualification', e.target.value)}
            placeholder="e.g. PhD in Economics"
            className={inputCx}
          />
        </div>
        <div>
          <label className={labelCx}>Current Institution</label>
          <input
            type="text"
            value={values.currentInstitution || ''}
            onChange={(e) => onChange('currentInstitution', e.target.value)}
            placeholder="e.g. North South University"
            className={inputCx}
          />
        </div>
        <div>
          <label className={labelCx}>Teaching Mode</label>
          <select
            value={values.teachingMode || ''}
            onChange={(e) => onChange('teachingMode', e.target.value || undefined)}
            className={selectCx}
          >
            {TEACHING_MODES.map((mode) => (
              <option key={mode.value} value={mode.value}>{mode.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCx}>Experience (years)</label>
          <input
            type="number"
            value={values.experienceYears ?? ''}
            onChange={(e) => {
              const raw = e.target.value;
              onChange('experienceYears', raw === '' ? undefined : Number(raw));
            }}
            placeholder="e.g. 5"
            className={inputCx}
          />
        </div>
      </div>

      {/* ── Pricing & Session Config ─────────────────────────────────── */}
      <div>
        {showSectionTitles && (
          <SectionLabel icon={Clock} title="Pricing & Sessions" subtitle="Set your rates and session configurations" />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={labelCx}>Hourly Rate (BDT)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">৳</span>
              <input
                type="number"
                value={values.hourlyRate ?? ''}
                onChange={(e) => {
                  const raw = e.target.value;
                  onChange('hourlyRate', raw === '' ? undefined : Number(raw));
                }}
                placeholder="e.g. 800"
                className={`${inputCx} pl-9`}
              />
            </div>
          </div>
          <div>
            <label className={labelCx}>Half-Hourly Rate (BDT)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">৳</span>
              <input
                type="number"
                value={values.halfHourlyRate ?? ''}
                onChange={(e) => {
                  const raw = e.target.value;
                  onChange('halfHourlyRate', raw === '' ? undefined : Number(raw));
                }}
                placeholder={values.hourlyRate ? `Suggested: ${Math.round(values.hourlyRate * 0.6)}` : 'e.g. 500'}
                className={`${inputCx} pl-9`}
              />
            </div>
          </div>

          {/* Session Lengths — Toggle Pill Style */}
          <div className="md:col-span-2">
            <label className={labelCx}>Allowed Session Lengths</label>
            <div className="flex gap-3 mt-1">
              <button
                type="button"
                onClick={() => {
                  const current = values.allowedSessionDurations || [30, 60];
                  const next = current.includes(30)
                    ? current.filter((v) => v !== 30)
                    : [...current, 30];
                  onChange('allowedSessionDurations', next);
                }}
                className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl border-2 text-sm font-bold transition-all duration-200 select-none ${
                  allowedDurations.includes(30)
                    ? 'border-gray-200 bg-secondary-500 text-black shadow-md shadow-gray-200'
                    : 'border-gray-200 bg-white text-gray-400 hover:border-gray-300 hover:text-gray-600'
                }`}
              >
                <Clock className="w-4 h-4" />
                30 min
                {allowedDurations.includes(30) && (
                  <span className="w-4 h-4 rounded-full bg-white text-black text-[10px] flex items-center justify-center font-bold">✓</span>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  const current = values.allowedSessionDurations || [30, 60];
                  const next = current.includes(60)
                    ? current.filter((v) => v !== 60)
                    : [...current, 60];
                  onChange('allowedSessionDurations', next);
                }}
                className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl border-2 text-sm font-bold transition-all duration-200 select-none ${
                  allowedDurations.includes(60)
                    ? 'border-secondary-200 bg-secondary-500 text-black shadow-md shadow-gray-200'
                    : 'border-gray-200 bg-white text-gray-400 hover:border-gray-300 hover:text-gray-600'
                }`}
              >
                <Clock className="w-4 h-4" />
                60 min
                {allowedDurations.includes(60) && (
                  <span className="w-4 h-4 rounded-full bg-white text-black text-[10px] flex items-center justify-center font-bold">✓</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Expertise & Skills ───────────────────────────────────────── */}
      <div>
        {showSectionTitles && (
          <SectionLabel icon={GraduationCap} title="Expertise & Skills" subtitle="Subjects and skills you teach" />
        )}

        <div className="space-y-5">
          <ChipsInput
            label="Expertise Subjects"
            items={values.expertiseSubjects || []}
            onChange={(items) => onChange('expertiseSubjects', items)}
            placeholder="Add a subject (e.g. Mathematics)"
            helperText="Press Enter or comma to add. Backspace to remove."
            variant="profile"
          />
          <ChipsInput
            label="Skills"
            items={values.skills || []}
            onChange={(items) => onChange('skills', items)}
            placeholder="Add a skill (e.g. Problem Solving)"
            helperText="Press Enter or comma to add. Backspace to remove."
            variant="profile"
          />
        </div>
      </div>

      {/* ── Achievements ─────────────────────────────────────────────── */}
      <div>
        {showSectionTitles && (
          <SectionLabel icon={Trophy} title="Achievements" subtitle="Awards, certifications, and notable results" />
        )}
        <textarea
          value={values.achievements || ''}
          onChange={(e) => onChange('achievements', e.target.value)}
          rows={3}
          placeholder="Awards, certifications, notable results..."
          className={textareaCx}
        />
      </div>

      {/* ── Weekly Availability & Vacation Calendar ───────────────── */}
      {showAvailability && (
        <div className="space-y-6">
          {/* Weekly Availability */}
          <div>
            {showSectionTitles && (
              <SectionLabel icon={Clock} title="Weekly Availability" subtitle="Set your working days and time slots" />
            )}
            <AvailabilityPicker
              value={availabilityValue}
              onChange={onAvailabilityChange}
              variant="profile"
            />
          </div>

          {/* Vacation Planner */}
          <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
            <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                  <CalendarOff className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Blocked Days</h4>
                  <p className="text-[11px] text-gray-400">Click dates to block booking requests.</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-bold text-gray-800 min-w-[110px] text-center select-none">
                  {monthNames[month]} {year}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-5">
              <div className="max-w-sm mx-auto">
                {/* Week Headers */}
                <div className="grid grid-cols-7 gap-1 text-center mb-2">
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                    <div key={d} className="text-[10px] font-bold text-gray-400 uppercase tracking-wider py-1">
                      {d}
                    </div>
                  ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-1">
                  {blankDays.map((_, idx) => (
                    <div key={`blank-${idx}`} className="h-9" />
                  ))}
                  {monthDays.map((dayNum) => {
                    const dayDateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${dayNum.toString().padStart(2, '0')}`;
                    const isOffday = (values.offdays || []).includes(dayDateStr);
                    const today = new Date();
                    const isToday =
                      today.getFullYear() === year &&
                      today.getMonth() === month &&
                      today.getDate() === dayNum;

                    return (
                      <button
                        key={dayDateStr}
                        type="button"
                        onClick={() => toggleOffday(dayDateStr)}
                        className={`h-9 w-full text-xs rounded-xl flex items-center justify-center font-semibold transition-all select-none hover:scale-105 active:scale-95 ${
                          isOffday
                            ? 'bg-rose-600 text-white font-bold shadow-md shadow-rose-200/50'
                            : isToday
                              ? 'bg-black text-white'
                              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
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
                <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {(values.offdays || []).length} blocked
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-[56px] overflow-y-auto">
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
        </div>
      )}
    </div>
  );
};

export default TutorProfileFields;
