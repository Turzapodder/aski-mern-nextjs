'use client'
import { useEffect, useState } from 'react'
import { 
  X, Upload, Calendar, DollarSign, BookOpen, Tag, 
  FileText, Clock, AlertCircle 
} from 'lucide-react'
import MultiSelect from './MultiSelect'

interface PostAssignmentModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit?: (data: AssignmentData) => void
}

interface AssignmentData {
  title: string
  description: string
  subject: string
  topics: string[]
  deadline: string
  attachments: File[]
}

const subjects = [
  'Mathematics',
  'Physics', 
  'Chemistry',
  'Biology',
  'Computer Science',
  'English Literature',
  'History',
  'Economics',
  'Psychology',
  'Philosophy'
]

const topicOptions = [
  'Algebra', 'Calculus', 'Geometry', 'Statistics', 'Trigonometry',
  'Mechanics', 'Thermodynamics', 'Electromagnetism', 'Quantum Physics',
  'Organic Chemistry', 'Inorganic Chemistry', 'Physical Chemistry',
  'Genetics', 'Ecology', 'Anatomy', 'Cell Biology',
  'Programming', 'Data Structures', 'Algorithms', 'Machine Learning',
  'Poetry', 'Drama', 'Novel Analysis', 'Grammar',
  'World War', 'Ancient History', 'Modern History',
  'Microeconomics', 'Macroeconomics', 'Market Analysis',
  'Cognitive Psychology', 'Social Psychology', 'Behavioral Psychology',
  'Ethics', 'Logic', 'Metaphysics'
]

export default function PostAssignmentModal({ isOpen, onClose, onSubmit }: PostAssignmentModalProps) {
  const [formData, setFormData] = useState<AssignmentData>({
    title: '',
    description: '',
    subject: '',
    topics: [],
    deadline: '',
    attachments: []
  })
  
  const [dragActive, setDragActive] = useState(false)
  const [estimatedCost, setEstimatedCost] = useState(0)

  // Calculate estimated cost based on form data
  const calculateCost = () => {
    let baseCost = 25 // Base cost
    
    // Add cost based on description length
    const wordCount = formData.description.split(' ').filter(word => word.length > 0).length
    const descriptionCost = Math.ceil(wordCount / 100) * 10
    
    // Add cost based on number of topics
    const topicsCost = formData.topics.length * 5
    
    // Add cost based on deadline urgency
    let urgencyCost = 0
    if (formData.deadline) {
      const deadlineDate = new Date(formData.deadline)
      const now = new Date()
      const daysUntilDeadline = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysUntilDeadline <= 1) urgencyCost = 50
      else if (daysUntilDeadline <= 3) urgencyCost = 30
      else if (daysUntilDeadline <= 7) urgencyCost = 15
    }
    
    // Add cost for attachments
    const attachmentCost = formData.attachments.length * 8
    
    const total = baseCost + descriptionCost + topicsCost + urgencyCost + attachmentCost
    setEstimatedCost(total)
  }

  // Update cost when form data changes
  useEffect(() => {
    calculateCost()
  }, [formData])

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const files = Array.from(e.dataTransfer.files)
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files]
    }))
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...files]
      }))
    }
  }

  const removeAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit?.(formData)
    onClose()
  }

  const isFormValid = formData.title && formData.description && formData.subject && formData.deadline

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-primary-200 to-primary-300 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Post Assignment</h2>
              <p className="text-sm text-gray-500">Get expert help with your assignment</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4 inline mr-2" />
                Assignment Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter assignment title..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4 inline mr-2" />
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your assignment requirements in detail..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
                required
              />
            </div>

            {/* Subject and Deadline Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <BookOpen className="w-4 h-4 inline mr-2" />
                  Subject *
                </label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  required
                >
                  <option value="">Select subject</option>
                  {subjects.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>

              {/* Deadline */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Deadline *
                </label>
                <input
                  type="datetime-local"
                  value={formData.deadline}
                  onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            {/* Topics */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Tag className="w-4 h-4 inline mr-2" />
                Topics
              </label>
              <MultiSelect 
                options={topicOptions}
                placeholder="Select relevant topics..."
                onChange={(topics) => setFormData(prev => ({ ...prev, topics }))}
              />
            </div>

            {/* Attachments */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Upload className="w-4 h-4 inline mr-2" />
                Attachments
              </label>
              <div 
                className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                  dragActive 
                    ? 'border-primary-300 bg-primary-100' 
                    : 'border-gray-300 hover:border-primary-200 hover:bg-gray-50'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 mb-2">Drag and drop files here, or</p>
                <label className="inline-block px-4 py-2 bg-primary-300 text-white rounded-lg hover:bg-primary-600 cursor-pointer transition-colors">
                  Browse Files
                  <input 
                    type="file" 
                    multiple 
                    onChange={handleFileInput}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                  />
                </label>
                <p className="text-xs text-gray-500 mt-2">PDF, DOC, DOCX, TXT, JPG, PNG (Max 10MB each)</p>
              </div>
              
              {/* Attachment List */}
              {formData.attachments.length > 0 && (
                <div className="mt-3 space-y-2">
                  {formData.attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Upload className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700 truncate">{file.name}</span>
                        <span className="text-xs text-gray-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAttachment(index)}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                      >
                        <X className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Cost Estimation */}
          <div className="border-t border-gray-200 p-6">
            <div className="bg-gradient-to-r from-primary-100 to-primary-200 rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5 text-primary-600" />
                  <span className="font-medium text-primary-800">Estimated Cost</span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary-600">${estimatedCost}</div>
                  <div className="text-xs text-primary-600">Final price may vary</div>
                </div>
              </div>
              <div className="mt-3 flex items-center space-x-2 text-sm text-primary-700">
                <Clock className="w-4 h-4" />
                <span>Typical completion time: 2-5 days</span>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!isFormValid}
                className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all ${
                  isFormValid
                    ? 'bg-gradient-to-r from-primary-200 to-primary-300 text-white hover:from-primary-300 hover:to-primary-600 shadow-lg'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Post Assignment
              </button>
            </div>
            
            {!isFormValid && (
              <div className="flex items-center space-x-2 mt-3 text-sm text-amber-600">
                <AlertCircle className="w-4 h-4" />
                <span>Please fill in all required fields</span>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}