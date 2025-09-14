'use client'
import React, { useState } from 'react'
import { BarChart3, TrendingUp, Users, Clock, BookOpen, Target, Calendar, Award } from 'lucide-react'
import DashboardLayout from '@/components/DashboardLayout'
import TutorComponent from '@/components/TutorComponent'

const AnalyticsPage = () => {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month')
  
  // Mock analytics data
  const stats = {
    totalSessions: 24,
    totalHours: 36,
    studentsHelped: 12,
    averageRating: 4.8,
    completionRate: 92,
    responseTime: '2.3 min'
  }
  
  const weeklyData = [
    { day: 'Mon', sessions: 3, hours: 4.5 },
    { day: 'Tue', sessions: 2, hours: 3 },
    { day: 'Wed', sessions: 4, hours: 6 },
    { day: 'Thu', sessions: 3, hours: 4.5 },
    { day: 'Fri', sessions: 5, hours: 7.5 },
    { day: 'Sat', sessions: 4, hours: 6 },
    { day: 'Sun', sessions: 3, hours: 4.5 }
  ]
  
  const subjectBreakdown = [
    { subject: 'Mathematics', sessions: 8, percentage: 33 },
    { subject: 'Physics', sessions: 6, percentage: 25 },
    { subject: 'Chemistry', sessions: 5, percentage: 21 },
    { subject: 'Biology', sessions: 3, percentage: 13 },
    { subject: 'Computer Science', sessions: 2, percentage: 8 }
  ]
  
  const recentAchievements = [
    { title: 'Top Tutor', description: 'Highest rated tutor this month', icon: Award, color: 'text-yellow-600' },
    { title: 'Quick Responder', description: 'Average response time under 3 minutes', icon: Clock, color: 'text-blue-600' },
    { title: 'Student Favorite', description: '10+ positive reviews', icon: Users, color: 'text-primary-600' }
  ]
  
  const StatCard = ({ title, value, subtitle, icon: Icon, trend }: any) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
        <div className="p-3 bg-primary-100 rounded-full">
          <Icon className="w-6 h-6 text-primary-600" />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center">
          <TrendingUp className="w-4 h-4 text-primary-300 mr-1" />
          <span className="text-sm text-primary-600 font-medium">{trend}% from last {timeRange}</span>
        </div>
      )}
    </div>
  )
  
  return (
      <div className="min-h-screen bg-[#f6f6f6] p-6">
        <TutorComponent/>
      </div>
    
  )
}

export default AnalyticsPage