import { useState, useRef, useEffect, type ChangeEvent, type DragEvent } from 'react';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function useFileUpload() {
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Keep a stable ref to current urls so the unmount cleanup revokes all of them
  const previewUrlsRef = useRef<string[]>([]);
  useEffect(() => {
    previewUrlsRef.current = previewUrls;
  }, [previewUrls]);

  useEffect(() => {
    return () => {
      previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const validateFile = (file: File): string => {
    if (file.size > MAX_FILE_SIZE) return 'File size must be less than 10MB';
    return '';
  };

  const handleFilesSelect = (selectedFiles: File[]) => {
    const validFiles: File[] = [];
    let error = '';

    selectedFiles.forEach((file) => {
      const err = validateFile(file);
      if (err) error = err;
      else validFiles.push(file);
    });

    if (error && validFiles.length === 0) {
      setFileError(error);
      return;
    }

    setFileError('');
    const newPreviewUrls = validFiles.map((file) => URL.createObjectURL(file));
    setPreviewUrls((prev) => [...prev, ...newPreviewUrls]);
    setFiles((prev) => [...prev, ...validFiles]);
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) handleFilesSelect(Array.from(e.target.files));
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length) handleFilesSelect(Array.from(e.dataTransfer.files));
  };

  const handleRemoveFile = (index: number) => {
    URL.revokeObjectURL(previewUrls[index]);
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
    setFiles((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (next.length === 0) {
        setFileError('');
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
      return next;
    });
  };

  const reset = () => {
    previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    setFiles([]);
    setPreviewUrls([]);
    setFileError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const openFilePicker = () => fileInputRef.current?.click();

  return {
    files,
    previewUrls,
    isDragging,
    fileError,
    fileInputRef,
    handleFileInputChange,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleRemoveFile,
    reset,
    openFilePicker,
  };
}
