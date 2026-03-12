import { type ChangeEvent, type DragEvent, type KeyboardEvent, type RefObject } from 'react';
import { SUBJECTS } from './constants';
import { FileUploadZone } from './FileUploadZone';
import { TopicsInput } from './TopicsInput';

interface AdvancedSectionProps {
  // Subject & Budget
  subject: string;
  budget?: number;
  currency: string;
  onSubjectChange: (subject: string) => void;
  onBudgetChange: (val: number) => void;
  // Topics
  topics: string[];
  newTopic: string;
  onNewTopicChange: (val: string) => void;
  onAddTopic: () => void;
  onRemoveTopic: (topic: string) => void;
  onTopicKeyPress: (e: KeyboardEvent) => void;
  // File upload
  files: File[];
  previewUrls: string[];
  isDragging: boolean;
  fileError: string;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onFileInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onDragOver: (e: DragEvent) => void;
  onDragLeave: (e: DragEvent) => void;
  onDrop: (e: DragEvent) => void;
  onRemoveFile: (index: number) => void;
  onUploadAreaClick: () => void;
}

export function AdvancedSection({
  subject,
  budget,
  currency,
  onSubjectChange,
  onBudgetChange,
  topics,
  newTopic,
  onNewTopicChange,
  onAddTopic,
  onRemoveTopic,
  onTopicKeyPress,
  files,
  previewUrls,
  isDragging,
  fileError,
  fileInputRef,
  onFileInputChange,
  onDragOver,
  onDragLeave,
  onDrop,
  onRemoveFile,
  onUploadAreaClick,
}: AdvancedSectionProps) {
  return (
    <div className="animate-in fade-in slide-in-from-top-4 duration-300">
      {/* Subject */}
      <div className="mb-5 sm:mb-6">
        <label className="block text-gray-900 font-medium mb-1.5 sm:mb-2 text-sm sm:text-base">
          Subject
        </label>
        <select
          value={subject}
          onChange={(e) => onSubjectChange(e.target.value)}
          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent bg-white text-sm sm:text-base"
        >
          <option value="">Select a Subject</option>
          {SUBJECTS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Topics */}
      <TopicsInput
        topics={topics}
        newTopic={newTopic}
        onNewTopicChange={onNewTopicChange}
        onAddTopic={onAddTopic}
        onRemoveTopic={onRemoveTopic}
        onKeyPress={onTopicKeyPress}
      />

      {/* File Upload */}
      <FileUploadZone
        files={files}
        previewUrls={previewUrls}
        isDragging={isDragging}
        fileError={fileError}
        fileInputRef={fileInputRef}
        onFileInputChange={onFileInputChange}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onRemoveFile={onRemoveFile}
        onClick={onUploadAreaClick}
      />

      {/* Budget */}
      <div className="mb-5 sm:mb-6">
        <label className="block text-gray-900 font-medium mb-1.5 sm:mb-2 text-sm sm:text-base">
          Budget (Optional)
        </label>
        <div className="relative">
          <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-500 text-[10px] sm:text-xs font-semibold">
            {currency}
          </span>
          <input
            type="number"
            placeholder="0.00"
            min="0"
            step="0.01"
            value={budget || ''}
            onChange={(e) => onBudgetChange(parseFloat(e.target.value))}
            className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent text-sm sm:text-base"
          />
        </div>
      </div>
    </div>
  );
}
