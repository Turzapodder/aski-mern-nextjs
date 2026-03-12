interface CertificateUploadProps {
  certificate: File | null;
  onFileChange: (file: File) => void;
  onRemove: () => void;
}

export function CertificateUpload({ certificate, onFileChange, onRemove }: CertificateUploadProps) {
  const openPicker = () => {
    (document.getElementById('file-upload') as HTMLInputElement)?.click();
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Last Education Certificate (Optional)
      </label>
      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
        <div className="space-y-1 text-center">
          {certificate ? (
            <div className="text-sm text-gray-600">
              <p>Selected file: {certificate.name}</p>
              <button
                type="button"
                onClick={onRemove}
                className="text-red-500 hover:text-red-700 mt-2"
              >
                Remove file
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center">
              <svg
                className="mx-auto h-6 w-6 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <div className="mt-2 text-center">
                <p className="text-md font-medium text-black">
                  Choose a file or drag & drop it here.
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  JPEG, PNG, PDF, and WEBP formats, up to 10 MB.
                </p>
              </div>
              <button
                type="button"
                onClick={openPicker}
                className="mt-4 px-4 py-2 bg-white border border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
              >
                Browse File
              </button>
            </div>
          )}
          <input
            id="file-upload"
            type="file"
            className="sr-only"
            accept=".pdf,.jpg,.jpeg,.png,.webp"
            onChange={(e) => {
              const file = e.currentTarget.files?.[0];
              if (!file) return;
              if (file.size <= 10 * 1024 * 1024) {
                onFileChange(file);
              } else {
                alert('File size should be less than 10MB');
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
