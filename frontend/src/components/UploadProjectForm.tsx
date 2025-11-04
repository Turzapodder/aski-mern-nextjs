'use client'
import { useState, useEffect, useRef } from 'react'
import { X, Upload, FileImage, Play } from 'lucide-react'
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
  projectName: string
  description: string
  deadline: string
  tags: string[]
  file?: File
}

const UploadProjectForm = ({ 
  onSubmit, 
  onCancel, 
  onSaveDraft, 
  className = "", 
  maxWidth = "max-w-3xl",
  advanced = true,
}: UploadProjectFormProps) => {
  const [formData, setFormData] = useState<FormData>({
    projectName: '',
    description: '',
    deadline: '',
    tags: ['Design', 'Blog']
  })
  
  const [newTag, setNewTag] = useState('')
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
    const allowedTypes = ['image/', 'video/']
    
    if (file.size > maxSize) {
      return 'File size must be less than 10MB'
    }
    
    if (!allowedTypes.some(type => file.type.startsWith(type))) {
      return 'Only image and video files are allowed'
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
        title: formData.projectName,
        description: formData.description,
        subject: formData.projectName, // Using projectName as subject for now
        topics: formData.tags,
        deadline: formData.deadline || new Date().toISOString(),
        estimatedCost: 0,
        priority: 'medium',
        status: 'draft'
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


  const addTag = (tag: string) => {
    if (tag && !formData.tags.includes(tag) && formData.tags.length < 12) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }))
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleAddNewTag = () => {
    if (newTag.trim()) {
      addTag(newTag.trim())
      setNewTag('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddNewTag()
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
            Upload a <span className="text-secondary-500">New Assignment</span>
          </h2>
          <p className="text-gray-600 text-sm">Please provide the necessary details below</p>
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

        {/* Project Name */}
        <div className="mb-6">
          <label className="block text-gray-900 font-medium mb-2">
            Subject Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="eg: Mathematics"
            value={formData.projectName}
            onChange={(e) => setFormData(prev => ({ ...prev, projectName: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent"
            required
          />
        </div>

        {/* Advanced Sections - Conditionally Rendered */}
        {isAdvanced && (
          <>
            {/* Tags */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <label className="text-gray-900 font-medium">Topics</label>
                <span className="text-gray-400 text-sm">{12 - formData.tags.length} tags remaining</span>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.tags.map((tag, index) => (
                  <span key={index} className="inline-flex items-center px-3 py-1 bg-gray-900 text-white rounded-full text-sm">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-2 text-gray-300 hover:text-white"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              
              <input
                type="text"
                placeholder="Add tags (e.g. design, product, article ...)"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent text-sm"
              />
              
              <div className="flex flex-wrap gap-2 mt-3">
                {['Photography', 'AI Art', 'Travel Moments'].map((suggestedTag) => (
                  <button
                    key={suggestedTag}
                    type="button"
                    onClick={() => addTag(suggestedTag)}
                    className="px-3 py-1 border border-gray-200 text-gray-600 rounded-full text-sm hover:bg-gray-50"
                    disabled={formData.tags.includes(suggestedTag) || formData.tags.length >= 12}
                  >
                    + {suggestedTag}
                  </button>
                ))}
              </div>
            </div>

            {/* File Upload Area */}
            <div className="mb-6">
              <label className="block text-gray-900 font-medium mb-2">Upload Files</label>
              
              {/* File Upload Zone */}
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer relative ${
                  isDragging
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
                  accept="image/*,video/*"
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
                      {isDragging ? 'Drop your file here' : 'Upload an image or video'}
                    </p>
                    <p className="text-gray-400 text-sm mb-2">
                      Drag and drop or click to browse
                    </p>
                    <p className="text-gray-400 text-xs">
                      Max file size: 10MB | Supported: Images, Videos
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

            {/* Deadline */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-gray-900 font-medium">Assignment Deadline <span className="text-red-500">*</span></label>
                <div className="w-4 h-4 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-gray-500 text-xs">i</span>
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
              <p className="text-gray-400 text-xs mt-1">Select when this assignment should be completed</p>
            </div>
          </>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                isDraft ? 'bg-primary-300' : 'bg-green-500'
              }`}></div>
              <span className="text-gray-600 text-sm">
                {isDraft ? 'Saved as a draft' : 'Ready to publish'}
              </span>
            </div>
            
            {/* Advanced Form Toggle */}
            <button
              type="button"
              onClick={() => setIsAdvanced(!isAdvanced)}
              className="text-primary-600 hover:text-primary-700 text-sm underline transition-colors"
            >
              {isAdvanced ? 'Hide advanced form' : 'Show advanced form'}
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
              className="px-6 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
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