import React from 'react';
import Image from 'next/image';
import { Bookmark, CheckCircle, Flame, Star, BookOpen, User, GraduationCap } from 'lucide-react';
import { Teacher } from '@/types/TutorsList';
import useCurrency from '@/lib/hooks/useCurrency';

interface TeacherCardProps {
  teacher: Teacher;
  isBookmarked?: boolean;
  onToggleBookmark?: (tutorId: string) => void;
}

export const TeacherCard: React.FC<TeacherCardProps> = ({
  teacher,
  isBookmarked = false,
  onToggleBookmark,
}) => {
  const { format: formatAmount } = useCurrency();

  return (
    <div className="rounded-2xl p-6 relative flex flex-col h-full transition-transform hover:scale-[1.01] duration-200 bg-white text-gray-900 border border-gray-100 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div className="flex gap-3">
          <div className="relative w-20 h-20 rounded-xl overflow-hidden">
            <Image src={teacher.image} alt={teacher.name} fill className="object-cover" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              {teacher.isTopTutor && (
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded flex items-center gap-1 bg-emerald-100 text-emerald-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                  TOP Tutor
                </span>
              )}
              {teacher.isCertified && (
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded flex items-center gap-1 bg-purple-100 text-purple-700">
                  Certified
                </span>
              )}
              {teacher.isNewTutor && (
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded flex items-center gap-1 bg-blue-100 text-blue-700">
                  New Tutor
                </span>
              )}
              {teacher.isHighDemand && (
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded flex items-center gap-1 bg-rose-100 text-rose-700">
                  High Demand
                </span>
              )}
              {teacher.badges &&
                teacher.badges.map((badge, idx) => (
                  <span
                    key={idx}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      badge === 'IELTS' ? 'bg-black text-white' : 'bg-purple-100 text-purple-700'
                    }`}
                  >
                    {badge}
                  </span>
                ))}
              <span className="flex items-center text-xs font-bold text-amber-400">
                <Star className="w-3 h-3 fill-current mr-0.5" />
                {teacher.rating}
              </span>
              {teacher.badges && teacher.badges.includes('+2') && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-700">
                  +2
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-[15px]">{teacher.name}</h3>
              <CheckCircle className="w-4 h-4 text-purple-500 fill-purple-500 stroke-white" />
            </div>
            <span className="mt-1 inline-flex rounded-full border border-indigo-100 bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-700">
              {teacher.subject}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onToggleBookmark?.(teacher.id)}
          className={`p-1.5 rounded-full transition-colors ${
            isBookmarked
              ? 'bg-amber-50 text-amber-600 hover:bg-amber-100'
              : 'text-gray-400 hover:bg-gray-100'
          }`}
          aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
        >
          <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-amber-500' : ''}`} />
        </button>
      </div>

      <p className="text-[13px] leading-relaxed mb-6 grow text-gray-600">{teacher.bio}</p>

      <div className="grid grid-cols-2 gap-y-2 text-xs mb-6 text-gray-600">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-4 h-4" />
          <span>{teacher.lessons} lessons conducted</span>
        </div>
        <div className="col-span-1"></div>

        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4" />
          <span>{teacher.courses} courses</span>
        </div>
        <div className="flex items-center gap-2">
          <User className="w-4 h-4" />
          <span>{teacher.students}+ students</span>
        </div>
      </div>

      <div className="flex items-center justify-between mt-auto">
        <div className="flex items-center gap-1">
          <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
          {teacher.price > 0 ? (
            <>
              <span className="text-xl font-bold">{formatAmount(teacher.price)}</span>
              {teacher.originalPrice && (
                <span className="text-sm text-gray-500 line-through">
                  {formatAmount(teacher.originalPrice)}/hr
                </span>
              )}
              {!teacher.originalPrice && <span className="text-xs text-gray-500 top-0">/hr</span>}
            </>
          ) : (
            <span className="text-sm font-semibold text-gray-500">Contact for pricing</span>
          )}
        </div>
        <a
          href={`/user/tutors/tutor-profile/${teacher.id}`}
          className="px-5 py-2 rounded-[10px] text-sm font-semibold transition-colors bg-white border border-gray-200 text-gray-900 hover:bg-gray-50"
        >
          View More
        </a>
      </div>
    </div>
  );
};
