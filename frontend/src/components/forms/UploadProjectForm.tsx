"use client"
// UploadProjectForm — thin orchestrator after split
// Sub-components: FileDropzone, TopicsInput, SubjectSelect all in assignments/upload/
import { useState, useEffect, useRef } from "react"
import { useGenerateSessionIdQuery } from "@/lib/services/student"
import { useCreateAssignmentMutation } from "@/lib/services/assignments"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"
import { Skeleton } from "@/components/ui/skeleton"
import useCurrency from "@/lib/hooks/useCurrency"
import { FileDropzone } from "./upload/FileDropzone"
import { TopicsInput } from "./upload/TopicsInput"
import { SubjectSelect } from "./upload/SubjectSelect"

interface UploadProjectFormProps {
  onSubmit?: (formData: FormData) => void
  onSuccess?: () => void
  onCreated?: (assignmentId: string) => void
  onCancel?: () => void
  onSaveDraft?: (formData: FormData) => void
  className?: string
  maxWidth?: string
  advanced?: boolean
  requestedTutorId?: string
  requestedTutorName?: string
}

interface FormData {
  title: string
  description: string
  deadline: string
  subject: string
  topics: string[]
  budget?: number
  files: File[]
}

const UploadProjectForm = ({
  onSubmit, onSuccess, onCreated, onCancel, className = "", maxWidth = "max-w-3xl",
  advanced = false, requestedTutorId, requestedTutorName,
}: UploadProjectFormProps) => {
  const { currency } = useCurrency()
  const [formData, setFormData] = useState<FormData>({ title: "", description: "", deadline: "", subject: "", topics: [], budget: undefined, files: [] })
  const [newTopic, setNewTopic] = useState("")
  const [isDraft, setIsDraft] = useState(true)
  const [isAdvanced, setIsAdvanced] = useState(advanced)
  const [sessionId, setSessionId] = useState("")
  const [isDragging, setIsDragging] = useState(false)
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [fileError, setFileError] = useState("")
  const [submitError, setSubmitError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const { data: sessionData } = useGenerateSessionIdQuery()
  const [createAssignment, { isLoading: isCreating }] = useCreateAssignmentMutation()

  useEffect(() => { if (sessionData?.sessionId) setSessionId(sessionData.sessionId) }, [sessionData])
  useEffect(() => () => { previewUrls.forEach((u) => URL.revokeObjectURL(u)) }, [previewUrls])

  const validateFile = (file: File): string => {
    if (file.size > 10 * 1024 * 1024) return "File size must be less than 10MB"
    return ""
  }

  const handleFilesSelect = (selected: File[]) => {
    const validFiles: File[] = []; let error = ""
    selected.forEach((f) => { const err = validateFile(f); if (err) error = err; else validFiles.push(f) })
    if (error && validFiles.length === 0) { setFileError(error); return }
    setFileError("")
    setPreviewUrls((prev) => [...prev, ...validFiles.map((f) => URL.createObjectURL(f))])
    setFormData((prev) => ({ ...prev, files: [...prev.files, ...validFiles] }))
    setIsDraft(false)
  }

  const handleRemoveFile = (index: number) => {
    URL.revokeObjectURL(previewUrls[index])
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index))
    setFormData((prev) => ({ ...prev, files: prev.files.filter((_, i) => i !== index) }))
    if (formData.files.length === 1) { setFileError(""); if (fileInputRef.current) fileInputRef.current.value = "" }
  }

  const buildSubmitFormData = (status: "pending" | "draft") => {
    const fd = new global.FormData()
    const data: any = { title: formData.title, description: formData.description, subject: formData.subject || "General", deadline: formData.deadline || new Date().toISOString(), estimatedCost: formData.budget || 0, priority: "medium", status, ...(requestedTutorId ? { requestedTutor: requestedTutorId } : {}) }
    Object.entries(data).forEach(([k, v]) => { if (k === "topics") formData.topics.forEach((t) => fd.append("topics", t)); else fd.append(k, String(v)) })
    formData.files.forEach((f) => fd.append("attachments", f))
    return fd
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitError("")
    if (Cookies.get("is_auth") === "true") {
      if (onSubmit) onSubmit(formData as any)
      else await handleInternalSubmit()
    } else { await handleAnonymousSubmit() }
  }

  const handleInternalSubmit = async () => {
    try {
      const fd = buildSubmitFormData("pending")
      const response = await createAssignment(fd).unwrap()
      setFormData({ title: "", description: "", deadline: "", subject: "", topics: [], budget: undefined, files: [] })
      setPreviewUrls([]); if (fileInputRef.current) fileInputRef.current.value = ""
      if (onCreated && response?.data?._id) onCreated(response.data._id)
      if (onSuccess) onSuccess(); else if (!onCreated) alert("Assignment posted successfully!")
    } catch (err: any) { setSubmitError(err?.data?.message || "Failed to post assignment. Please try again.") }
  }

  const handleAnonymousSubmit = async () => {
    try {
      const fd = buildSubmitFormData("draft")
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      const res = await fetch(`${baseUrl}/api/assignments`, { method: "POST", body: fd })
      if (!res.ok) throw new Error()
      const result = await res.json()
      localStorage.setItem("pendingAssignmentId", result.data._id)
    } catch { /* ignore */ } finally { router.push("/account/register") }
  }

  const addTopic = (topic: string) => { if (topic && !formData.topics.includes(topic) && formData.topics.length < 12) setFormData((prev) => ({ ...prev, topics: [...prev.topics, topic] })) }
  const removeTopic = (t: string) => setFormData((prev) => ({ ...prev, topics: prev.topics.filter((x) => x !== t) }))
  const handleAddNewTopic = () => { if (newTopic.trim()) { addTopic(newTopic.trim()); setNewTopic("") } }
  const handleKeyPress = (e: React.KeyboardEvent) => { if (e.key === "Enter") { e.preventDefault(); handleAddNewTopic() } }

  const handleClearAdvanced = () => {
    setFormData((prev) => ({ ...prev, subject: "", topics: [], budget: undefined, files: [] }))
    setNewTopic(""); setFileError("")
    previewUrls.forEach((u) => URL.revokeObjectURL(u)); setPreviewUrls([])
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  return (
    <div className={`bg-white rounded-2xl shadow-lg p-8 ${maxWidth} w-full ${className}`}>
      <form onSubmit={handleSubmit}>
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {requestedTutorName ? "Request a Proposal" : (<>Post a <span className="text-secondary-500">New Project</span></>)}
          </h2>
          <p className="text-gray-600 text-sm">
            {requestedTutorName ? "Share your assignment details to invite this tutor to send a proposal." : "Please provide the necessary details below"}
          </p>
        </div>

        {requestedTutorName && (
          <div className="mb-6 rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-600">
            Requesting proposal from <span className="font-semibold text-gray-900">{requestedTutorName}</span>. Once submitted, only this tutor will see the request.
          </div>
        )}

        {/* Title */}
        <div className="mb-6">
          <label className="block text-gray-900 font-medium mb-2">Project Title <span className="text-red-500">*</span></label>
          <input type="text" placeholder="e.g. Calculus Homework Help" value={formData.title} onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent" required />
        </div>

        {/* Description */}
        <div className="mb-6">
          <label className="block text-gray-900 font-medium mb-2">Project Description <span className="text-red-500">*</span></label>
          <textarea placeholder="Explain your project here..." rows={4} value={formData.description} onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent resize-none" required />
        </div>

        {/* Deadline */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="text-gray-900 font-medium">Assignment Deadline <span className="text-red-500">*</span></label>
            <div className="w-4 h-4 bg-gray-200 rounded-full flex items-center justify-center group relative cursor-help">
              <span className="text-gray-500 text-xs">i</span>
              <div className="absolute bottom-full mb-2 hidden group-hover:block w-48 bg-gray-800 text-white text-xs rounded p-2 z-10">Select when this assignment should be completed</div>
            </div>
          </div>
          <input type="datetime-local" value={formData.deadline} onChange={(e) => setFormData((prev) => ({ ...prev, deadline: e.target.value }))} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent" required min={new Date().toISOString().slice(0, 16)} />
        </div>

        {/* Advanced section */}
        {isAdvanced && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-300">
            <SubjectSelect value={formData.subject} onChange={(v) => setFormData((prev) => ({ ...prev, subject: v }))} />
            <TopicsInput topics={formData.topics} newTopic={newTopic} onNewTopicChange={setNewTopic} onAdd={handleAddNewTopic} onRemove={removeTopic} onKeyPress={handleKeyPress} />
            <FileDropzone files={formData.files} previewUrls={previewUrls} isDragging={isDragging} fileError={fileError} fileInputRef={fileInputRef} onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }} onDragLeave={(e) => { e.preventDefault(); setIsDragging(false) }} onDrop={(e) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files.length > 0) handleFilesSelect(Array.from(e.dataTransfer.files)) }} onClick={() => fileInputRef.current?.click()} onFileInputChange={(e) => { if (e.target.files?.length) handleFilesSelect(Array.from(e.target.files)) }} onRemove={handleRemoveFile} />
            {/* Budget */}
            <div className="mb-6">
              <label className="block text-gray-900 font-medium mb-2">Budget (Optional)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-xs font-semibold">{currency}</span>
                <input type="number" placeholder="0.00" min="0" step="0.01" value={formData.budget || ""} onChange={(e) => setFormData((prev) => ({ ...prev, budget: parseFloat(e.target.value) }))} className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent" />
              </div>
            </div>
          </div>
        )}

        {submitError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{submitError}</div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <button type="button" onClick={() => { if (isAdvanced) handleClearAdvanced(); setIsAdvanced(!isAdvanced) }} className="text-primary-600 hover:text-primary-700 text-sm font-medium hover:underline transition-colors flex items-center">
            {isAdvanced ? "Hide Options" : "Show More Options"}
          </button>
          <div className="flex space-x-3">
            <button type="button" onClick={onCancel} disabled={isCreating} className="px-6 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={isCreating} className="px-6 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center disabled:opacity-70 disabled:cursor-not-allowed">
              {isCreating ? (<><Skeleton className="h-4 w-4 mr-2 rounded-full" />Posting...</>) : "Post Now"}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default UploadProjectForm
export type { UploadProjectFormProps, FormData as UploadFormData }
