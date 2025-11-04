"use client";

import React from "react";
import {
  CheckCircle,
  ChevronUp,
  MoreVertical,
} from "lucide-react";
import Image from "next/image";
import UploadProjectForm from "./UploadProjectForm";

const TopStats = () => {
  const stats = [
    {
      icon: "/assets/icons/tick.png",
      count: 12,
      label: "Completed",
      color: "text-blue-500",
    },
    {
      icon: "/assets/icons/clock.png",
      count: 5,
      label: "Pending",
      color: "text-orange-500",
    },
    {
      icon: "/assets/icons/fire.png",
      count: 2,
      label: "Overdue",
      color: "text-red-500",
    },
    {
      icon: "/assets/icons/rocket.png",
      count: 3,
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
              alt={stat.icon}
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

const TaskItem = ({ task }: { task: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  subtitle: string;
  dueDate: string;
  dueTime: string;
  avatars: Array<{
    initials: string;
    bgColor: string;
  }>;
} }) => (
  <div className="flex items-center justify-between gap-2">
    <div className="flex items-center space-x-4 mb-2 p-4 border flex-1 border-gray-100 bg-white rounded-2xl shadow-md shadow-gray-100 hover:shadow-sm transition-shadow">
      <input
        type="checkbox"
        className="w-4 h-4 text-blue-600 border-gray-300 rounded cursor-pointer"
      />

      <div
        className={`w-12 h-12 rounded-full ${task.iconBg} flex items-center justify-center`}
      >
        {task.icon}
      </div>

     <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full items-center">
        {/* Task Title and Subtitle */}
        <div className="col-span-1 md:col-span-1 lg:col-span-2">
          <h3 className="font-semibold text-lg text-gray-900">{task.title}</h3>
          <p className="text-sm text-gray-500">{task.subtitle}</p>
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
            <span>Due: {task.dueDate}</span>
            <span>{task.dueTime}</span>
          </div>
        </div>

        {/* Avatars Section */}
        <div className="col-span-1 flex items-center justify-start md:justify-end">
          <div className="flex -space-x-2">
            {task.avatars.map((avatar: { initials: string; bgColor: string }, index: number) => (
              <div key={index} className="w-[40px] h-[40px] overflow-hidden rounded-full  border-gray-300 border-2">
                <Image
                  src={avatar.initials}
                  alt="user"
                  width={40}
                  height={40}
                  className="h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
    <button className="p-1 hover:bg-gray-100 rounded">
      <MoreVertical className="w-6 h-6 text-black" />
    </button>
  </div>
);

const ProjectSection = ({ 
  title, 
  date, 
  count, 
  bgColor, 
  shadow 
}: {
  title: string;
  date: string;
  count: number;
  bgColor: string;
  shadow: string;
}) => {
  const tasks = [
    {
      icon: <div className="w-6 h-6 bg-orange-500 rounded"></div>,
      iconBg: "bg-orange-100",
      title: "Complete Biology Lab Report",
      subtitle: "6 of 10 tasks completed",
      dueDate: "Today",
      dueTime: "11:00 AM",
      avatars: [
        { initials: "/assets/1.png", bgColor: "bg-red-500" },
        { initials: "/assets/4.png", bgColor: "bg-blue-500" },
      ],
    },
    {
      icon: <CheckCircle className="w-6 h-6 text-red-500" />,
      iconBg: "bg-red-100",
      title: "Study for Mathematics Final Exam",
      subtitle: "2 of 5 tasks completed",
      dueDate: "Apr 30, 2025",
      dueTime: "2:00 AM",
      avatars: [{ initials: "/assets/5.png", bgColor: "bg-blue-500" }],
    },
    {
      icon: <div className="w-6 h-6 bg-green-500 rounded-full"></div>,
      iconBg: "bg-green-100",
      title: "Research Paper on World History",
      subtitle: "1 of 2 tasks completed",
      dueDate: "May 1, 2025",
      dueTime: "4:30 PM",
      avatars: [
        { initials: "/assets/8.png", bgColor: "bg-red-500" },
        { initials: "/assets/1.png", bgColor: "bg-green-500" },
      ],
    },
  ];

  return (
    <div
      className={`mb-8 ${bgColor} p-8 rounded-3xl ${
        shadow ? " " + shadow + " shadow-gray-300" : ""
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center space-x-4">
            <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
            <span className="bg-gray-100 text-black font-semibold text-sm px-2 shadow-md py-0.5 rounded-lg">
              {count}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">{date}</p>
        </div>
        <button className="p-2 hover:bg-gray-100 rounded">
          <ChevronUp className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      <div className="space-y-3">
        {tasks.map((task, index) => (
          <TaskItem key={index} task={task} />
        ))}
      </div>
    </div>
  );
};

const DashboardComponent = () => {
  return (
    <div className=" bg-[#f6f6f6] ">
      <div className=" mx-auto">
         <TopStats />
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
                    title: formData.projectName,
                    description: formData.description,
                    subject: formData.projectName,
                    topics: formData.tags,
                    deadline: formData.deadline || new Date().toISOString(),
                    estimatedCost: 0,
                    priority: 'medium',
                    status: 'pending'
                  }
                  
                  // Add assignment data to FormData
                  Object.keys(assignmentData).forEach(key => {
                    if (key === 'topics') {
                      submitFormData.append(key, JSON.stringify(assignmentData[key]))
                    } else {
                      submitFormData.append(key, assignmentData[key])
                    }
                  })
                  
                  // Add file if exists
                  if (formData.file) {
                    submitFormData.append('attachments', formData.file)
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
          title="Ongoing Tasks"
          date="Monday, April 28, 2025"
          count={3}
          bgColor="bg-white"
          shadow="shadow-lg"
        />
        <ProjectSection
          title="Completed Tasks"
          date="Monday, April 28, 2025"
          count={1}
          bgColor="bg-gray-100"
          shadow="shadow-2xs"
        />
      </div>
    </div>
  );
};

export default DashboardComponent;
