'use client'
import React from 'react'
import { X } from 'lucide-react'
import UploadProjectForm from './UploadProjectForm'

interface PostAssignmentModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit?: (data: any) => void
  initialData?: any
}

export default function PostAssignmentModal({ isOpen, onClose, onSubmit, initialData }: PostAssignmentModalProps) {

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors z-10"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        <div className="overflow-y-auto custom-scrollbar rounded-2xl">
          <UploadProjectForm
            onSuccess={() => {
              onClose()
              if (onSubmit) onSubmit({}) // Optional callback
            }}
            onCancel={onClose}
            className="w-full shadow-none border-none"
            maxWidth="max-w-full"
            advanced={true}
          />
        </div>
      </div>
    </div>
  )
}