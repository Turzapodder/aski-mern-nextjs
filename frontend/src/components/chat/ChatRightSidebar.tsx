'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  X,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Video,
  FileText,
  Link as LinkIcon,
  Calendar,
  DollarSign,
  Clipboard,
  Clock,
  ExternalLink,
  Laptop,
  Pencil,
  Star
} from 'lucide-react';
import { useChatContext } from '@/contexts/ChatContext';
import { useGetChatAssignmentsQuery } from '@/lib/services/chat';
import { useGetUserQuery } from '@/lib/services/auth';
import { format } from 'date-fns';

const ChatRightSidebar = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { selectedChat, currentUserId, onlineUsers, messages } = useChatContext();
  const [expandedSection, setExpandedSection] = useState<string | null>('photos');
  const [expandedAssignmentId, setExpandedAssignmentId] = useState<string | null>(null);
  
  // Real-time session countdown timer
  const [sessionTimeRemaining, setSessionTimeRemaining] = useState<number>(0);

  // Fetch current user role
  const { data: userData } = useGetUserQuery();
  const currentUser = userData?.user;
  const isTutor = currentUser?.roles?.includes('tutor');

  // Fetch active assignments for this chat
  const { data: assignmentsResponse } = useGetChatAssignmentsQuery(
    selectedChat?._id || '',
    { skip: !selectedChat }
  );
  const activeAssignments = assignmentsResponse?.data || [];

  // Sort assignments: closest deadline first (most urgent)
  const sortedAssignments = [...activeAssignments].sort((a: any, b: any) => {
    if (!a.deadline) return 1;
    if (!b.deadline) return -1;
    return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
  });

  useEffect(() => {
    // Expand the closest deadline assignment by default
    if (sortedAssignments.length > 0 && !expandedAssignmentId) {
      setExpandedAssignmentId(sortedAssignments[0]._id);
    }
  }, [activeAssignments, expandedAssignmentId]);

  useEffect(() => {
    const session = selectedChat?.session as any;
    if (!session || !session.scheduledTime || session.status !== 'scheduled') {
      setSessionTimeRemaining(0);
      return;
    }

    const scheduledDate = new Date(session.scheduledTime);
    const updateTimer = () => {
      const now = new Date();
      const diff = scheduledDate.getTime() - now.getTime();
      if (diff <= 0) {
        setSessionTimeRemaining(0);
      } else {
        setSessionTimeRemaining(diff);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [selectedChat?.session]);

  if (!isOpen || !selectedChat) return null;

  const getChatName = () => {
    if (selectedChat.type === 'direct') {
      const otherParticipant = selectedChat.participants.find((p: any) => p._id !== currentUserId);
      return otherParticipant?.name || 'Unknown User';
    }
    return selectedChat.name || 'Group Chat';
  };

  const getChatAvatar = () => {
    if (selectedChat.avatar) return selectedChat.avatar;
    const otherParticipant = selectedChat.participants.find((p: any) => p._id !== currentUserId);
    return otherParticipant?.avatar;
  };

  const getChatDesignation = () => {
    if (selectedChat.type === 'group') return 'Study Collaboration Group';
    const otherParticipant = selectedChat.participants.find((p: any) => p._id !== currentUserId);
    const isOtherTutor = otherParticipant?.roles?.includes('tutor');
    return isOtherTutor ? 'Professional Academic Tutor' : 'Student Collaborator';
  };

  const isUserOnline = () => {
    if (selectedChat.type === 'group') return false;
    const otherParticipant = selectedChat.participants.find((p: any) => p._id !== currentUserId);
    return otherParticipant && onlineUsers.some((u) => u._id === otherParticipant._id);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatCountdown = (ms: number) => {
    const totalSecs = Math.floor(ms / 1000);
    const hours = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;

    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(hours)}h:${pad(mins)}m:${pad(secs)}s`;
  };

  const chatName = getChatName();
  const avatar = getChatAvatar();
  const designation = getChatDesignation();
  const session = selectedChat.session as any;

  const AccordionItem = ({
    id,
    title,
    icon: Icon,
    count,
    children,
  }: {
    id: string;
    title: string;
    icon: any;
    count?: number;
    children?: React.ReactNode;
  }) => {
    const isExpanded = expandedSection === id;

    return (
      <div className="border-b border-gray-100 last:border-0">
        <button
          onClick={() => setExpandedSection(isExpanded ? null : id)}
          className="w-full flex items-center justify-between py-3 px-1 hover:bg-gray-50/50 transition-colors rounded-lg"
        >
          <div className="flex items-center gap-3 text-gray-600">
            <Icon size={16} className="text-gray-400" />
            <span className="text-xs font-semibold text-gray-700">{title}</span>
          </div>
          <div className="flex items-center gap-2">
            {count !== undefined && (
              <span className="text-[10px] font-bold bg-gray-100 px-1.5 py-0.5 rounded-full text-gray-500">
                {count}
              </span>
            )}
            {isExpanded ? (
              <ChevronUp size={14} className="text-gray-400" />
            ) : (
              <ChevronDown size={14} className="text-gray-400" />
            )}
          </div>
        </button>
        {isExpanded && <div className="pb-3 px-1 animate-in fade-in slide-in-from-top-1 duration-200">{children}</div>}
      </div>
    );
  };

  const attachments = messages.flatMap((message: any) => message.attachments || []);
  const photos = attachments.filter((file: any) => file.mimetype?.startsWith('image/'));
  const videos = attachments.filter((file: any) => file.mimetype?.startsWith('video/'));
  const documents = attachments.filter(
    (file: any) =>
      !file.mimetype?.startsWith('image/') &&
      !file.mimetype?.startsWith('video/') &&
      !file.mimetype?.startsWith('audio/')
  );

  return (
    <div className="w-80 bg-white border-l border-gray-100 flex flex-col h-full shadow-sm">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-gray-100">
        <h3 className="text-sm font-bold text-gray-900">User Profile & Context</h3>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
        >
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
        {/* Profile Info - Main visual area at the top */}
        <div className="p-6 flex flex-col items-center border-b border-gray-50 bg-gradient-to-b from-indigo-50/10 to-transparent">
          <div className="relative mb-3">
            {avatar ? (
              <div className="relative w-20 h-20 rounded-full p-1 bg-white border-2 border-indigo-100 shadow-md">
                <img
                  src={avatar}
                  alt={chatName}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-2xl font-bold shadow-md border-2 border-indigo-100">
                {getInitials(chatName)}
              </div>
            )}
            {isUserOnline() && (
              <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full shadow-sm"></span>
            )}
          </div>
          
          <h4 className="text-base font-bold text-gray-900 text-center leading-tight mb-0.5">
            {chatName}
          </h4>
          <p className="text-[11px] font-medium text-indigo-600 text-center uppercase tracking-wider mb-2">
            {designation}
          </p>

          {selectedChat.type !== 'group' && (
            <div className="flex items-center gap-1 bg-amber-50 border border-amber-100 px-3 py-1 rounded-full text-amber-700 shadow-sm animate-in zoom-in duration-200">
              <Star className="h-3 w-3 fill-amber-500 stroke-amber-500" />
              <span className="text-[11px] font-bold">4.9</span>
              <span className="text-[10px] text-amber-600 font-medium">• (14 reviews)</span>
            </div>
          )}
        </div>

        {/* Live/Booked Session Card - Reminders */}
        {session && session.status === 'scheduled' && (
          <div className="p-4 border-b border-gray-100">
            <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">
              Live Session Reminder
            </h5>
            <div className="rounded-2xl border border-indigo-200 bg-indigo-600 text-white p-4 shadow-md relative overflow-hidden animate-in fade-in duration-300">
              {/* Decorative subtle background pattern */}
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-700 to-indigo-500 opacity-20" />
              
              <div className="relative z-10 space-y-3">
                <div className="flex items-center gap-2">
                  <Laptop className="h-4 w-4 text-indigo-200" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-100">
                    Tutoring Lesson
                  </span>
                </div>
                <div>
                  <p className="text-[10px] text-indigo-200/90 leading-tight">Subject Topic</p>
                  <p className="text-sm font-bold truncate">{session.subject || 'Subject Lesson'}</p>
                </div>
                
                {sessionTimeRemaining > 0 ? (
                  <div className="bg-white/10 rounded-xl p-2.5 border border-white/15">
                    <p className="text-[9px] text-indigo-200 uppercase font-bold tracking-wider mb-0.5">
                      Session Starts In
                    </p>
                    <p className="text-base font-bold font-mono tracking-tight">
                      {formatCountdown(sessionTimeRemaining)}
                    </p>
                  </div>
                ) : (
                  <div className="bg-emerald-500/20 rounded-xl p-2.5 border border-emerald-500/30 text-center animate-pulse">
                    <p className="text-[9px] text-emerald-200 uppercase font-bold tracking-wider mb-0.5">
                      Session Active
                    </p>
                    <p className="text-xs font-bold">Ready to Start Now</p>
                  </div>
                )}

                <div className="flex items-center justify-between text-[10px] text-indigo-100/80 pt-1">
                  <span className="flex items-center gap-1 font-semibold">
                    <Clock className="h-3 w-3" />
                    {session.duration} mins
                  </span>
                  <span className="font-semibold bg-white/10 px-2 py-0.5 rounded-md">
                    {format(new Date(session.scheduledTime), 'MMM dd, hh:mm a')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Active Assignments Queue */}
        {sortedAssignments.length > 0 && (
          <div className="p-4 border-b border-gray-100">
            <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">
              Active Tasks & Assignments ({sortedAssignments.length})
            </h5>
            <div className="space-y-2">
              {sortedAssignments.map((item: any, idx: number) => {
                const isExpanded = expandedAssignmentId === item._id;
                
                // Dynamic progress percent calculation
                let progressPercent = 15;
                let progressBarColor = 'bg-indigo-600';
                if (item.status === 'completed') {
                  progressPercent = 100;
                  progressBarColor = 'bg-emerald-500';
                } else if (item.status === 'in_progress') {
                  progressPercent = 60;
                  progressBarColor = 'bg-indigo-600';
                } else if (item.status === 'proposal_accepted') {
                  progressPercent = 30;
                  progressBarColor = 'bg-blue-500';
                }

                return (
                  <div
                    key={item._id}
                    className={`rounded-2xl border transition-all duration-200 ${
                      isExpanded
                        ? 'border-indigo-200 bg-indigo-50/20 p-4 shadow-sm'
                        : 'border-gray-100 bg-white hover:bg-gray-50/50 p-3'
                    }`}
                  >
                    <button
                      onClick={() => setExpandedAssignmentId(isExpanded ? null : item._id)}
                      className="w-full flex items-start justify-between text-left gap-2"
                    >
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-bold text-gray-900 block truncate leading-tight">
                          {item.title || 'Assignment'}
                        </span>
                        {!isExpanded && (
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-gray-400 uppercase font-bold">
                              Budget: ${item.budget ?? item.estimatedCost ?? 0}
                            </span>
                            <span className="text-[10px] text-indigo-500 font-semibold">• {progressPercent}% Done</span>
                          </div>
                        )}
                      </div>
                      {isExpanded ? (
                        <ChevronUp size={16} className="text-gray-400 mt-0.5 shrink-0" />
                      ) : (
                        <ChevronDown size={16} className="text-gray-400 mt-0.5 shrink-0" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="mt-3 space-y-3 pt-3 border-t border-gray-100">
                        {item.description && (
                          <p className="text-[11px] text-gray-500 line-clamp-3 leading-relaxed">
                            {item.description}
                          </p>
                        )}
                        
                        {/* Dynamic Progress Bar */}
                        <div>
                          <div className="flex justify-between items-center text-[10px] mb-1">
                            <span className="text-gray-400 uppercase font-semibold">Development Progress</span>
                            <span className="font-bold text-indigo-600">{progressPercent}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${progressBarColor} rounded-full transition-all duration-500`}
                              style={{ width: `${progressPercent}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-gray-600 pt-1">
                          <span className="flex items-center gap-1 font-semibold text-gray-900">
                            <DollarSign className="h-3 w-3 text-indigo-600" />
                            {item.budget ?? item.estimatedCost ?? 0}
                          </span>
                          {item.deadline && (
                            <span className="flex items-center gap-1 font-medium bg-white px-2.5 py-0.5 rounded-lg border border-gray-150 text-gray-500">
                              <Calendar className="h-3 w-3 text-indigo-500" />
                              {format(new Date(item.deadline), 'MMM dd, yyyy')}
                            </span>
                          )}
                        </div>

                        {/* Edit Terms button for Tutors */}
                        {isTutor && (
                          <div className="pt-2 border-t border-gray-50/50 mt-1">
                            <button
                              onClick={() => {
                                window.dispatchEvent(new CustomEvent('open-edit-offer', { detail: item }));
                              }}
                              className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 border border-indigo-200 bg-white hover:bg-indigo-50/50 text-indigo-700 text-xs font-bold rounded-xl transition-all shadow-sm"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              Edit Offer Terms
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Shared Media Section */}
        <div className="p-4 flex-1">
          <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">
            Shared Media & Files
          </h5>

          <AccordionItem id="photos" title="Photos" icon={ImageIcon} count={photos.length}>
            {photos.length === 0 && <p className="text-xs text-gray-400 italic py-1">No photos shared yet.</p>}
            {photos.length > 0 && (
              <div className="grid grid-cols-3 gap-1.5 mt-2">
                {photos.slice(0, 6).map((photo: any) => (
                  <a
                    key={photo.url}
                    href={photo.url}
                    target="_blank"
                    rel="noreferrer"
                    className="aspect-square rounded-lg overflow-hidden bg-gray-50 border border-gray-100 block hover:opacity-90 transition-opacity"
                  >
                    <img
                      src={photo.url}
                      alt={photo.originalName || 'Photo'}
                      className="w-full h-full object-cover"
                    />
                  </a>
                ))}
              </div>
            )}
          </AccordionItem>

          <AccordionItem id="videos" title="Videos" icon={Video} count={videos.length}>
            {videos.length === 0 && <p className="text-xs text-gray-400 italic py-1">No videos shared yet.</p>}
            {videos.length > 0 && (
              <div className="space-y-1.5 mt-1 animate-in fade-in duration-200">
                {videos.slice(0, 3).map((video: any) => (
                  <a
                    key={video.url}
                    href={video.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 p-1.5 bg-gray-50 hover:bg-gray-100 rounded-lg text-xs text-gray-700 truncate"
                  >
                    <Video size={14} className="text-gray-400" />
                    <span className="truncate flex-1">{video.originalName}</span>
                    <ExternalLink size={10} className="text-gray-400" />
                  </a>
                ))}
              </div>
            )}
          </AccordionItem>

          <AccordionItem id="files" title="Files" icon={FileText} count={documents.length}>
            {documents.length === 0 && <p className="text-xs text-gray-400 italic py-1">No files shared yet.</p>}
            {documents.length > 0 && (
              <div className="space-y-1.5 mt-1 animate-in fade-in duration-200">
                {documents.slice(0, 3).map((doc: any) => (
                  <a
                    key={doc.url}
                    href={doc.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 p-1.5 bg-gray-50 hover:bg-gray-100 rounded-lg text-xs text-gray-700 truncate"
                  >
                    <FileText size={14} className="text-gray-400" />
                    <span className="truncate flex-1">{doc.originalName}</span>
                    <ExternalLink size={10} className="text-gray-400" />
                  </a>
                ))}
              </div>
            )}
          </AccordionItem>
        </div>
      </div>
    </div>
  );
};

export default ChatRightSidebar;
