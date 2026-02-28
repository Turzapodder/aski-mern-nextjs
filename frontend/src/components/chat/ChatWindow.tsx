'use client';
import React, { useEffect, useRef, useState } from 'react';
import Image from "next/image";
import { ArrowLeft, BadgeDollarSign, Check, ChevronDown, MoreVertical, MoreHorizontal, Paperclip, Phone, Search, Send, X, Pencil, Trash2, Play, Download, Maximize2, Calendar, DollarSign, Clipboard, Info } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

import { useChatContext } from '@/contexts/ChatContext';
import { useGetUserQuery } from '@/lib/services/auth';
import { useDeleteMessageMutation, useEditMessageMutation, useLeaveChatMutation } from '@/lib/services/chat';
import {
  useAcceptOfferMutation,
  useCreateOfferMutation,
  useDeclineOfferMutation,
  useGetActiveOfferQuery
} from '@/lib/services/customOffers';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { DEFAULT_CURRENCY, formatCurrency } from '@/lib/currency';

const MAX_MESSAGE_LENGTH = 1000;

const ChatWindow = () => {
  const {
    selectedChat,
    messages,
    sendMessage,
    sendFile,
    currentUserId,
    onlineUsers,
    typingUsers,
    startTyping,
    stopTyping,
    refreshChats,
    refreshMessages,
    clearSelectedChat,
    isConnected,
    messagesLoading,
    messagesError
  } = useChatContext();
  const { data: userData } = useGetUserQuery();
  const currentUser = userData?.user;
  const isTutor = currentUser?.roles?.includes('tutor');
  const isStudent = currentUser?.roles?.includes('student') || currentUser?.roles?.includes('user');
  const currency = currentUser?.wallet?.currency || DEFAULT_CURRENCY;
  const formatAmount = (value?: number) => formatCurrency(value, currency);

  const [newMessage, setNewMessage] = useState('');
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [offerModalMode, setOfferModalMode] = useState<'create' | 'edit'>('create');
  const [offerTitle, setOfferTitle] = useState('');
  const [offerDescription, setOfferDescription] = useState('');
  const [offerBudget, setOfferBudget] = useState('');
  const [offerDeadline, setOfferDeadline] = useState('');
  const [offerNote, setOfferNote] = useState('');
  const [offerError, setOfferError] = useState('');
  const [offerActionId, setOfferActionId] = useState<string | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [messageToDelete, setMessageToDelete] = useState<any | null>(null);
  const [chatDeleteOpen, setChatDeleteOpen] = useState(false);
  const [stagedFiles, setStagedFiles] = useState<{ file: File; preview: string; type: string }[]>([]);
  const [mediaViewer, setMediaViewer] = useState<{ url: string; type: string; name: string } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { data: activeOfferResponse, refetch: refetchOffer } = useGetActiveOfferQuery(
    selectedChat?._id || '',
    { skip: !selectedChat }
  );

  const activeOffer = activeOfferResponse?.data || null;
  const [createOffer, { isLoading: isSendingOffer }] = useCreateOfferMutation();
  const [acceptOffer] = useAcceptOfferMutation();
  const [declineOffer] = useDeclineOfferMutation();
  const [editMessage] = useEditMessageMutation();
  const [deleteMessage] = useDeleteMessageMutation();
  const [leaveChat, { isLoading: leavingChat }] = useLeaveChatMutation();

  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.REACT_APP_API_URL ||
    'http://localhost:8000';

  const resolveFileUrl = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('blob:')) return url;
    return `${apiBaseUrl}${url}`;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const content = newMessage.trim();

    if (!content && stagedFiles.length === 0) return;

    if (content.length > MAX_MESSAGE_LENGTH) {
      toast.error('Message too long');
      return;
    }

    const filesToSend = stagedFiles.map(s => s.file);
    const previewsToClear = stagedFiles.map(s => s.preview);

    // Clear instantly for better UX
    setStagedFiles([]);
    setNewMessage('');
    if (inputRef.current) inputRef.current.style.height = "auto";
    stopTyping();

    try {
      if (filesToSend.length > 0) {
        await sendFile(filesToSend, content);
      } else if (content) {
        await sendMessage(content);
      }

      // Cleanup staged previews after sending
      previewsToClear.forEach(p => URL.revokeObjectURL(p));
    } catch (error) {
      console.error('Failed to send message:', error);
      // Optional: restoration logic if needed, but per request we show error in message area.
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (stagedFiles.length + files.length > 5) {
      toast.error('You can only attach up to 5 files at a time');
      return;
    }

    const newStaged = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      type: file.type
    }));

    setStagedFiles(prev => [...prev, ...newStaged]);
    if (e.target) {
      e.target.value = '';
    }
  };

  const removeStagedFile = (index: number) => {
    setStagedFiles(prev => {
      const next = [...prev];
      URL.revokeObjectURL(next[index].preview);
      next.splice(index, 1);
      return next;
    });
  };

  const handleTyping = (value: string) => {
    setNewMessage(value);
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 160)}px`;
    }
    if (!selectedChat) return;
    startTyping();
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 1200);
  };

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }
    // Clear staged files when switching chats
    stagedFiles.forEach(s => URL.revokeObjectURL(s.preview));
    setStagedFiles([]);
  }, [selectedChat]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      stagedFiles.forEach(s => URL.revokeObjectURL(s.preview));
    };
  }, [stagedFiles]);

  if (!selectedChat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-400">
          <p>Select a chat to start messaging</p>
        </div>
      </div>
    );
  }

  const assignment = selectedChat.assignment;
  const assignmentTitle = assignment?.title || selectedChat.assignmentTitle;
  const assignmentBudget = assignment?.budget ?? assignment?.estimatedCost;
  const assignmentDeadline = assignment?.deadline;
  const assignmentStudent = assignment?.student as any;
  const resolvedStudentId =
    typeof assignmentStudent === 'string' ? assignmentStudent : assignmentStudent?._id;
  const studentId =
    resolvedStudentId || selectedChat.participants.find((p: any) => !p.roles?.includes('tutor'))?._id;
  const studentHasMessaged = studentId
    ? messages.some((msg) => {
      const senderId =
        typeof msg.sender === "string" ? msg.sender : msg.sender?._id;
      return senderId === studentId;
    })
    : true;
  const tutorBlocked = Boolean(isTutor && selectedChat.type === 'direct' && !studentHasMessaged);
  const typingList = typingUsers[selectedChat._id] || [];

  const getChatName = () => {
    if (selectedChat.name) return selectedChat.name;
    const otherParticipant = selectedChat.participants.find((p: any) => p._id !== currentUserId);
    return otherParticipant?.name || 'Unknown User';
  };

  const isUserOnline = () => {
    if (selectedChat.type === 'group') return false;
    const otherParticipant = selectedChat.participants.find((p: any) => p._id !== currentUserId);
    return otherParticipant && onlineUsers.some(u => u._id === otherParticipant._id);
  };

  const openOfferModal = (mode: 'create' | 'edit' = 'create') => {
    setOfferModalMode(mode);
    setOfferTitle(assignmentTitle || '');
    setOfferDescription(assignment?.description || '');
    setOfferBudget(assignmentBudget?.toString() || '');
    setOfferDeadline(assignmentDeadline ? new Date(assignmentDeadline).toISOString().split('T')[0] : '');
    setOfferNote('');
    setOfferError('');
    setOfferModalOpen(true);
  };

  const handleOfferSubmit = async () => {
    if (!selectedChat) return;

    // Title is required only when creating a new assignment
    if (offerModalMode === 'create' && !offerTitle.trim()) {
      setOfferError('Assignment title is required.');
      return;
    }

    const budgetValue = Number(offerBudget);
    if (!Number.isFinite(budgetValue) || budgetValue <= 0) {
      setOfferError('Budget must be a positive number.');
      return;
    }
    if (!offerDeadline) {
      setOfferError('Deadline is required.');
      return;
    }
    const deadlineDate = new Date(offerDeadline);
    if (Number.isNaN(deadlineDate.getTime()) || deadlineDate.getTime() <= Date.now()) {
      setOfferError('Deadline must be in the future.');
      return;
    }

    try {
      await createOffer({
        conversationId: selectedChat._id,
        assignmentId: assignment?._id,
        title: offerTitle.trim(),
        description: offerDescription.trim(),
        proposedBudget: budgetValue,
        proposedDeadline: deadlineDate.toISOString(),
        message: offerNote,
      }).unwrap();
      setOfferModalOpen(false);
      refetchOffer();
      refreshMessages();
    } catch (error: any) {
      setOfferError(error?.data?.message || 'Failed to send offer.');
    }
  };

  const handleEditMessage = (msg: any) => {
    setEditingMessageId(msg._id);
    setEditingContent(msg.content || '');
  };

  const cancelEditMessage = () => {
    setEditingMessageId(null);
    setEditingContent('');
  };

  const saveEditedMessage = async () => {
    if (!editingMessageId) return;
    const content = editingContent.trim();
    if (!content) {
      toast.error('Message cannot be empty');
      return;
    }
    try {
      await editMessage({ messageId: editingMessageId, content }).unwrap();
      toast.success('Message updated');
      cancelEditMessage();
      refreshMessages();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Unable to edit message');
    }
  };

  const confirmDeleteMessage = (msg: any) => {
    setMessageToDelete(msg);
  };

  const handleDeleteMessage = async () => {
    if (!messageToDelete?._id) return;
    try {
      await deleteMessage({ messageId: messageToDelete._id }).unwrap();
      toast.success('Message deleted');
      setMessageToDelete(null);
      refreshMessages();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Unable to delete message');
    }
  };

  const handleDeleteChat = async () => {
    if (!selectedChat?._id) return;
    try {
      await leaveChat(selectedChat._id).unwrap();
      toast.success('Chat removed');
      clearSelectedChat();
      refreshChats();
      setChatDeleteOpen(false);
    } catch (error: any) {
      toast.error(error?.data?.message || 'Unable to delete chat');
    }
  };

  const handleOfferDecision = async (offerId: string, action: 'accept' | 'decline') => {
    try {
      setOfferActionId(offerId);
      if (action === 'accept') {
        await acceptOffer(offerId).unwrap();
      } else {
        await declineOffer(offerId).unwrap();
      }
      await refetchOffer();
      await refreshMessages();
    } catch (error) {
      console.error('Custom offer action failed:', error);
    } finally {
      setOfferActionId(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f7f7fb] min-w-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 bg-white/95 border-b border-gray-100 backdrop-blur">
        <div className="flex items-center gap-3">
          <button
            onClick={clearSelectedChat}
            className="sm:hidden inline-flex items-center justify-center rounded-full border border-gray-200 p-2 text-gray-500 hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">{getChatName()}</h2>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className="text-xs text-gray-500">{assignmentTitle || 'Direct chat'}</span>
              <span className="h-1 w-1 rounded-full bg-gray-300"></span>
              {isUserOnline() && <div className="w-2 h-2 rounded-full bg-green-500"></div>}
              <span className="text-xs text-gray-600 font-medium">{isUserOnline() ? 'Online' : 'Offline'}</span>
              {!isConnected && (
                <span
                  className={`ml-2 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase bg-amber-100 text-amber-700`}
                >
                  Network Offline
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-gray-400">
          {isTutor && (
            <button
              onClick={() => openOfferModal(assignment ? 'edit' : 'create')}
              disabled={tutorBlocked || Boolean(activeOffer)}
              className="hidden sm:inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              <Pencil className="h-4 w-4" />
              {assignment ? 'Edit Offer' : 'Send Custom Offer'}
            </button>
          )}
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors"><Search size={18} /></button>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors"><Phone size={18} /></button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <MoreVertical size={18} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => setChatDeleteOpen(true)} className="text-rose-600">
                Delete chat
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {assignmentTitle && (
        <div className="px-4 sm:px-6 py-3 bg-white border-b border-gray-100">
          <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-600 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs text-gray-500">Assignment</p>
              <p className="font-semibold text-gray-900">{assignmentTitle}</p>
            </div>
            <div className="flex items-center gap-6">
              <div>
                <p className="text-xs text-gray-500">Budget</p>
                <p className="font-semibold text-gray-900">{formatAmount(assignmentBudget ?? 0)}</p>
              </div>
              {assignmentDeadline && (
                <div>
                  <p className="text-xs text-gray-500">Deadline</p>
                  <p className="font-semibold text-gray-900">{format(new Date(assignmentDeadline), 'MMM dd, yyyy')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-6">
        {messagesLoading && (
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="flex gap-3">
                <div className="h-10 w-10 rounded-full bg-gray-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-24 rounded bg-gray-100" />
                  <div className="h-4 w-full rounded bg-gray-100" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!messagesLoading && Boolean(messagesError) && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            Unable to load messages. Please try again.
          </div>
        )}

        {!messagesLoading && !Boolean(messagesError) && messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center text-sm text-gray-500">
            <p className="font-semibold text-gray-700">No messages yet</p>
            <p className="mt-1">Start the conversation and your messages will appear here.</p>
          </div>
        )}

        {!messagesLoading && !Boolean(messagesError) && messages.map((msg, index) => {
          const sender =
            typeof msg.sender === "object" && msg.sender
              ? msg.sender
              : { _id: msg.sender as string, name: "Unknown", avatar: undefined };
          const senderId = sender?._id;
          const isMe = senderId === currentUserId;
          const prevSender = messages[index - 1]?.sender;
          const prevSenderId =
            typeof prevSender === "object" && prevSender
              ? prevSender?._id
              : (prevSender as string | undefined);
          const showAvatar = !isMe && (index === 0 || prevSenderId !== senderId);
          const isRead = isMe && msg.readBy?.some((entry) => entry.user !== currentUserId);
          const offerId = msg.meta?.offerId;
          const canEdit = isMe && msg.type === 'text' && !msg.isDeleted;
          const canDelete = isMe && !msg.isDeleted;
          const isEditing = editingMessageId === msg._id;

          return (
            <div key={msg._id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
              {!isMe && (
                <div className="w-10 h-10 flex-shrink-0">
                  {showAvatar ? (
                    sender.avatar ? (
                      <Image
                        src={sender.avatar}
                        alt={sender.name}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium text-sm">
                        {(sender.name || "U").charAt(0)}
                      </div>
                    )
                  ) : <div className="w-10" />}
                </div>
              )}

              <div className={`flex flex-col max-w-[85%] sm:max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}>
                {!isMe && showAvatar && (
                  <span className="text-sm font-medium text-gray-500 mb-1 ml-1">{sender.name || "Unknown"}</span>
                )}

                {msg.type === 'offer' ? (
                  <div className={`rounded-2xl border ${isMe ? 'border-primary-200 bg-primary-50' : 'border-gray-200 bg-white'} p-4 text-sm w-full`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-semibold text-gray-900">Custom Offer</div>
                      <span className="text-xs uppercase tracking-wide text-gray-500">{msg.meta?.status || 'pending'}</span>
                    </div>
                    <div className="space-y-3 text-gray-700">
                      {(msg.meta?.title || assignmentTitle) && (
                        <div className="pb-2 border-b border-gray-100/50">
                          <span className="text-xs text-gray-400 block mb-1 uppercase tracking-tight font-medium">Assignment</span>
                          <span className="font-bold text-gray-900 line-clamp-2">{msg.meta?.title || assignmentTitle}</span>
                        </div>
                      )}
                      {msg.meta?.description && (
                        <p className="text-sm text-gray-600 line-clamp-4 italic leading-snug">{msg.meta.description}</p>
                      )}
                      <div className="pt-1 flex flex-col gap-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-500 uppercase font-medium">Budget</span>
                          <span className="font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">{formatAmount(msg.meta?.proposedBudget ?? 0)}</span>
                        </div>
                        {msg.meta?.proposedDeadline && (
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-500 uppercase font-medium">Deadline</span>
                            <span className="font-semibold text-gray-900">{format(new Date(msg.meta.proposedDeadline), 'MMM dd, yyyy')}</span>
                          </div>
                        )}
                      </div>
                      {msg.meta?.message && (
                        <div className="mt-3 p-3 bg-gray-50/80 rounded-xl border border-gray-100 relative group">
                          <p className="text-xs italic text-gray-600 break-words leading-relaxed">
                            <span className="text-indigo-600 font-bold mr-1">"</span>
                            {msg.meta.message}
                            <span className="text-indigo-600 font-bold ml-1">"</span>
                          </p>
                        </div>
                      )}
                    </div>
                    {isStudent && msg.meta?.status === 'pending' && offerId && (
                      <div className="mt-4 flex gap-2">
                        <Button
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700"
                          disabled={offerActionId === offerId}
                          onClick={() => handleOfferDecision(offerId, 'accept')}
                        >
                          <Check className="h-4 w-4 mr-1" /> Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-rose-200 text-rose-600 hover:text-rose-700"
                          disabled={offerActionId === offerId}
                          onClick={() => handleOfferDecision(offerId, 'decline')}
                        >
                          <X className="h-4 w-4 mr-1" /> Decline
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="relative group w-full">
                    <div
                      className={`p-2 pl-4 rounded-2xl text-sm leading-relaxed break-words whitespace-pre-wrap transition-opacity ${isMe
                        ? 'bg-primary-600 text-white rounded-tr-none shadow-sm'
                        : 'bg-white text-gray-800 rounded-tl-none border border-gray-100 shadow-sm'
                        } ${msg.status === 'sending' ? 'opacity-60 cursor-not-allowed' : ''} ${msg.status === 'error' ? 'border-rose-300' : ''}`}
                    >
                      {msg.status === 'error' && (
                        <div className="absolute inset-0 z-10 bg-rose-50/40 rounded-2xl flex items-center justify-center backdrop-blur-[1px]">
                          <div className="bg-rose-600 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                            <X size={10} strokeWidth={3} /> Failed
                          </div>
                        </div>
                      )}
                      {msg.isDeleted ? (
                        <span className={isMe ? 'text-white/70 italic' : 'text-gray-400 italic'}>
                          This message was deleted
                        </span>
                      ) : isEditing ? (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-xs text-gray-400">
                            <span>Editing message</span>
                            <span>{editingContent.length}/{MAX_MESSAGE_LENGTH}</span>
                          </div>
                          <Textarea
                            value={editingContent}
                            onChange={(event) => setEditingContent(event.target.value)}
                            rows={3}
                            className="text-gray-900 bg-white"
                          />
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={cancelEditMessage}
                              className="border-gray-300 text-gray-700 hover:bg-gray-50"
                            >
                              Cancel
                            </Button>
                            <Button size="sm" onClick={saveEditedMessage}>
                              Save changes
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          {msg.content}
                          {msg.attachments && msg.attachments.length > 0 && (
                            <div className={`flex flex-wrap gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                              {msg.attachments.map((file, idx) => {
                                const isImage = file.mimetype.startsWith('image/');
                                const isVideo = file.mimetype.startsWith('video/');
                                const fileUrl = resolveFileUrl(file.url);

                                if (isImage) {
                                  return (
                                    <div
                                      key={`${msg._id}-${idx}`}
                                      className="relative w-40 h-40 rounded-lg overflow-hidden cursor-pointer border border-black/5"
                                      onClick={() => setMediaViewer({ url: fileUrl, type: file.mimetype, name: file.originalName })}
                                    >
                                      <Image src={fileUrl} alt={file.originalName} fill className="object-cover transition-transform hover:scale-105" />
                                    </div>
                                  );
                                }

                                if (isVideo) {
                                  return (
                                    <div
                                      key={`${msg._id}-${idx}`}
                                      className="relative w-40 h-40 rounded-lg overflow-hidden cursor-pointer bg-black/90 flex flex-col items-center justify-center border border-black/5"
                                      onClick={() => setMediaViewer({ url: fileUrl, type: file.mimetype, name: file.originalName })}
                                    >
                                      <Play size={40} className="text-white opacity-50" />
                                      <span className="text-[10px] text-white/50 mt-2 truncate w-32 text-center px-2">{file.originalName}</span>
                                      <div className="absolute top-2 right-2 p-1 bg-black/30 rounded-full">
                                        <Maximize2 size={12} className="text-white" />
                                      </div>
                                    </div>
                                  );
                                }

                                return (
                                  <a
                                    key={`${msg._id}-${idx}`}
                                    href={fileUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs transition-colors ${isMe
                                      ? 'border-white/10 bg-white/10 text-white/90 hover:bg-white/20'
                                      : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                                      }`}
                                  >
                                    <Paperclip size={14} />
                                    <span className="truncate max-w-[120px]">{file.originalName}</span>
                                    <Download size={14} className="ml-2 opacity-50" />
                                  </a>
                                );
                              })}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    {(canEdit || canDelete) && !isEditing && !msg.isDeleted && (
                      <div
                        className={`absolute top-1/2 -translate-y-1/2 -left-8 opacity-0 group-hover:opacity-100 transition-opacity`}
                      >
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              type="button"
                              className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 transition-colors"
                              aria-label="Message actions"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="w-44">
                            {canEdit && (
                              <DropdownMenuItem onClick={() => handleEditMessage(msg)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit message
                              </DropdownMenuItem>
                            )}
                            {canDelete && (
                              <DropdownMenuItem className="text-rose-600" onClick={() => confirmDeleteMessage(msg)}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete message
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-2 mt-1 px-1">
                  <span className="text-[11px] text-gray-400">
                    {format(new Date(msg.createdAt), 'hh:mm a')}
                  </span>
                  {!msg.isDeleted && msg.editedAt && (
                    <span className="text-[10px] text-gray-400">Edited</span>
                  )}
                  {isMe && (
                    <span className="text-[10px] text-gray-400">{isRead ? 'Read' : 'Sent'}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {typingList.length > 0 && (
          <div className="text-xs text-gray-500">
            {typingList[0]?.name || 'Someone'} is typing...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-100">
        {tutorBlocked && (
          <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
            Waiting for the student to start the conversation.
          </div>
        )}
        {activeOffer && (
          <div className="mb-3 rounded-lg border border-primary-200 bg-primary-50 px-3 py-2 text-xs text-primary-700">
            You already have a pending custom offer in this conversation.
          </div>
        )}

        {/* Staged Files Preview */}
        {stagedFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {stagedFiles.map((staged, index) => (
              <div key={index} className="relative group w-16 h-16 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
                {staged.type.startsWith('image/') ? (
                  <Image src={staged.preview} alt="preview" fill className="object-cover" />
                ) : staged.type.startsWith('video/') ? (
                  <div className="flex flex-col items-center">
                    <Play size={20} className="text-gray-400" />
                    <span className="text-[10px] text-gray-500">Video</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Paperclip size={20} className="text-gray-400" />
                    <span className="text-[10px] text-gray-500 truncate w-12 text-center">{staged.file.name}</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => removeStagedFile(index)}
                  className="absolute top-0 right-0 p-1 bg-black/50 text-white rounded-bl-lg"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleSend} className="flex flex-col gap-2 bg-[#F3F4F9] p-3 rounded-2xl">
          <div className="flex items-end gap-3">
            <input
              type="file"
              ref={fileInputRef}
              accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.mp4,.webm,.ogg"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              disabled={tutorBlocked}
            >
              <Paperclip size={20} />
            </button>

            <textarea
              ref={inputRef}
              value={newMessage}
              onChange={(e) => handleTyping(e.target.value)}
              onKeyDown={handleInputKeyDown}
              placeholder="Type a message..."
              maxLength={MAX_MESSAGE_LENGTH}
              disabled={tutorBlocked}
              rows={1}
              className="flex-1 bg-transparent border-none focus:ring-0 text-gray-700 placeholder-gray-400 text-sm resize-none max-h-40 leading-6"
            />

            <button
              type="submit"
              disabled={(!newMessage.trim() && stagedFiles.length === 0) || newMessage.length > MAX_MESSAGE_LENGTH || tutorBlocked}
              className="p-2 text-[#2563EB] hover:bg-white rounded-xl transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={20} />
            </button>
          </div>
        </form>
      </div>

      <Dialog open={offerModalOpen} onOpenChange={setOfferModalOpen}>
        <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-indigo-600 p-6 text-white">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <Pencil className="h-5 w-5" />
                {offerModalMode === 'edit' ? 'Edit Assignment Offer' : 'Send Custom Offer'}
              </DialogTitle>
              <p className="text-indigo-100 text-sm mt-1">
                {offerModalMode === 'edit'
                  ? 'Adjust terms for the existing assignment'
                  : 'Define assignment terms for the student'}
              </p>
            </DialogHeader>
          </div>

          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto non-scrollbar">
            {/* Details Section - Collapsed for Edit mode */}
            <div className="space-y-4">
              {offerModalMode === 'edit' ? (
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Assignment</span>
                  </div>
                  <h4 className="text-sm font-bold text-gray-900 line-clamp-1">{offerTitle}</h4>
                  {offerDescription && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{offerDescription}</p>}
                </div>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500 flex items-center gap-1.5 ml-1">
                      <Clipboard size={14} />
                      Assignment Title
                    </label>
                    <Input
                      value={offerTitle}
                      onChange={(e) => setOfferTitle(e.target.value)}
                      placeholder="e.g. Mathematics Home Task"
                      className="bg-gray-50 border-gray-100 focus:bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 rounded-xl transition-all h-11 text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500 flex items-center gap-1.5 ml-1">
                      <Info size={14} />
                      Assignment Details
                    </label>
                    <Textarea
                      value={offerDescription}
                      onChange={(e) => setOfferDescription(e.target.value)}
                      placeholder="Describe the work to be done..."
                      rows={3}
                      className="bg-gray-50 border-gray-100 focus:bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 rounded-xl transition-all text-sm resize-none"
                    />
                  </div>
                </>
              )}

              {assignmentDeadline && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-100 text-amber-700">
                  <Info size={14} />
                  <span className="text-[11px] font-medium">Original deadline: {format(new Date(assignmentDeadline), 'MMM dd, yyyy')}</span>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 flex items-center gap-1.5 ml-1">
                  <DollarSign size={14} />
                  Proposed Budget
                </label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors">
                    <span className="text-sm font-medium">$</span>
                  </div>
                  <Input
                    type="number"
                    value={offerBudget}
                    onChange={(e) => setOfferBudget(e.target.value)}
                    placeholder="0.00"
                    className="pl-7 bg-gray-50 border-gray-100 focus:bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 rounded-xl transition-all h-11 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 flex items-center gap-1.5 ml-1">
                  <Calendar size={14} />
                  Proposed Deadline
                </label>
                <Input
                  type="date"
                  value={offerDeadline}
                  onChange={(e) => setOfferDeadline(e.target.value)}
                  className="bg-gray-50 border-gray-100 focus:bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 rounded-xl transition-all h-11 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 flex items-center gap-1.5 ml-1">
                  <Pencil size={14} />
                  Message (Optional)
                </label>
                <Textarea
                  value={offerNote}
                  onChange={(e) => setOfferNote(e.target.value)}
                  placeholder="Anything else the student should know?"
                  rows={3}
                  className="bg-gray-50 border-gray-100 focus:bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 rounded-xl transition-all text-sm resize-none"
                />
              </div>
            </div>

            {offerError && (
              <div className="flex items-center gap-2 p-3 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 animate-in fade-in slide-in-from-top-1 duration-200">
                <X className="h-4 w-4 shrink-0" />
                <span className="text-xs font-medium">{offerError}</span>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setOfferModalOpen(false)}
                disabled={isSendingOffer}
                className="flex-1 rounded-xl h-11 border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all font-medium"
              >
                Cancel
              </Button>
              <Button
                onClick={handleOfferSubmit}
                disabled={isSendingOffer}
                className="flex-[1.5] rounded-xl h-11 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-100 transition-all font-bold"
              >
                {isSendingOffer ? 'Sending...' : offerModalMode === 'edit' ? 'Send Edit Offer' : 'Send Custom Offer'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(messageToDelete)} onOpenChange={(open) => !open && setMessageToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete message?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the message for both participants.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setMessageToDelete(null)}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteMessage}
              className="bg-rose-600 text-white hover:bg-rose-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={chatDeleteOpen} onOpenChange={setChatDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete chat?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the conversation from your inbox.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={leavingChat}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteChat}
              disabled={leavingChat}
              className="bg-rose-600 text-white hover:bg-rose-700"
            >
              {leavingChat ? 'Deleting...' : 'Delete chat'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Media Viewer Dialog */}
      <Dialog open={Boolean(mediaViewer)} onOpenChange={(open) => !open && setMediaViewer(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black/95 border-none">
          <DialogHeader className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/50 to-transparent">
            <div className="flex items-center justify-between text-white">
              <DialogTitle className="text-sm font-medium truncate pr-8">{mediaViewer?.name}</DialogTitle>
              <div className="flex items-center gap-2">
                <a
                  href={mediaViewer?.url}
                  download={mediaViewer?.name}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                  title="Download"
                >
                  <Download size={20} />
                </a>
              </div>
            </div>
          </DialogHeader>

          <div className="relative w-full h-[80vh] flex items-center justify-center">
            {mediaViewer && (
              mediaViewer.type.startsWith('image/') ? (
                <div className="relative w-full h-full p-4">
                  <Image
                    src={mediaViewer.url}
                    alt={mediaViewer.name}
                    fill
                    className="object-contain"
                  />
                </div>
              ) : mediaViewer.type.startsWith('video/') ? (
                <video
                  src={mediaViewer.url}
                  controls
                  autoPlay
                  className="max-w-full max-h-full"
                />
              ) : null
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChatWindow;
