"use client";

import React, { useState } from "react";
import {
  MoreVertical,
  ArrowUpRight,
  Search,
  Filter,
  Briefcase,
  Clock,
  DollarSign,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { useGetAssignmentsQuery, Assignment } from "@/lib/services/assignments";
import { format } from "date-fns";

const TutorDashboard = ({ user }: { user: any }) => {
  // 1. Fetch Assignments
  // We want "Ongoing Projects" (assigned to me) and "Available Assignments" (market)
  // Assuming strict filtering might not be available on 'getAssignments', we fetch and filter client-side for now
  // or pass params if the API supports it. We'll try passing status.

  const { data: assignmentsData, isLoading } = useGetAssignmentsQuery({});

  const allAssignments = assignmentsData?.data || [];

  // Filter for Ongoing Projects (Assigned to current user)
  // Note: Adjust logic if 'assignedTutor' object structure matches user._id or user.id
  const ongoingProjects = allAssignments.filter(
    (a) => a.assignedTutor?._id === user?._id && a.status === 'assigned'
  );

  // Filter for Market (Pending/Open assignments)
  const availableAssignments = allAssignments.filter(
    (a) => a.status === 'pending' || a.status === 'draft' // Assuming pending is the state for open market
  );

  const StatCard = ({
    title,
    value,
    subtitle,
    colorClass,
    iconClass,
    trend,
  }: {
    title: string;
    value: string;
    subtitle: string;
    colorClass: string;
    iconClass: string;
    trend?: string;
  }) => (
    <div className={`rounded-[2rem] p-6 relative overflow-hidden ${colorClass}`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className={`p-2 rounded-full ${iconClass} bg-opacity-20`}>
              <DollarSign size={16} className={iconClass.replace('bg-', 'text-')} />
            </div>
            <span className="font-semibold text-gray-700">{title}</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        </div>
        <button className="p-1 hover:bg-black/5 rounded-full transition-colors">
          <MoreVertical size={20} className="text-gray-500" />
        </button>
      </div>

      <p className="text-sm text-gray-500 mb-2">{subtitle}</p>

      {trend && (
        <div className="flex items-center gap-1 text-xs font-medium bg-white/50 w-fit px-2 py-1 rounded-full">
          <TrendingUp size={12} className="text-green-600" />
          <span className="text-green-600">{trend}</span>
        </div>
      )}
    </div>
  );

  const ProjectCard = ({ assignment }: { assignment: Assignment }) => (
    <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
            {assignment.title.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <h4 className="font-bold text-gray-900">{assignment.title}</h4>
            <p className="text-xs text-gray-500">{assignment.subject}</p>
          </div>
        </div>
        <button className="p-1 text-gray-400 hover:text-gray-600">
          <MoreVertical size={18} />
        </button>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs text-gray-400">Budget</p>
          <p className="font-bold text-gray-900">${assignment.estimatedCost}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">Deadline</p>
          <p className="font-bold text-gray-900 text-sm">
            {format(new Date(assignment.deadline), 'MMM d, yyyy')}
          </p>
        </div>
      </div>

      <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '60%' }}></div>
      </div>
      <div className="flex justify-between items-center text-xs text-gray-500">
        <span>Progress</span>
        <span>60%</span> {/* Placeholder progress */}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500">Welcome back, {user?.name}</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50">
              <Search size={20} className="text-gray-500" />
            </button>
            <button className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50">
              <Filter size={20} className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* Ongoing Projects Section */}
        <div className="mb-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Ongoing Projects</h2>
            <button className="text-sm font-medium text-gray-500 hover:text-gray-900 flex items-center gap-1">
              View All <ChevronRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Stat Card as a summary */}
            <StatCard
              title="Total Earnings"
              value="$17,643.41"
              subtitle="Portfolio Balance"
              colorClass="bg-[#E3F2FD]"
              iconClass="bg-blue-500 text-blue-500"
              trend="+2.5%"
            />

            {/* Dynamic Project Cards */}
            {ongoingProjects.slice(0, 2).map(assignment => (
              <ProjectCard key={assignment._id} assignment={assignment} />
            ))}

            {ongoingProjects.length === 0 && (
              <div className="col-span-1 md:col-span-2 flex flex-col items-center justify-center p-8 bg-white rounded-[2rem] border border-dashed border-gray-300">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                  <Briefcase className="text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">No ongoing projects</p>
                <p className="text-sm text-gray-400">Start bidding on assignments to get simplified!</p>
              </div>
            )}
          </div>
        </div>

        {/* Market / Available Assignments Section */}
        <div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Available Assignments</h2>
              <p className="text-sm text-gray-500">Latest opportunities for you</p>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-black text-white rounded-xl text-sm font-medium">Top Gainers</button>
              <button className="px-4 py-2 bg-white text-gray-600 border border-gray-200 rounded-xl text-sm font-medium">Recent</button>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Assignment</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Subject</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Budget</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Deadline</th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {availableAssignments.slice(0, 10).map((assignment) => (
                    <tr key={assignment._id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-xs group-hover:bg-black group-hover:text-white transition-colors">
                            {assignment.title.substring(0, 1).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-gray-900">{assignment.title}</div>
                            <div className="text-xs text-gray-500">{assignment.priority} Priority</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-700">{assignment.subject}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-bold text-green-600">${assignment.estimatedCost}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock size={14} className="mr-1" />
                          {format(new Date(assignment.deadline), 'MMM d')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button className="text-gray-400 hover:text-black transition-colors">
                          <ArrowUpRight size={20} />
                        </button>
                      </td>
                    </tr>
                  ))}

                  {availableAssignments.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        No available assignments found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorDashboard;