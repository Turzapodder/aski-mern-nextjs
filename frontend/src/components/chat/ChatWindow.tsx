"use client"
// ChatWindow — thin orchestrator (~150 lines)
// Sub-components: ChatHeader, ChatMessageList, ChatInput, ChatDialogs
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { useChatContext } from "@/contexts/ChatContext"
import { useGetUserQuery } from "@/lib/services/auth"
import { useDeleteMessageMutation, useEditMessageMutation, useLeaveChatMutation } from "@/lib/services/chat"
import {
  useAcceptOfferMutation,
  useCreateOfferMutation,
  useDeclineOfferMutation,
  useGetActiveOfferQuery,
} from "@/lib/services/customOffers"
import { DEFAULT_CURRENCY } from "@/lib/currency"
import { ChatHeader } from "./ChatHeader"
import { ChatMessageList } from "./ChatMessageList"
import { ChatInput } from "./ChatInput"
import { ChatOfferModal, DeleteMessageDialog, DeleteChatDialog } from "./ChatDialogs"

const MAX_MESSAGE_LENGTH = 1000

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
    messagesError,
  } = useChatContext()

  const { data: userData } = useGetUserQuery()
  const currentUser = userData?.user
  const isTutor = Boolean(currentUser?.roles?.includes("tutor"))
  const isStudent =
    currentUser?.roles?.includes("student") || currentUser?.roles?.includes("user")
  const currency = currentUser?.wallet?.currency || DEFAULT_CURRENCY

  // State
  const [newMessage, setNewMessage] = useState("")
  const [offerModalOpen, setOfferModalOpen] = useState(false)
  const [offerBudget, setOfferBudget] = useState("")
  const [offerDeadline, setOfferDeadline] = useState("")
  const [offerNote, setOfferNote] = useState("")
  const [offerError, setOfferError] = useState("")
  const [offerActionId, setOfferActionId] = useState<string | null>(null)
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [editingContent, setEditingContent] = useState("")
  const [messageToDelete, setMessageToDelete] = useState<any | null>(null)
  const [chatDeleteOpen, setChatDeleteOpen] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_URL || process.env.REACT_APP_API_URL || "http://localhost:8000"
  const resolveFileUrl = (url?: string) => {
    if (!url) return ""
    return url.startsWith("http") ? url : `${apiBaseUrl}${url}`
  }

  // RTK Query
  const { data: activeOfferResponse, refetch: refetchOffer } = useGetActiveOfferQuery(
    selectedChat?._id || "",
    { skip: !selectedChat }
  )
  const activeOffer = activeOfferResponse?.data || null
  const [createOffer, { isLoading: isSendingOffer }] = useCreateOfferMutation()
  const [acceptOffer] = useAcceptOfferMutation()
  const [declineOffer] = useDeclineOfferMutation()
  const [editMessage] = useEditMessageMutation()
  const [deleteMessage] = useDeleteMessageMutation()
  const [leaveChat, { isLoading: leavingChat }] = useLeaveChatMutation()

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }) }, [messages])
  useEffect(() => { if (inputRef.current) inputRef.current.style.height = "auto" }, [selectedChat])

  // Handlers
  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (newMessage.trim() && newMessage.length <= MAX_MESSAGE_LENGTH) {
      await sendMessage(newMessage)
      setNewMessage("")
      if (inputRef.current) inputRef.current.style.height = "auto"
      stopTyping()
    }
  }

  const handleTyping = (value: string) => {
    setNewMessage(value)
    if (inputRef.current) {
      inputRef.current.style.height = "auto"
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 160)}px`
    }
    if (!selectedChat) return
    startTyping()
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => stopTyping(), 1200)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) { sendFile(file); toast.success("File attached") }
    if (e.target) e.target.value = ""
  }

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const openOfferModal = () => {
    setOfferBudget(""); setOfferDeadline(""); setOfferNote(""); setOfferError("")
    setOfferModalOpen(true)
  }

  const handleOfferSubmit = async () => {
    if (!selectedChat) return
    const budgetValue = Number(offerBudget)
    if (!Number.isFinite(budgetValue) || budgetValue <= 0) return setOfferError("Budget must be a positive number.")
    if (!offerDeadline) return setOfferError("Deadline is required.")
    const deadlineDate = new Date(offerDeadline)
    if (Number.isNaN(deadlineDate.getTime()) || deadlineDate.getTime() <= Date.now()) return setOfferError("Deadline must be in the future.")
    try {
      await createOffer({ conversationId: selectedChat._id, assignmentId: (selectedChat.assignment as any)?._id, proposedBudget: budgetValue, proposedDeadline: deadlineDate.toISOString(), message: offerNote }).unwrap()
      setOfferModalOpen(false); refetchOffer(); refreshMessages()
    } catch (err: any) { setOfferError(err?.data?.message || "Failed to send offer.") }
  }

  const handleOfferDecision = async (offerId: string, action: "accept" | "decline") => {
    try {
      setOfferActionId(offerId)
      if (action === "accept") await acceptOffer(offerId).unwrap()
      else await declineOffer(offerId).unwrap()
      await refetchOffer(); await refreshMessages()
    } catch { console.error("Offer action failed") } finally { setOfferActionId(null) }
  }

  const saveEditedMessage = async () => {
    if (!editingMessageId) return
    const content = editingContent.trim()
    if (!content) return toast.error("Message cannot be empty")
    try {
      await editMessage({ messageId: editingMessageId, content }).unwrap()
      toast.success("Message updated"); setEditingMessageId(null); setEditingContent(""); refreshMessages()
    } catch (err: any) { toast.error(err?.data?.message || "Unable to edit message") }
  }

  const handleDeleteMessage = async () => {
    if (!messageToDelete?._id) return
    try {
      await deleteMessage({ messageId: messageToDelete._id }).unwrap()
      toast.success("Message deleted"); setMessageToDelete(null); refreshMessages()
    } catch (err: any) { toast.error(err?.data?.message || "Unable to delete message") }
  }

  const handleDeleteChat = async () => {
    if (!selectedChat?._id) return
    try {
      await leaveChat(selectedChat._id).unwrap()
      toast.success("Chat removed"); clearSelectedChat(); refreshChats(); setChatDeleteOpen(false)
    } catch (err: any) { toast.error(err?.data?.message || "Unable to delete chat") }
  }

  if (!selectedChat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <p className="text-gray-400">Select a chat to start messaging</p>
      </div>
    )
  }

  const assignment = selectedChat.assignment as any
  const assignmentTitle = assignment?.title || selectedChat.assignmentTitle
  const assignmentBudget = assignment?.budget ?? assignment?.estimatedCost
  const assignmentDeadline = assignment?.deadline
  const studentId = assignment?.student?._id || assignment?.student ||
    selectedChat.participants.find((p: any) => !p.roles?.includes("tutor"))?._id
  const studentHasMessaged = studentId
    ? messages.some((m) => (typeof m.sender === "string" ? m.sender : m.sender?._id) === studentId)
    : true
  const tutorBlocked = Boolean(isTutor && selectedChat.type === "direct" && !studentHasMessaged)
  const typingList = typingUsers[selectedChat._id] || []

  const getChatName = () => {
    if (selectedChat.name) return selectedChat.name
    return selectedChat.participants.find((p: any) => p._id !== currentUserId)?.name || "Unknown User"
  }
  const isUserOnline = () => {
    if (selectedChat.type === "group") return false
    const other = selectedChat.participants.find((p: any) => p._id !== currentUserId)
    return other && onlineUsers.some((u: any) => u._id === other._id)
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f7f7fb] min-w-0">
      <ChatHeader
        chatName={getChatName()}
        assignmentTitle={assignmentTitle}
        assignmentBudget={assignmentBudget}
        assignmentDeadline={assignmentDeadline}
        isOnline={Boolean(isUserOnline())}
        isConnected={isConnected}
        isTutor={isTutor}
        currency={currency}
        onBack={clearSelectedChat}
        onOpenOfferModal={openOfferModal}
        onDeleteChat={() => setChatDeleteOpen(true)}
      />

      <ChatMessageList
        messages={messages}
        currentUserId={currentUserId}
        isStudent={Boolean(isStudent)}
        messagesLoading={messagesLoading}
        messagesError={messagesError}
        typingList={typingList}
        editingMessageId={editingMessageId}
        editingContent={editingContent}
        offerActionId={offerActionId}
        resolveFileUrl={resolveFileUrl}
        messagesEndRef={messagesEndRef}
        onEdit={(msg) => { setEditingMessageId(msg._id); setEditingContent(msg.content || "") }}
        onCancelEdit={() => { setEditingMessageId(null); setEditingContent("") }}
        onSaveEdit={saveEditedMessage}
        onEditChange={setEditingContent}
        onConfirmDelete={setMessageToDelete}
        onOfferDecision={handleOfferDecision}
      />

      <ChatInput
        value={newMessage}
        tutorBlocked={tutorBlocked}
        activeOffer={activeOffer}
        isTutor={isTutor}
        assignmentTitle={assignmentTitle}
        inputRef={inputRef}
        fileInputRef={fileInputRef}
        onChange={handleTyping}
        onKeyDown={handleInputKeyDown}
        onSend={handleSend}
        onFileSelect={handleFileSelect}
        onOpenOfferModal={openOfferModal}
      />

      <ChatOfferModal
        open={offerModalOpen}
        onOpenChange={setOfferModalOpen}
        budget={offerBudget}
        deadline={offerDeadline}
        note={offerNote}
        error={offerError}
        isLoading={isSendingOffer}
        onBudgetChange={setOfferBudget}
        onDeadlineChange={setOfferDeadline}
        onNoteChange={setOfferNote}
        onSubmit={handleOfferSubmit}
      />

      <DeleteMessageDialog
        open={Boolean(messageToDelete)}
        onCancel={() => setMessageToDelete(null)}
        onConfirm={handleDeleteMessage}
      />

      <DeleteChatDialog
        open={chatDeleteOpen}
        isLoading={leavingChat}
        onOpenChange={setChatDeleteOpen}
        onConfirm={handleDeleteChat}
      />
    </div>
  )
}

export default ChatWindow
