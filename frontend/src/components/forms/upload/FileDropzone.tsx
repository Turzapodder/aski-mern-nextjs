"use client"
import Image from "next/image"
import { FileImage, Play, Upload, X } from "lucide-react"

interface FileDropzoneProps {
    files: File[]
    previewUrls: string[]
    isDragging: boolean
    fileError: string
    fileInputRef: React.RefObject<HTMLInputElement>
    onDragOver: (e: React.DragEvent) => void
    onDragLeave: (e: React.DragEvent) => void
    onDrop: (e: React.DragEvent) => void
    onClick: () => void
    onFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    onRemove: (index: number) => void
}

function formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

export function FileDropzone({
    files,
    previewUrls,
    isDragging,
    fileError,
    fileInputRef,
    onDragOver,
    onDragLeave,
    onDrop,
    onClick,
    onFileInputChange,
    onRemove,
}: FileDropzoneProps) {
    return (
        <div className="mb-6">
            <label className="block text-gray-900 font-medium mb-2">Upload Files</label>
            <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer relative ${isDragging
                        ? "border-primary-400 bg-primary-50"
                        : fileError
                            ? "border-red-300 bg-red-50"
                            : "border-gray-200 hover:border-primary-300 hover:bg-gray-50"
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
                    <div className="grid grid-cols-1 gap-4">
                        {files.map((file, index) => (
                            <div
                                key={index}
                                className="relative bg-gray-50 rounded-lg p-3 flex items-center justify-between group"
                            >
                                <div className="flex items-center space-x-3 overflow-hidden">
                                    {file.type.startsWith("image/") ? (
                                        <div className="relative w-10 h-10 flex-shrink-0">
                                            <Image
                                                src={previewUrls[index]}
                                                alt="Preview"
                                                fill
                                                sizes="40px"
                                                className="object-cover rounded"
                                                unoptimized
                                            />
                                        </div>
                                    ) : file.type.startsWith("video/") ? (
                                        <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                                            <Play size={20} className="text-gray-500" />
                                        </div>
                                    ) : (
                                        <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                                            <FileImage size={20} className="text-gray-500" />
                                        </div>
                                    )}
                                    <div className="min-w-0 text-left">
                                        <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                                        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); onRemove(index) }}
                                    className="p-1 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ))}
                        <div className="mt-2 text-center">
                            <p className="text-xs text-primary-600">Click to add more files</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Upload size={20} className="text-gray-400" />
                        </div>
                        <p className="text-gray-600 font-medium mb-1">
                            {isDragging ? "Drop your files here" : "Upload images, videos or PDFs"}
                        </p>
                        <p className="text-gray-400 text-sm mb-2">Drag and drop or click to browse</p>
                        <p className="text-gray-400 text-xs">Max file size: 10MB each</p>
                    </>
                )}
            </div>

            {fileError && (
                <p className="text-red-500 text-sm mt-2 flex items-center">
                    <X size={16} className="mr-1" />
                    {fileError}
                </p>
            )}
        </div>
    )
}
