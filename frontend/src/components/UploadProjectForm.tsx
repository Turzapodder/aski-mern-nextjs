'use client'
import { useState } from 'react'
import { ArrowRight } from 'lucide-react'

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
  publishTime: string
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
    publishTime: 'now',
    tags: ['Design', 'Blog']
  })
  
  const [newTag, setNewTag] = useState('')
  const [isDraft, setIsDraft] = useState(true)
  const [isAdvanced, setIsAdvanced] = useState(advanced)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (onSubmit) {
      onSubmit(formData)
    }
  }

  const handleSaveDraft = () => {
    if (onSaveDraft) {
      onSaveDraft(formData)
    }
    setIsDraft(true)
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
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-primary-300 transition-colors cursor-pointer">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ArrowRight size={20} className="text-gray-400 rotate-90" />
                </div>
                <p className="text-gray-600 font-medium mb-1">Upload an image or video</p>
                <p className="text-gray-400 text-sm">1600×1200 (10 mb max)</p>
                <input
                  type="file"
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      setFormData(prev => ({ ...prev, file }))
                    }
                  }}
                />
              </div>
            </div>

            {/* Publish Time */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-gray-900 font-medium">Choose Publish Time</label>
                <div className="w-4 h-4 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-gray-500 text-xs">i</span>
                </div>
              </div>
              <div className="flex space-x-2">
                {['now', '14:17', '18:30'].map((time) => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, publishTime: time }))}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      formData.publishTime === time
                        ? 'bg-primary-300 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {time === 'now' ? 'Now' : time}
                  </button>
                ))}
                <button
                  type="button"
                  className="px-2 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
                >
                  •••
                </button>
              </div>
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
              type="button"
              onClick={handleSaveDraft}
              className="px-6 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              Save Draft
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              Schedule
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default UploadProjectForm
export type { UploadProjectFormProps, FormData as UploadFormData }