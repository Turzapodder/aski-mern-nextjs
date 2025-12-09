"use client";

import React from "react";
import {
  CheckCircle,
  ChevronUp,
  MoreVertical,
  Clock,
  AlertCircle,
  PlayCircle
} from "lucide-react";
import Image from "next/image";
import UploadProjectForm from "./UploadProjectForm";
import { useGetAssignmentsQuery, Assignment } from "@/lib/services/assignments";
import Link from "next/link";
import { useRouter } from "next/navigation";

const TopStats = ({ assignments }: { assignments: Assignment[] }) => {
  const completedCount = assignments.filter(a => a.status === 'completed').length;
  const pendingCount = assignments.filter(a => ['pending', 'draft'].includes(a.status)).length;
  const overdueCount = assignments.filter(a => a.status === 'overdue').length;
  const activeCount = assignments.filter(a => ['assigned', 'submitted'].includes(a.status)).length;

  const stats = [
    {
      icon: "/assets/icons/tick.png",
      count: completedCount,
      label: "Completed",
      color: "text-blue-500",
    },
    {
      icon: "/assets/icons/clock.png",
      count: pendingCount,
      label: "Pending",
      color: "text-orange-500",
    },
    {
      icon: "/assets/icons/fire.png",
      count: overdueCount,
      label: "Overdue",
      color: "text-red-500",
    },
    {
      icon: "/assets/icons/rocket.png",
      count: activeCount,
      label: "Active",
      color: "text-purple-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8 ">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="flex items-center space-x-3 bg-white p-8 rounded-3xl"
        >
          <div className="w-[40px] h-[40px] overflow-hidden">
            <Image
              src={stat.icon}
              alt={stat.label}
              width={40}
              height={40}
              className="h-full object-cover"
            />
          </div>
          <div className="text-2xl font-semibold text-gray-900">
            {stat.count}
          </div>
          <div className="text-md text-black">{stat.label}</div>
        </div>
      ))}
    </div>
  );
};

const TaskItem = ({ task }: { task: Assignment }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const getIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'pending':
      case 'draft':
        return <Clock className="w-6 h-6 text-orange-500" />;
      case 'overdue':
        return <AlertCircle className="w-6 h-6 text-red-500" />;
      default:
        return <PlayCircle className="w-6 h-6 text-blue-500" />;
    }
  };

  const getIconBg = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100';
      case 'pending':
      case 'draft': return 'bg-orange-100';
      case 'overdue': return 'bg-red-100';
      default: return 'bg-blue-100';
    }
  };

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center space-x-4 mb-2 p-4 border flex-1 border-gray-100 bg-white rounded-2xl shadow-md shadow-gray-100 hover:shadow-sm transition-shadow">
        <div
          className={`w-12 h-12 rounded-full ${getIconBg(task.status)} flex items-center justify-center`}
        >
          {getIcon(task.status)}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full items-center">
          {/* Task Title and Subtitle */}
          <div className="col-span-1 md:col-span-1 lg:col-span-2">
            <h3 className="font-semibold text-lg text-gray-900">{task.title}</h3>
            <p className="text-sm text-gray-500">{task.subject} • {task.topics.slice(0, 2).join(', ')}</p>
          </div>

          {/* Due Date Section */}
          <div className="col-span-1 flex items-center space-x-1 text-sm font-medium text-black justify-start">
            <div className="w-[40px] h-[40px] overflow-hidden">
              <Image
                src="/assets/icons/calender-icon.png"
                alt="calendar"
                width={40}
                height={40}
                className="h-full object-cover"
              />
            </div>
            <div className="flex flex-col sm:flex-row sm:space-x-1">
              <span>Due: {formatDate(task.deadline)}</span>
              <span>{formatTime(task.deadline)}</span>
            </div>
          </div>

          {/* Status Badge */}
          <div className="col-span-1 flex items-center justify-start md:justify-end">
            <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize
              ${task.status === 'completed' ? 'bg-green-100 text-green-800' :
                task.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                  task.status === 'overdue' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
              }`}>
              {task.status.replace('_', ' ')}
            </span>
          </div>
        </div>
        <Link href={`/user/assignments-detail/${task._id}`} className="p-1 hover:bg-gray-100 rounded">
          <MoreVertical className="w-6 h-6 text-black" />
        </Link>
      </div>
    </div>
  );
};

const ProjectSection = ({
  title,
  assignments,
  bgColor,
  shadow
}: {
  title: string;
  assignments: Assignment[];
  bgColor: string;
  shadow: string;
}) => {
  const router = useRouter();

  if (assignments.length === 0) {
    return (
      <div className={`mb-8 ${bgColor} p-8 rounded-3xl ${shadow ? " " + shadow + " shadow-gray-300" : ""}`}>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">{title}</h2>
        <div className="text-center py-8 text-gray-500">
          <p>No results found</p>
        </div>
      </div>
    );
  }

  const displayAssignments = assignments.slice(0, 3);
  const hasMore = assignments.length > 3;

  return (
    <div
      className={`mb-8 ${bgColor} p-8 rounded-3xl ${shadow ? " " + shadow + " shadow-gray-300" : ""
        }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
          <span className="bg-gray-100 text-black font-semibold text-sm px-2 shadow-md py-0.5 rounded-lg">
            {assignments.length}
          </span>
        </div>
        {hasMore && (
          <button
            onClick={() => router.push('/user/assignments')}
            className="text-primary-600 hover:text-primary-700 font-medium text-sm"
          >
            View All
          </button>
        )}
      </div>

      <div className="space-y-3">
        {displayAssignments.map((assignment) => (
          <TaskItem key={assignment._id} task={assignment} />
        ))}
      </div>
    </div>
  );
};

