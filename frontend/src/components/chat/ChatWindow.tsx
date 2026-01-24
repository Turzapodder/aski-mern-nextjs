'use client';
import React, { useEffect, useRef, useState } from 'react';
import Image from "next/image";
import { ArrowLeft, BadgeDollarSign, Check, MoreVertical, Paperclip, Phone, Search, Send, X } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

import { useChatContext } from '@/contexts/ChatContext';
import { useGetUserQuery } from '@/lib/services/auth';
import {
  useAcceptOfferMutation,
  useCreateOfferMutation,
  useDeclineOfferMutation,
  useGetActiveOfferQuery
} from '@/lib/services/customOffers';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

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

  const [newMessage, setNewMessage] = useState('');
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [offerBudget, setOfferBudget] = useState('');
  const [offerDeadline, setOfferDeadline] = useState('');
  const [offerNote, setOfferNote] = useState('');
  const [offerError, setOfferError] = useState('');
  const [offerActionId, setOfferActionId] = useState<string | null>(null);

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (newMessage.trim() && newMessage.length <= MAX_MESSAGE_LENGTH) {
      await sendMessage(newMessage);
      setNewMessage('');
      if (inputRef.current) {
        inputRef.current.style.height = "auto";
      }
      stopTyping();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      sendFile(file);
      toast.success('File attached');
    }
    if (e.target) {
      e.target.value = '';
    }
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
  }, [selectedChat]);

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

  const openOfferModal = () => {
    setOfferBudget('');
    setOfferDeadline('');
    setOfferNote('');
    setOfferError('');
    setOfferModalOpen(true);
  };

  const handleOfferSubmit = async () => {
    if (!selectedChat) return;
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
              <span
                className={`ml-2 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                  isConnected
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-amber-100 text-amber-700'
                }`}
              >
                Realtime {isConnected ? 'On' : 'Off'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-gray-400">
          {isTutor && assignmentTitle && (
            <button
              onClick={openOfferModal}
              disabled={tutorBlocked || Boolean(activeOffer)}
              className="hidden sm:inline-flex items-center gap-2 rounded-xl border border-primary-200 bg-primary-50 px-3 py-2 text-xs font-semibold text-primary-700 hover:bg-primary-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <BadgeDollarSign className="h-4 w-4" />
              Send Custom Offer
            </button>
          )}
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors"><Search size={18} /></button>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors"><Phone size={18} /></button>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors"><MoreVertical size={18} /></button>
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
                <p className="font-semibold text-gray-900">${assignmentBudget ?? 0}</p>
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
                    <div className="space-y-2 text-gray-700">
                      <div className="flex justify-between">
                        <span>Budget</span>
                        <span className="font-semibold">{msg.meta?.proposedBudget ?? 0}</span>
                      </div>
                      {msg.meta?.proposedDeadline && (
                        <div className="flex justify-between">
                          <span>Deadline</span>
                          <span className="font-semibold">{format(new Date(msg.meta.proposedDeadline), 'MMM dd, yyyy')}</span>
                        </div>
                      )}
                      {msg.meta?.message && (
                        <p className="text-sm text-gray-600">{msg.meta.message}</p>
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
                  <div className={`p-4 rounded-2xl text-sm leading-relaxed break-words whitespace-pre-wrap ${isMe
                    ? 'bg-[#2563EB] text-white rounded-tr-none shadow-sm'
                    : 'bg-white text-gray-800 rounded-tl-none border border-gray-100 shadow-sm'
                    }`}>
                    {msg.content}
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {msg.attachments.map((file, idx) => (
                          <a
                            key={`${msg._id}-${idx}`}
                            href={file.url}
                            target="_blank"
                            rel="noreferrer"
                            className={`block rounded-lg border px-3 py-2 text-xs ${
                              isMe
                                ? 'border-white/10 bg-white/20 text-white/90'
                                : 'border-gray-200 bg-white text-gray-600'
                            }`}
                          >
                            {file.originalName}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-2 mt-1 px-1">
                  <span className="text-[11px] text-gray-400">
                    {format(new Date(msg.createdAt), 'hh:mm a')}
                  </span>
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
        <form onSubmit={handleSend} className="flex flex-col gap-2 bg-[#F3F4F9] p-3 rounded-2xl">
          <div className="flex items-end gap-3">
            <input
              type="file"
              ref={fileInputRef}
              accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx"
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
              disabled={!newMessage.trim() || newMessage.length > MAX_MESSAGE_LENGTH || tutorBlocked}
              className="p-2 text-[#2563EB] hover:bg-white rounded-xl transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={20} />
            </button>
          </div>
          <div className="flex items-center justify-between text-[11px] text-gray-400">
            <span>{newMessage.length}/{MAX_MESSAGE_LENGTH}</span>
            {isTutor && assignmentTitle && (
              <button
                type="button"
                onClick={openOfferModal}
                disabled={tutorBlocked || Boolean(activeOffer)}
                className="inline-flex items-center gap-1 rounded-lg border border-primary-200 bg-primary-50 px-2 py-1 text-[11px] font-semibold text-primary-700 hover:bg-primary-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <BadgeDollarSign className="h-3 w-3" />
                Send Custom Offer
              </button>
            )}
          </div>
        </form>
      </div>

      <Dialog open={offerModalOpen} onOpenChange={setOfferModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Custom Offer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="number"
              value={offerBudget}
              onChange={(e) => setOfferBudget(e.target.value)}
              placeholder="Budget"
            />
            <Input
              type="date"
              value={offerDeadline}
              onChange={(e) => setOfferDeadline(e.target.value)}
            />
            <Textarea
              value={offerNote}
              onChange={(e) => setOfferNote(e.target.value)}
              placeholder="Optional note"
              rows={3}
            />
            {offerError && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                {offerError}
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOfferModalOpen(false)} disabled={isSendingOffer}>
                Cancel
              </Button>
              <Button onClick={handleOfferSubmit} disabled={isSendingOffer}>
                Send Offer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChatWindow;
