'use client'
import React, { useState } from 'react'
import { Search, Filter, Bookmark, ChevronDown, CheckCircle, Flame, Star, BookOpen, User, GraduationCap, ArrowRight } from 'lucide-react'
import Image from 'next/image'

interface Teacher {
  id: string
  name: string
  subject: string
  bio: string
  lessons: number
  courses: number
  students: number
  rating: number
  price: number
  originalPrice?: number
  isTopTutor?: boolean
  isCertified?: boolean
  isNewTutor?: boolean
  isHighDemand?: boolean
  isOnlines?: boolean
  image: string
  badges?: string[]
  theme: 'dark' | 'light'
}

const TutorComponent = () => {
  const [isTeacherAccountActive, setIsTeacherAccountActive] = useState(false)

  const toggleTeacherAccount = () => {
    setIsTeacherAccountActive(!isTeacherAccountActive)
  }

  const economicsTeachers: Teacher[] = [
    {
      id: '1',
      name: 'Carole Towne',
      subject: 'Economics teacher',
      bio: "Ready to unravel the complexities of supply, demand, and market forces? Dive into my Economics course now!",
      lessons: 132,
      courses: 24,
      students: 250,
      rating: 4.9,
      price: 32,
      originalPrice: 46,
      isTopTutor: true,
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
      theme: 'dark'
    },
    {
      id: '2',
      name: 'Ralph Legros',
      subject: 'Economics teacher',
      bio: "From micro to macroeconomics, discover the keys to understanding economic phenomena in my comprehensive courses.",
      lessons: 174,
      courses: 32,
      students: 250,
      rating: 4.9,
      price: 23,
      originalPrice: 32,
      isCertified: true,
      badges: ['+2'],
      image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop',
      theme: 'dark'
    },
    {
      id: '3',
      name: 'Jenny Wilson',
      subject: 'Economics teacher',
      bio: "Economics isn't just a subject - it's the lens through which we view society. I will help you explore its profound implications.",
      lessons: 116,
      courses: 17,
      students: 150,
      rating: 4.9,
      price: 17,
      isTopTutor: true,
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop',
      theme: 'light'
    }
  ]

  const englishTeachers: Teacher[] = [
    {
      id: '4',
      name: 'Jeff Blanda-Bartoletti',
      subject: 'English teacher',
      bio: "Ready to sharpen your language skills and literary analysis? My courses offer the tools to excel in English studies.",
      lessons: 185,
      courses: 16,
      students: 100,
      rating: 4.9,
      price: 20,
      badges: ['IELTS'],
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
      theme: 'light'
    },
    {
      id: '5',
      name: 'Darla Fritsch',
      subject: 'English teacher',
      bio: "Transform your relationship with words and stories. Explore my English courses to unleash your creative potential.",
      lessons: 157,
      courses: 12,
      students: 50,
      rating: 4.9,
      price: 12,
      isNewTutor: true,
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop',
      theme: 'light'
    },
    {
      id: '6',
      name: 'Juliet Heidenreich',
      subject: 'English teacher',
      bio: "Hello Student! 👋 Let's talk results: My students reach B2 in 9 months; no fear of speaking in 3 months. Ready? Join! 🚀",
      lessons: 292,
      courses: 36,
      students: 300,
      rating: 4.9,
      price: 32,
      originalPrice: 42,
      isHighDemand: true,
      image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop',
      theme: 'dark'
    }
  ]

  const TeacherCard = ({ teacher }: { teacher: Teacher }) => {
    const isDark = teacher.theme === 'dark'

    return (
      <div className={`rounded-2xl p-6 relative flex flex-col h-full transition-transform hover:scale-[1.01] duration-200 ${isDark ? 'bg-[#18181b] text-white' : 'bg-white text-gray-900 border border-gray-100 shadow-sm'
        }`}>
        {/* Header: Avatar, Name, Badges */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-xl overflow-hidden">
                <Image
                  src={teacher.image}
                  alt={teacher.name}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                {teacher.isTopTutor && (
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded flex items-center gap-1 ${isDark ? 'bg-emerald-900/50 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                    TOP Tutor
                  </span>
                )}
                {teacher.isCertified && (
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded flex items-center gap-1 bg-purple-100 text-purple-700">
                    🏆 Certified
                  </span>
                )}
                {teacher.isNewTutor && (
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded flex items-center gap-1 bg-blue-100 text-blue-700">
                    🆕 New Tutor
                  </span>
                )}
                {teacher.isHighDemand && (
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded flex items-center gap-1 bg-rose-100 text-rose-700">
                    🔥 High Demand
                  </span>
                )}
                {teacher.badges && teacher.badges.map((badge, idx) => (
                  <span key={idx} className={`text-[10px] font-bold px-2 py-0.5 rounded ${badge === 'IELTS' ? 'bg-black text-white' : 'bg-purple-100 text-purple-700'
                    }`}>
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
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{teacher.subject}</p>
            </div>
          </div>
          <button className={`p-1.5 rounded-full transition-colors ${isDark ? 'hover:bg-gray-800 bg-[#27272a] text-purple-400' : 'hover:bg-gray-100 text-gray-400'
            }`}>
            <Bookmark className={`w-5 h-5 ${isDark ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Bio */}
        <p className={`text-[13px] leading-relaxed mb-6 flex-grow ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          {teacher.bio}
        </p>

        {/* Stats */}
        <div className={`grid grid-cols-2 gap-y-2 text-xs mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4" />
            <span>{teacher.lessons} lessons conducted</span>
          </div>
          {/* Placeholder for alignment if needed, or maybe just span grid */}
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

        {/* Footer: Price & Action */}
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-baseline gap-1">
            {isDark && <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />}
            <span className="text-xl font-bold">${teacher.price}</span>
            {teacher.originalPrice && (
              <span className="text-sm text-gray-500 line-through">${teacher.originalPrice}/hr</span>
            )}
            {!teacher.originalPrice && <span className="text-xs text-gray-500 top-0">/hr</span>}
          </div>
          <a href={`/user/tutors/tutor-profile/${teacher.id}`} className={`px-5 py-2 rounded-[10px] text-sm font-semibold transition-colors ${isDark
            ? 'bg-white text-black hover:bg-gray-100'
            : 'bg-white border border-gray-200 text-gray-900 hover:bg-gray-50'
            }`}>
            View More
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[1600px] mx-auto p-6 md:p-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Teachers</h1>
          <p className="text-gray-500 text-[15px]">
            Search for specific subjects and find the teachers you're ready to take a course with.
          </p>
        </div>

        {/* Toggle Switch */}
        <div className="flex items-center shrink-0">
          <button
            onClick={toggleTeacherAccount}
            className={`relative inline-flex h-12 w-fit items-center rounded-xl p-1 transition-colors focus:outline-none bg-purple-100 pr-4`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-6 flex items-center rounded-full px-1 duration-300 ease-in-out ${isTeacherAccountActive ? 'bg-purple-600 justify-end' : 'bg-gray-500 justify-start'}`}>
                <div className="bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ease-in-out"></div>
              </div>
              <span className="text-sm font-medium text-gray-800">Activate teacher account</span>
              <div className="w-5 h-5 rounded-full border border-gray-400 flex items-center justify-center text-xs text-gray-500">?</div>
            </div>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-10 items-center">
        <div className="relative flex-grow w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search teachers"
            className="w-full pl-11 pr-4 py-3 bg-white border-none rounded-xl shadow-sm outline-none text-gray-700 placeholder-gray-400 ring-1 ring-gray-100 focus:ring-2 focus:ring-purple-100"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-xl shadow-sm ring-1 ring-gray-100 cursor-pointer min-w-max">
            <span className="text-sm text-gray-500">Sort:</span>
            <span className="text-sm font-medium text-gray-900">Most popular</span>
            <ChevronDown className="w-4 h-4 text-gray-500 ml-1" />
          </div>

          <button className="p-3 bg-white rounded-xl shadow-sm ring-1 ring-gray-100 hover:bg-gray-50">
            <Filter className="w-5 h-5 text-gray-600" />
          </button>

          <button className="p-3 bg-white rounded-xl shadow-sm ring-1 ring-gray-100 hover:bg-gray-50">
            <Bookmark className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Economics Teachers Section */}
      <div className="mb-12">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-bold text-gray-800">Economics teachers</h2>
          <button className="text-sm font-semibold text-purple-600 flex items-center hover:text-purple-700">
            View all <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {economicsTeachers.map(teacher => (
            <TeacherCard key={teacher.id} teacher={teacher} />
          ))}
        </div>
      </div>

      {/* English Teachers Section */}
      <div className="mb-12">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-bold text-gray-800">English teachers</h2>
          <button className="text-sm font-semibold text-purple-600 flex items-center hover:text-purple-700">
            View all <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {englishTeachers.map(teacher => (
            <TeacherCard key={teacher.id} teacher={teacher} />
          ))}
        </div>
      </div>

    </div>
  )
}

export default TutorComponent