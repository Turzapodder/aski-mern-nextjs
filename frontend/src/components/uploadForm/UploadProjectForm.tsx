'use client';
import { useState } from 'react';
import useCurrency from '@/lib/hooks/useCurrency';
import { FormHeader } from './FormHeader';
import { TutorRequestBanner } from './TutorRequestBanner';
import { AdvancedSection } from './AdvancedSection';
import { FormActions } from './FormActions';
import { useFileUpload } from './hooks/useFileUpload';
import { useTopics } from './hooks/useTopics';
import { useFormSubmit } from './hooks/useFormSubmit';
import type { UploadProjectFormProps, AssignmentFormData } from '../../types/uploadForm';

const UploadProjectForm = ({
  onSubmit,
  onSuccess,
  onCreated,
  onCancel,
  className = '',
  maxWidth = 'max-w-3xl',
  advanced = false,
  requestedTutorId,
  requestedTutorName,
}: UploadProjectFormProps) => {
  const { currency } = useCurrency();
  const [isAdvanced, setIsAdvanced] = useState(advanced);
  const [fields, setFields] = useState({
    title: '',
    description: '',
    deadline: '',
    subject: '',
    budget: undefined as number | undefined,
  });

  const fileUpload = useFileUpload();
  const topicsHook = useTopics();

  const resetAll = () => {
    setFields({ title: '', description: '', deadline: '', subject: '', budget: undefined });
    fileUpload.reset();
    topicsHook.reset();
  };

  const { submitError, isCreating, handleSubmit } = useFormSubmit({
    requestedTutorId,
    onSubmit,
    onSuccess,
    onCreated,
    onReset: resetAll,
  });

  const getFormData = (): AssignmentFormData => ({
    ...fields,
    topics: topicsHook.topics,
    files: fileUpload.files,
  });

  const handleToggleAdvanced = () => {
    if (isAdvanced) {
      setFields((prev) => ({ ...prev, subject: '', budget: undefined }));
      topicsHook.reset();
      fileUpload.reset();
    }
    setIsAdvanced((prev) => !prev);
  };

  return (
    <div
      className={`bg-white rounded-xl sm:rounded-2xl shadow-lg p-5 sm:p-8 ${maxWidth} w-full ${className}`}
    >
      <form onSubmit={(e) => handleSubmit(e, getFormData())}>
        <FormHeader requestedTutorName={requestedTutorName} />
        {requestedTutorName && <TutorRequestBanner tutorName={requestedTutorName} />}

        {/* Project Title */}
        <div className="mb-1.5 flex items-center justify-between sm:mb-2">
          <label className="block text-gray-900 font-medium text-sm sm:text-base">
            Project Title <span className="text-red-500">*</span>
          </label>
          <span className="text-xs text-gray-400 sm:text-sm">{fields.title.length}/250</span>
        </div>
        <input
          type="text"
          placeholder="e.g. Calculus Homework Help"
          value={fields.title}
          onChange={(e) => setFields((prev) => ({ ...prev, title: e.target.value }))}
          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent text-sm sm:text-base"
          maxLength={250}
          required
        />

        {/* Project Description */}
        <div className="mb-5 sm:mb-6">
          <label className="block text-gray-900 font-medium mb-1.5 sm:mb-2 text-sm sm:text-base">
            Project Description <span className="text-red-500">*</span>
          </label>
          <textarea
            placeholder="Explain your project here..."
            rows={4}
            value={fields.description}
            onChange={(e) => setFields((prev) => ({ ...prev, description: e.target.value }))}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent resize-none text-sm sm:text-base"
            required
          />
        </div>

        {/* Deadline */}
        <div className="mb-5 sm:mb-6">
          <div className="flex items-center justify-between mb-1.5 sm:mb-2">
            <label className="text-gray-900 font-medium text-sm sm:text-base">
              Assignment Deadline <span className="text-red-500">*</span>
            </label>
            <div className="w-4 h-4 bg-gray-200 rounded-full flex items-center justify-center group relative cursor-help">
              <span className="text-gray-500 text-[10px] sm:text-xs">i</span>
              <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block w-48 bg-gray-800 text-white text-[10px] sm:text-xs rounded p-2 z-10">
                Select when this assignment should be completed
              </div>
            </div>
          </div>
          <input
            type="datetime-local"
            value={fields.deadline}
            onChange={(e) => setFields((prev) => ({ ...prev, deadline: e.target.value }))}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent text-sm sm:text-base"
            required
            min={new Date().toISOString().slice(0, 16)}
          />
        </div>

        {/* Advanced Sections */}
        {isAdvanced && (
          <AdvancedSection
            subject={fields.subject}
            budget={fields.budget}
            currency={currency}
            onSubjectChange={(val) => setFields((prev) => ({ ...prev, subject: val }))}
            onBudgetChange={(val) => setFields((prev) => ({ ...prev, budget: val }))}
            topics={topicsHook.topics}
            newTopic={topicsHook.newTopic}
            onNewTopicChange={topicsHook.setNewTopic}
            onAddTopic={topicsHook.handleAddNewTopic}
            onRemoveTopic={topicsHook.removeTopic}
            onTopicKeyPress={topicsHook.handleKeyPress}
            files={fileUpload.files}
            previewUrls={fileUpload.previewUrls}
            isDragging={fileUpload.isDragging}
            fileError={fileUpload.fileError}
            fileInputRef={fileUpload.fileInputRef}
            onFileInputChange={fileUpload.handleFileInputChange}
            onDragOver={fileUpload.handleDragOver}
            onDragLeave={fileUpload.handleDragLeave}
            onDrop={fileUpload.handleDrop}
            onRemoveFile={fileUpload.handleRemoveFile}
            onUploadAreaClick={fileUpload.openFilePicker}
          />
        )}

        {/* Submit Error */}
        {submitError && (
          <div className="mb-4 p-2 sm:p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs sm:text-sm">
            {submitError}
          </div>
        )}

        <FormActions
          isAdvanced={isAdvanced}
          isCreating={isCreating}
          onToggleAdvanced={handleToggleAdvanced}
          onCancel={onCancel}
        />
      </form>
    </div>
  );
};

export default UploadProjectForm;
export type { UploadProjectFormProps, AssignmentFormData as UploadFormData };
