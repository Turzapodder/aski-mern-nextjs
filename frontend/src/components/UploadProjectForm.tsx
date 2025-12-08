'use client'
import { useState, useEffect, useRef } from 'react'
import { X, Upload, FileImage, Play, Plus } from 'lucide-react'
import { useGenerateSessionIdQuery, useSaveStudentFormMutation } from '@/lib/services/student'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'

interface UploadProjectFormProps {
  onSubmit?: (formData: FormData) => void
  onCancel?: () => void
  onSaveDraft?: (formData: FormData) => void
  className?: string
  maxWidth?: string
  advanced?: boolean
}

interface FormData {
  title: string
  description: string
  deadline: string
  subject: string
  topics: string[]
  budget?: number
  file?: File
}

const SUBJECTS = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Computer Science',
  'English',
  'History',
  'Economics',
  'Business',
  'Engineering',
  'Other'
]

const UploadProjectForm = ({
  onSubmit,
  onCancel,
  onSaveDraft,
  className = "",
  maxWidth = "max-w-3xl",
  advanced = false,
}: UploadProjectFormProps) => {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    deadline: '',
    subject: '',
    topics: [],
    budget: undefined
  })

  const [newTopic, setNewTopic] = useState('')
  const [isDraft, setIsDraft] = useState(true)
  const [isAdvanced, setIsAdvanced] = useState(advanced)
  const [sessionId, setSessionId] = useState<string>('')
  const [isDragging, setIsDragging] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [fileError, setFileError] = useState<string>('')

  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Get session ID for anonymous users
  const { data: sessionData } = useGenerateSessionIdQuery()
  const [saveStudentForm] = useSaveStudentFormMutation()

  // Set session ID when received
  useEffect(() => {
    if (sessionData?.sessionId) {
      setSessionId(sessionData.sessionId)
    }
  }, [sessionData])

  // Clean up preview URL when component unmounts or file changes
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const validateFile = (file: File): string => {
    const maxSize = 10 * 1024 * 1024 // 10MB
    const allowedTypes = ['image/', 'video/', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']

    if (file.size > maxSize) {
      return 'File size must be less than 10MB'
    }

    // Allow images, videos, PDFs, and Docs
    if (!allowedTypes.some(type => file.type.startsWith(type) || file.type === type)) {
      // return 'Only image, video, PDF and document files are allowed'
    }

    return ''
  }

  const handleFileSelect = (file: File) => {
    const error = validateFile(file)

    if (error) {
      setFileError(error)
      return
    }

    setFileError('')

    // Clean up previous preview URL
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }

    // Create new preview URL
    const newPreviewUrl = URL.createObjectURL(file)
    setPreviewUrl(newPreviewUrl)

    setFormData(prev => ({ ...prev, file }))
    setIsDraft(false)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleRemoveFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl('')
    }

    setFormData(prev => ({ ...prev, file: undefined }))
    setFileError('')

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleUploadAreaClick = () => {
    fileInputRef.current?.click()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Check if user is logged in
    const isAuth = Cookies.get('is_auth')

    if (isAuth === 'true') {
      // User is logged in, proceed normally
      if (onSubmit) {
        onSubmit(formData)
      }
    } else {
      // User is not logged in, save form and redirect to registration
      handleAnonymousSubmit()
    }
  }

  const handleAnonymousSubmit = async () => {
    try {
      if (!sessionId) {
        console.error('No session ID available')
        return
      }

      // Create FormData for file upload
      const submitFormData = new FormData()

      // Prepare form data object for assignment
      const assignmentData = {
        title: formData.title,
        description: formData.description,
        subject: formData.subject || 'General', // Default if not selected
        topics: formData.topics,
        deadline: formData.deadline || new Date().toISOString(),
        estimatedCost: formData.budget || 0,
        priority: 'medium',
        status: 'draft'
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

      // Add file if exists
      if (formData.file) {
        submitFormData.append('attachments', formData.file)
      }

      // Save assignment data to backend
      const response = await fetch('http://localhost:8000/api/assignments', {
        method: 'POST',
        body: submitFormData
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Server error:', errorData)
        throw new Error(`Failed to save assignment: ${errorData.message || response.statusText}`)
      }

      const result = await response.json()
      console.log('Assignment saved successfully:', result)

      // Store assignment ID in localStorage for retrieval after registration
      localStorage.setItem('pendingAssignmentId', result.data._id)
      console.log('Assignment ID stored in localStorage:', result.data._id)

      // Redirect to registration
      router.push('/account/register')

    } catch (error) {
      console.error('Failed to save form data:', error)
      // Still redirect to registration even if save fails
      router.push('/account/register')
    }
  }


  const addTopic = (topic: string) => {
    if (topic && !formData.topics.includes(topic) && formData.topics.length < 12) {
      setFormData(prev => ({
        ...prev,
        topics: [...prev.topics, topic]
      }))
    }
  }

  const removeTopic = (topicToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      topics: prev.topics.filter(topic => topic !== topicToRemove)
    }))
  }

  const handleAddNewTopic = () => {
    if (newTopic.trim()) {
      addTopic(newTopic.trim())
      setNewTopic('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddNewTopic()
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const isImage = (file: File): boolean => {
    return file.type.startsWith('image/')
  }

  const isVideo = (file: File): boolean => {
    return file.type.startsWith('video/')
  }

  return (
    <div className={`bg-white rounded-2xl shadow-lg p-8 ${maxWidth} w-full ${className}`}>
      <form onSubmit={handleSubmit}>
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Post a <span className="text-secondary-500">New Project</span>
          </h2>
          <p className="text-gray-600 text-sm">Please provide the necessary details below</p>
        </div>

        {/* Project Title */}
        <div className="mb-6">
          <label className="block text-gray-900 font-medium mb-2">
            Project Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Calculus Homework Help"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent"
            required
          />
        </div>

        {/* Project Description */}
        <div className="mb-6">
          <label className="block text-gray-900 font-medium mb-2">
            Project Description <span className="text-red-500">*</span>
          </label>
          <textarea
            placeholder="Explain your project here..."
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent resize-none"
            required
          />
        </div>

        {/* Deadline */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="text-gray-900 font-medium">Assignment Deadline <span className="text-red-500">*</span></label>
            <div className="w-4 h-4 bg-gray-200 rounded-full flex items-center justify-center group relative cursor-help">
              <span className="text-gray-500 text-xs">i</span>
              <div className="absolute bottom-full mb-2 hidden group-hover:block w-48 bg-gray-800 text-white text-xs rounded p-2 z-10">
                Select when this assignment should be completed
              </div>
            </div>
          </div>
          <input
            type="datetime-local"
            value={formData.deadline}
            onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent"
            required
            min={new Date().toISOString().slice(0, 16)}
          />
        </div>

        {/* Advanced Sections - Conditionally Rendered */}
        {isAdvanced && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-300">
            {/* Subject */}
            <div className="mb-6">
              <label className="block text-gray-900 font-medium mb-2">
                Subject
              </label>
              <select
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent bg-white"
              >
                <option value="">Select a Subject</option>
                {SUBJECTS.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>

            {/* Topics */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <label className="text-gray-900 font-medium">Topics</label>
                <span className="text-gray-400 text-sm">{12 - formData.topics.length} topics remaining</span>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                {formData.topics.map((topic, index) => (
                  <span key={index} className="inline-flex items-center px-3 py-1 bg-gray-900 text-white rounded-full text-sm">
                    {topic}
                    <button
                      type="button"
                      onClick={() => removeTopic(topic)}
                      className="ml-2 text-gray-300 hover:text-white"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Add topics (e.g. algebra, calculus, essay ...)"
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent text-sm pr-10"
                />
                <button
                  type="button"
                  onClick={handleAddNewTopic}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-500"
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>

            {/* File Upload Area */}
            <div className="mb-6">
              <label className="block text-gray-900 font-medium mb-2">Upload Files</label>

              {/* File Upload Zone */}
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer relative ${isDragging
                  ? 'border-primary-400 bg-primary-50'
                  : fileError
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                  }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleUploadAreaClick}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*,application/pdf"
                  className="hidden"
                  onChange={handleFileInputChange}
                />

                {formData.file ? (
                  // File Preview
                  <div className="relative">
                    <div className="mb-4">
                      {isImage(formData.file) ? (
                        <div className="relative inline-block">
                          <img
                            src={previewUrl}
                            alt="Preview"
                            className="max-w-full max-h-48 rounded-lg shadow-md"
                          />
                          <div className="absolute top-2 right-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleRemoveFile()
                              }}
                              className="bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </div>
                      ) : isVideo(formData.file) ? (
                        <div className="relative inline-block">
                          <video
                            src={previewUrl}
                            controls
                            className="max-w-full max-h-48 rounded-lg shadow-md"
                          />
                          <div className="absolute top-2 right-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleRemoveFile()
                              }}
                              className="bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          <div className="bg-gray-100 rounded-lg p-4 flex items-center space-x-3">
                            <FileImage size={24} className="text-gray-500" />
                            <div className="text-left">
                              <p className="font-medium text-gray-900">{formData.file.name}</p>
                              <p className="text-sm text-gray-500">{formatFileSize(formData.file.size)}</p>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleRemoveFile()
                              }}
                              className="text-red-500 hover:text-red-700 transition-colors"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-1">{formData.file.name}</p>
                      <p className="text-xs text-gray-400">{formatFileSize(formData.file.size)}</p>
                      <p className="text-xs text-primary-600 mt-2">Click to replace or drag a new file</p>
                    </div>
                  </div>
                ) : (
                  // Upload Prompt
                  <>
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Upload size={20} className="text-gray-400" />
                    </div>
                    <p className="text-gray-600 font-medium mb-1">
                      {isDragging ? 'Drop your file here' : 'Upload an image, video or PDF'}
                    </p>
                    <p className="text-gray-400 text-sm mb-2">
                      Drag and drop or click to browse
                    </p>
                    <p className="text-gray-400 text-xs">
                      Max file size: 10MB
                    </p>
                  </>
                )}
              </div>

              {/* File Error */}
              {fileError && (
                <p className="text-red-500 text-sm mt-2 flex items-center">
                  <X size={16} className="mr-1" />
                  {fileError}
                </p>
              )}
            </div>

            {/* Budget (Optional) */}
            <div className="mb-6">
              <label className="block text-gray-900 font-medium mb-2">
                Budget (Optional)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  value={formData.budget || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, budget: parseFloat(e.target.value) }))}
                  className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-4">
            {/* Advanced Form Toggle */}
            <button
              type="button"
              onClick={() => {
                if (isAdvanced) {
                  // Clear advanced fields when hiding
                  setFormData(prev => ({
                    ...prev,
                    subject: '',
                    topics: [],
                    budget: undefined,
                    file: undefined
                  }))
                  setNewTopic('')
                  setFileError('')
                  if (previewUrl) {
                    URL.revokeObjectURL(previewUrl)
                    setPreviewUrl('')
                  }
                  if (fileInputRef.current) {
                    fileInputRef.current.value = ''
                  }
                }
                setIsAdvanced(!isAdvanced)
              }}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium hover:underline transition-colors flex items-center"
            >
              {isAdvanced ? 'Hide Options' : 'Show More Options'}
            </button>
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
            >
              Post Now
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default UploadProjectForm
export type { UploadProjectFormProps, FormData as UploadFormData }