const DashboardComponent = () => {
  const { data: assignmentsData, isLoading } = useGetAssignmentsQuery({});
  const assignments = assignmentsData?.data || [];

  const ongoingAssignments = assignments.filter(a => ['assigned', 'submitted', 'in_progress'].includes(a.status));
  const completedAssignments = assignments.filter(a => a.status === 'completed');
  const pendingAssignments = assignments.filter(a => ['pending', 'draft'].includes(a.status));


  return (
    <div className=" bg-[#f6f6f6] ">
      <div className=" mx-auto">
        <TopStats assignments={assignments} />
        <div className="mb-12">
          <UploadProjectForm
            maxWidth=""
            onSubmit={async (formData) => {
              console.log('Form submitted:', formData)

              try {
                // Create FormData for file upload
                const submitFormData = new FormData()

                // Prepare assignment data
                const assignmentData = {
                  title: formData.title,
                  description: formData.description,
                  subject: formData.subject,
                  topics: formData.topics,
                  deadline: formData.deadline || new Date().toISOString(),
                  estimatedCost: formData.budget || 0,
                  priority: 'medium',
                  status: 'pending'
                }

                // Add assignment data to FormData
                Object.keys(assignmentData).forEach(key => {
                  if (key === 'topics') {
                    // Append each topic separately so multer parses it as an array (or single value)
                    assignmentData.topics.forEach((topic: string) => {
                      submitFormData.append('topics', topic)
                    })
                  } else {
                    submitFormData.append(key, (assignmentData as any)[key])
                  }
                })

                // Add files if exist
                if (formData.files && formData.files.length > 0) {
                  formData.files.forEach((file: File) => {
                    submitFormData.append('attachments', file)
                  })
                }

                // Submit to assignment API
                const response = await fetch('http://localhost:8000/api/assignments', {
                  method: 'POST',
                  body: submitFormData,
                  credentials: 'include' // Include cookies for authentication
                })

                if (!response.ok) {
                  const errorData = await response.json()
                  console.error('Server error:', errorData)
                  throw new Error(`Failed to create assignment: ${errorData.message || response.statusText}`)
                }

                const result = await response.json()
                console.log('Assignment created successfully:', result)

                // Show success message or redirect
                alert('Assignment posted successfully!')
                // Optionally refetch assignments here if not using RTK Query auto-refetch

              } catch (error) {
                console.error('Failed to submit assignment:', error)
                alert('Failed to post assignment. Please try again.')
              }
            }}
            onCancel={() => {
              console.log('Form cancelled')
              // Handle form cancellation
            }}
            onSaveDraft={(formData) => {
              console.log('Draft saved:', formData)
              // Handle draft saving
            }}
            advanced={false}
          />
        </div>

        <ProjectSection
          title="Ongoing Projects"
          assignments={ongoingAssignments}
          bgColor="bg-white"
          shadow="shadow-lg"
        /><ProjectSection
          title="Pending Projects"
          assignments={pendingAssignments}
          bgColor="bg-gray-100"
          shadow="shadow-2xs"
        />
        <ProjectSection
          title="Completed Projects"
          assignments={completedAssignments}
          bgColor="bg-gray-100"
          shadow="shadow-2xs"
        />

      </div>
    </div>
  );
};

export default DashboardComponent;
