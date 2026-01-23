'use client'
import React, { useState, useEffect } from 'react'
import { Search, X, Circle } from 'lucide-react'
import { useSearchTutorsQuery } from '@/lib/services/chat'
import { useChatContext } from '@/contexts/ChatContext'
import { Skeleton } from '@/components/ui/skeleton'

interface Tutor {
  _id: string
  name: string
  email: string
  subjects?: string[]
  isActive?: boolean
  avatar?: string
}

interface TutorSearchModalProps {
  isOpen: boolean
  onClose: () => void
}

const TutorSearchModal: React.FC<TutorSearchModalProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const { createDirectChat } = useChatContext()
  
  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300)
    
    return () => clearTimeout(timer)
  }, [searchTerm])
  
  const { data: tutorsData, isLoading, error } = useSearchTutorsQuery({
    search: debouncedSearchTerm,
    limit: 30
  })
  
  const tutors = tutorsData?.tutors || []
  
  const handleTutorSelect = async (tutor: Tutor) => {
    try {
      await createDirectChat(tutor._id)
      onClose()
    } catch (error) {
      console.error('Failed to create chat:', error)
    }
  }
  
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }
  
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md mx-4 max-h-[80vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Find Tutors</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>
        
        {/* Search Input */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text"
              placeholder="Search tutors by name or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              autoFocus
            />
          </div>
        </div>
        
        {/* Tutors List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-3 w-12" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-red-500">Failed to load tutors</div>
            </div>
          ) : tutors.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500">
                {searchTerm ? 'No tutors found' : 'No tutors available'}
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {tutors.map((tutor) => (
                <div 
                  key={tutor._id}
                  onClick={() => handleTutorSelect(tutor)}
                  className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    {/* Avatar */}
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary-200 to-primary-300 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {getInitials(tutor.name)}
                        </span>
                      </div>
                      {/* Online Status Indicator */}
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                        tutor.isActive ? 'bg-primary-300' : 'bg-gray-400'
                      }`}></div>
                    </div>
                    
                    {/* Tutor Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {tutor.name}
                      </h3>
                      <p className="text-xs text-gray-500 truncate">
                        {tutor.subjects && tutor.subjects.length > 0 
                          ? tutor.subjects.join(', ')
                          : 'No subjects listed'
                        }
                      </p>
                    </div>
                    
                    {/* Status */}
                    <div className="flex items-center space-x-1">
                      <Circle 
                        size={8} 
                        className={`fill-current ${
                          tutor.isActive ? 'text-primary-300' : 'text-gray-400'
                        }`} 
                      />
                      <span className={`text-xs ${
                        tutor.isActive ? 'text-primary-300' : 'text-gray-500'
                      }`}>
                        {tutor.isActive ? 'Active' : 'Offline'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Modal Footer */}
        <div className="p-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Click on a tutor to start a conversation
          </p>
        </div>
      </div>
    </div>
  )
}

export default TutorSearchModal
