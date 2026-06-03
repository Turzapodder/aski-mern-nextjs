import React, { useMemo, useState } from 'react';
import { FileText, Link as LinkIcon, Plus, Trash2, UploadCloud, PencilLine } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { Assignment } from '@/lib/services/assignments';

const blockedExtensions = [
  '.exe',
  '.bat',
  '.cmd',
  '.sh',
  '.msi',
  '.com',
  '.scr',
  '.ps1',
  '.vbs',
  '.jar',
];

const maxFileSize = 50 * 1024 * 1024;
const maxFiles = 10;

interface TutorSubmissionPanelProps {
  assignment: Assignment;
  onSubmitted?: (assignment: Assignment) => void;
}

type SubmissionLink = {
  url: string;
  label?: string;
};

const getFileExtension = (name: string) => {
  const index = name.lastIndexOf('.');
  if (index === -1) return '';
  return name.slice(index).toLowerCase();
};

const isValidUrl = (value: string) => {
  try {
    const parsed = new URL(value);
    return Boolean(parsed.protocol && parsed.host);
  } catch {
    return false;
  }
};

const TutorSubmissionPanel: React.FC<TutorSubmissionPanelProps> = ({ assignment, onSubmitted }) => {
  const [submissionTitle, setSubmissionTitle] = useState('');
  const [submissionDescription, setSubmissionDescription] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [links, setLinks] = useState<SubmissionLink[]>([]);
  const [notes, setNotes] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videoExplanationFile, setVideoExplanationFile] = useState<File | null>(null);
  const [videoExplanationLink, setVideoExplanationLink] = useState('');
  const [oneToOneSessionCompleted, setOneToOneSessionCompleted] = useState(false);

  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_URL || process.env.REACT_APP_API_URL || 'http://localhost:8000';

  const fileErrors = useMemo(() => {
    return files.reduce<string[]>((acc, file) => {
      const ext = getFileExtension(file.name);
      if (blockedExtensions.includes(ext)) {
        acc.push(`${file.name} has a blocked file type.`);
      } else if (file.size > maxFileSize) {
        acc.push(`${file.name} exceeds the 50MB limit.`);
      }
      return acc;
    }, []);
  }, [files]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const incoming = Array.from(event.target.files || []);
    const nextFiles: File[] = [];
    const errors: string[] = [];

    incoming.forEach((file) => {
      const ext = getFileExtension(file.name);
      if (blockedExtensions.includes(ext)) {
        errors.push(`${file.name} has a blocked file type.`);
        return;
      }
      if (file.size > maxFileSize) {
        errors.push(`${file.name} exceeds the 50MB limit.`);
        return;
      }
      nextFiles.push(file);
    });

    if (files.length + nextFiles.length > maxFiles) {
      errors.push(`You can upload up to ${maxFiles} files.`);
    }

    if (errors.length) {
      toast.error(errors[0]);
    }

    const allowedFiles = nextFiles.slice(0, Math.max(0, maxFiles - files.length));
    if (allowedFiles.length > 0) {
      setFiles((prev) => [...prev, ...allowedFiles]);
    }
    event.target.value = '';
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, idx) => idx !== index));
  };

  const addLink = () => {
    setLinks((prev) => [...prev, { url: '', label: '' }]);
  };

  const updateLink = (index: number, field: keyof SubmissionLink, value: string) => {
    setLinks((prev) =>
      prev.map((link, idx) => (idx === index ? { ...link, [field]: value } : link))
    );
  };

  const removeLink = (index: number) => {
    setLinks((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async () => {
    const trimmedTitle = submissionTitle.trim();
    const trimmedDescription = submissionDescription.trim();
    const trimmedNotes = notes.trim();
    const validLinks = links
      .map((link) => ({ url: link.url.trim(), label: link.label?.trim() || undefined }))
      .filter((link) => link.url && isValidUrl(link.url));

    if (!trimmedTitle || !trimmedDescription) {
      toast.error('Please add a submission title and description.');
      return;
    }

    if (fileErrors.length > 0) {
      toast.error(fileErrors[0]);
      return;
    }
    
    if (assignment.videoExplanation) {
      if (!videoExplanationFile && !videoExplanationLink.trim()) {
        toast.error('Video explanation is required. Please upload a video or provide a link.');
        return;
      }
      if (videoExplanationLink.trim() && !isValidUrl(videoExplanationLink.trim())) {
        toast.error('Please provide a valid video explanation link.');
        return;
      }
    }

    const hasAnyContent = files.length > 0 || validLinks.length > 0 || !!trimmedNotes || !!videoExplanationFile || !!videoExplanationLink.trim() || oneToOneSessionCompleted;
    if (!hasAnyContent) {
      toast.error('Please add files, links, or notes before submitting.');
      return;
    }

    const formData = new FormData();
    formData.append('submissionTitle', trimmedTitle);
    formData.append('submissionDescription', trimmedDescription);
    files.forEach((file) => {
      formData.append('submissionFiles', file);
    });
    if (trimmedNotes) {
      formData.append('submissionNotes', trimmedNotes);
    }
    if (validLinks.length > 0) {
      formData.append('submissionLinks', JSON.stringify(validLinks));
    }
    if (videoExplanationFile) {
      formData.append('videoExplanationFile', videoExplanationFile);
    } else if (videoExplanationLink.trim()) {
      formData.append('videoExplanationLink', videoExplanationLink.trim());
    }
    if (assignment.requestOneToOneSession) {
      formData.append('oneToOneSessionCompleted', String(oneToOneSessionCompleted));
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);
      const response = await axios.post(
        `${apiBaseUrl}/api/assignments/${assignment._id}/submit`,
        formData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (event) => {
            if (!event.total) return;
            const percent = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(percent);
          },
        }
      );
      const result = response.data;
      toast.success('Submission sent successfully.');
      setSubmissionTitle('');
      setSubmissionDescription('');
      setFiles([]);
      setLinks([]);
      setNotes('');
      setVideoExplanationFile(null);
      setVideoExplanationLink('');
      setOneToOneSessionCompleted(false);
      setUploadProgress(0);
      if (result?.data && onSubmitted) {
        onSubmitted(result.data);
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || error?.data?.message || 'Unable to submit work'
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Submit your work</h2>
          <p className="text-sm text-gray-500">
            Add a clear title, a short summary, and attach your delivery files.
          </p>
        </div>
        <div className="rounded-xl bg-primary-50 p-3">
          <UploadCloud className="h-6 w-6 text-primary-500" />
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Submission title</label>
            <div className="relative">
              <PencilLine className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={submissionTitle}
                onChange={(event) => setSubmissionTitle(event.target.value)}
                placeholder="Final report + solution files"
                className="w-full rounded-lg border border-gray-200 pl-9 pr-3 py-2 text-sm focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-200"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Short description
            </label>
            <input
              value={submissionDescription}
              onChange={(event) => setSubmissionDescription(event.target.value)}
              placeholder="What you delivered and key highlights"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-200"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Files</label>
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
          />
          <p className="mt-2 text-xs text-gray-500">
            Up to {maxFiles} files. Executable formats are blocked.
          </p>
        </div>

        {files.length > 0 && (
          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2 text-sm"
              >
                <div className="flex items-center gap-2 text-gray-700">
                  <FileText className="h-4 w-4 text-primary-500" />
                  <div>
                    <div className="text-sm font-medium">{file.name}</div>
                    <div className="text-[11px] text-gray-400">
                      {(file.size / (1024 * 1024)).toFixed(1)} MB
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="text-gray-400 hover:text-rose-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">Links</label>
            <button
              type="button"
              onClick={addLink}
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700"
            >
              <Plus className="h-3 w-3" />
              Add link
            </button>
          </div>

          {links.length === 0 && <p className="text-xs text-gray-500">No links added yet.</p>}

          <div className="space-y-2">
            {links.map((link, index) => (
              <div key={`link-${index}`} className="grid gap-2 sm:grid-cols-5">
                <div className="sm:col-span-3">
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      value={link.url}
                      onChange={(event) => updateLink(index, 'url', event.target.value)}
                      placeholder="https://drive.google.com/..."
                      className="w-full rounded-lg border border-gray-200 pl-9 pr-3 py-2 text-sm"
                    />
                  </div>
                </div>
                <div className="sm:col-span-2 flex items-center gap-2">
                  <input
                    value={link.label || ''}
                    onChange={(event) => updateLink(index, 'label', event.target.value)}
                    placeholder="Label (optional)"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => removeLink(index)}
                    className="text-gray-400 hover:text-rose-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {(assignment.videoExplanation || assignment.requestOneToOneSession) && (
          <div className="space-y-4 rounded-xl border border-primary-100 bg-primary-50/50 p-4">
            <h3 className="font-medium text-primary-900">Required Deliverables</h3>
            
            {assignment.requestOneToOneSession && (
              <label className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-primary-50 transition-colors">
                <div className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border ${oneToOneSessionCompleted ? 'bg-primary-500 border-primary-500' : 'border-gray-300 bg-white'}`}>
                  {oneToOneSessionCompleted && <div className="h-2 w-2 rounded-full bg-white" />}
                </div>
                <span className="text-sm text-gray-700">I have completed the 1:1 session with the student</span>
                <input type="checkbox" className="hidden" checked={oneToOneSessionCompleted} onChange={(e) => setOneToOneSessionCompleted(e.target.checked)} />
              </label>
            )}

            {assignment.videoExplanation && (
              <div className="space-y-2 p-2">
                <label className="block text-sm font-medium text-gray-700">Video Explanation</label>
                <p className="text-xs text-gray-500 mb-2">Upload a video or provide an external secure link.</p>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="flex-1 relative">
                    <LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      value={videoExplanationLink}
                      onChange={(e) => setVideoExplanationLink(e.target.value)}
                      placeholder="https://youtu.be/..."
                      disabled={!!videoExplanationFile}
                      className="w-full rounded-lg border border-gray-200 pl-9 pr-3 py-2 text-sm disabled:bg-gray-100 disabled:text-gray-400"
                    />
                  </div>
                  <span className="text-xs font-medium text-gray-400 text-center uppercase">OR</span>
                  <div className="flex-1">
                     <input
                        type="file"
                        accept="video/*"
                        disabled={!!videoExplanationLink}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > maxFileSize) {
                              toast.error(`Video exceeds the 50MB limit.`);
                              e.target.value = '';
                              return;
                            }
                            setVideoExplanationFile(file);
                          } else {
                            setVideoExplanationFile(null);
                          }
                        }}
                        className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 disabled:opacity-50 cursor-pointer"
                     />
                  </div>
                </div>
                {(videoExplanationFile || videoExplanationLink) && (
                  <button 
                    type="button"
                    onClick={() => {
                      setVideoExplanationFile(null);
                      setVideoExplanationLink('');
                    }}
                    className="text-xs text-rose-500 hover:text-rose-600 font-medium flex items-center gap-1 mt-1"
                  >
                    <Trash2 className="h-3 w-3" /> Clear video
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={4}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-200"
            placeholder="Describe what you delivered and any instructions for the student."
          />
        </div>
      </div>

      {isUploading && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Uploading files...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-primary-400 transition-all"
              style={{ width: `${Math.max(uploadProgress, 5)}%` }}
            ></div>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={isUploading}
        className="mt-6 w-full rounded-lg bg-primary-500 px-4 py-3 text-sm font-semibold text-white hover:bg-primary-600 disabled:opacity-60"
      >
        {isUploading ? 'Submitting...' : 'Submit work'}
      </button>
    </div>
  );
};

export default TutorSubmissionPanel;
