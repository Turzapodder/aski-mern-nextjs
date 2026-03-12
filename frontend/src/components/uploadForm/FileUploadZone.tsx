import Image from 'next/image';
import { type ChangeEvent, type DragEvent, type RefObject } from 'react';
import { X, Upload, FileImage, Play } from 'lucide-react';
import { formatFileSize, isImage, isVideo } from './utils';

interface FilePreviewItemProps {
  file: File;
  previewUrl: string;
  index: number;
  onRemove: (index: number) => void;
}

function FilePreviewItem({ file, previewUrl, index, onRemove }: FilePreviewItemProps) {
  return (
    <div className="relative bg-gray-50 rounded-lg p-2 sm:p-3 flex items-center justify-between group">
      <div className="flex items-center space-x-2 sm:space-x-3 overflow-hidden">
        {isImage(file) ? (
          <div className="relative w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0">
            <Image
              src={previewUrl}
              alt="Preview"
              fill
              sizes="40px"
              className="object-cover rounded"
              unoptimized
            />
          </div>
        ) : isVideo(file) ? (
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
            <Play size={16} className="text-gray-500 sm:w-5 sm:h-5" />
          </div>
        ) : (
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
            <FileImage size={16} className="text-gray-500 sm:w-5 sm:h-5" />
          </div>
        )}
        <div className="min-w-0 text-left">
          <p className="text-[10px] sm:text-sm font-medium text-gray-900 truncate">{file.name}</p>
          <p className="text-[8px] sm:text-xs text-gray-500">{formatFileSize(file.size)}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove(index);
        }}
        className="p-1 text-red-500 hover:bg-red-50 rounded-full transition-colors"
      >
        <X size={14} className="sm:w-4 sm:h-4" />
      </button>
    </div>
  );
}

interface FileUploadZoneProps {
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
  onClick: () => void;
}

export function FileUploadZone({
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
  onClick,
}: FileUploadZoneProps) {
  return (
    <div className="mb-5 sm:mb-6">
      <label className="block text-gray-900 font-medium mb-2 text-sm sm:text-base">
        Upload Files
      </label>

      <div
        className={`border-2 border-dashed rounded-xl p-4 sm:p-8 text-center transition-all cursor-pointer relative ${
          isDragging
            ? 'border-primary-400 bg-primary-50'
            : fileError
              ? 'border-red-300 bg-red-50'
              : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
        }`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={onClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*,application/pdf"
          className="hidden"
          onChange={onFileInputChange}
        />

        {files.length > 0 ? (
          <div className="grid grid-cols-1 gap-2 sm:gap-4">
            {files.map((file, index) => (
              <FilePreviewItem
                key={index}
                file={file}
                previewUrl={previewUrls[index]}
                index={index}
                onRemove={onRemoveFile}
              />
            ))}
            <div className="mt-1 sm:mt-2 text-center">
              <p className="text-[10px] sm:text-xs text-primary-600">Click to add more files</p>
            </div>
          </div>
        ) : (
          <>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-4">
              <Upload size={18} className="text-gray-400 sm:w-5 sm:h-5" />
            </div>
            <p className="text-gray-600 font-medium mb-1 text-xs sm:text-base">
              {isDragging ? 'Drop your files here' : 'Upload images, videos or PDFs'}
            </p>
            <p className="text-gray-400 text-[10px] sm:text-sm mb-1 sm:mb-2">
              Drag and drop or click to browse
            </p>
            <p className="text-gray-400 text-[8px] sm:text-xs">Max file size: 10MB each</p>
          </>
        )}
      </div>

      {fileError && (
        <p className="text-red-500 text-[10px] sm:text-sm mt-2 flex items-center">
          <X size={14} className="mr-1 sm:w-4 sm:h-4" />
          {fileError}
        </p>
      )}
    </div>
  );
}
