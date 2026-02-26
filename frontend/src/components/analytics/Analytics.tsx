'use client'
import React, { useState } from 'react'
import { BarChart3, TrendingUp, Users, Clock, BookOpen, Target, Calendar, Award } from 'lucide-react'

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
    <div>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
              <p className="text-gray-600">Track your tutoring performance and progress</p>
            </div>
            <div className="flex bg-white rounded-lg border border-gray-300">
              {(['week', 'month', 'quarter', 'year'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 text-sm font-medium capitalize ${timeRange === range
                      ? 'bg-primary-300 text-white'
                      : 'text-gray-700 hover:text-gray-900'
                    } ${range === 'week' ? 'rounded-l-lg' : range === 'year' ? 'rounded-r-lg' : ''}`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <StatCard
              title="Total Sessions"
              value={stats.totalSessions}
              icon={BookOpen}
              trend={12}
            />
            <StatCard
              title="Hours Tutored"
              value={`${stats.totalHours}h`}
              icon={Clock}
              trend={8}
            />
            <StatCard
              title="Students Helped"
              value={stats.studentsHelped}
              icon={Users}
              trend={15}
            />
            <StatCard
              title="Average Rating"
              value={stats.averageRating}
              subtitle="out of 5.0"
              icon={Award}
              trend={5}
            />
            <StatCard
              title="Completion Rate"
              value={`${stats.completionRate}%`}
              icon={Target}
              trend={3}
            />
            <StatCard
              title="Avg Response Time"
              value={stats.responseTime}
              icon={Clock}
              trend={-12}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Weekly Activity Chart */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Activity</h3>
              <div className="space-y-4">
                {weeklyData.map((day, index) => (
                  <div key={day.day} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 w-12">{day.day}</span>
                    <div className="flex-1 mx-4">
                      <div className="bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary-300 h-2 rounded-full"
                          style={{ width: `${(day.sessions / 5) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">{day.sessions} sessions</div>
                      <div className="text-xs text-gray-500">{day.hours}h</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Subject Breakdown */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Subject Breakdown</h3>
              <div className="space-y-4">
                {subjectBreakdown.map((subject, index) => (
                  <div key={subject.subject} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{subject.subject}</span>
                    <div className="flex items-center space-x-3">
                      <div className="flex-1 w-24">
                        <div className="bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${subject.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                      <span className="text-sm text-gray-600 w-12 text-right">{subject.sessions}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Achievements */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Achievements</h3>
              <div className="space-y-4">
                {recentAchievements.map((achievement, index) => {
                  const Icon = achievement.icon
                  return (
                    <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className={`p-2 rounded-full bg-white ${achievement.color}`}>
                        <Icon size={20} />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{achievement.title}</h4>
                        <p className="text-sm text-gray-600">{achievement.description}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Performance Summary */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Summary</h3>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-600 mb-2">A+</div>
                  <p className="text-sm text-gray-600">Overall Grade</p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Punctuality</span>
                    <span className="text-sm font-medium text-gray-900">98%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Preparation</span>
                    <span className="text-sm font-medium text-gray-900">95%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Communication</span>
                    <span className="text-sm font-medium text-gray-900">97%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Knowledge</span>
                    <span className="text-sm font-medium text-gray-900">94%</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <button className="w-full bg-primary-300 hover:bg-primary-600 text-white py-2 px-4 rounded-lg text-sm font-medium">
                    View Detailed Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnalyticsPage