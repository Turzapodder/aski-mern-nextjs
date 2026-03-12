import { FileText, Link as LinkIcon } from 'lucide-react';

export default function SubmissionDetails({ submission }: any) {
  if (!submission) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
        No submission has been received yet.
      </div>
    );
  }

  const { submissionFiles = [], submissionLinks = [], submissionNotes } = submission;

  return (
    <div className="space-y-4">

      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Files</p>

        {submissionFiles.length === 0 && (
          <p className="text-sm text-gray-500">No files submitted.</p>
        )}

        {submissionFiles.map((file: any) => (
          <a
            key={file.url}
            href={file.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 text-sm text-primary-600 hover:underline"
          >
            <FileText className="h-4 w-4" />
            {file.originalName || file.filename}
          </a>
        ))}
      </div>

      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Links</p>

        {submissionLinks.length === 0 && (
          <p className="text-sm text-gray-500">No links submitted.</p>
        )}

        {submissionLinks.map((link: any) => (
          <a
            key={link.url}
            href={link.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 text-sm text-primary-600 hover:underline"
          >
            <LinkIcon className="h-4 w-4" />
            {link.label || link.url}
          </a>
        ))}
      </div>

      {submissionNotes && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Tutor notes</p>
          <p className="text-sm text-gray-600 whitespace-pre-line">
            {submissionNotes}
          </p>
        </div>
      )}
    </div>
  );
}