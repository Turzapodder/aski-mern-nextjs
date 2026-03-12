import Image from 'next/image';
import { Rabbit } from 'lucide-react';

interface ProfilePictureUploadProps {
  name: string;
  profilePicture: File | null;
  onFileChange: (file: File) => void;
}

export function ProfilePictureUpload({ name, profilePicture, onFileChange }: ProfilePictureUploadProps) {
  const openPicker = () => {
    (document.getElementById('profile-upload') as HTMLInputElement)?.click();
  };

  return (
    <div className="flex flex-col items-center">
      {profilePicture ? (
        <div className="flex flex-col items-center space-y-3">
          <div className="relative w-32 h-32 rounded-full overflow-hidden bg-yellow-400">
            <Image
              src={URL.createObjectURL(profilePicture as Blob)}
              alt="Profile"
              fill
              sizes="128px"
              className="object-cover"
              unoptimized
            />
          </div>
          <button
            type="button"
            onClick={openPicker}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-full text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Upload new photo
          </button>
          <p className="text-xs text-gray-500">
            At least 800x800 px recommended.
            <br />
            JPG or PNG is allowed
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center space-y-3">
          <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-gray-300 flex items-center justify-center">
            {name ? (
              <span className="text-5xl font-bold text-black">
                {name.charAt(0).toUpperCase()}
              </span>
            ) : (
              <Rabbit className="h-8 w-8 text-black" />
            )}
          </div>
          <button
            type="button"
            onClick={openPicker}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-full text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Upload new photo
          </button>
          <p className="text-xs text-gray-500 text-center">
            At least 800x800 px recommended.
            <br />
            JPG or PNG is allowed
          </p>
        </div>
      )}
      <input
        id="profile-upload"
        name="profilePicture"
        type="file"
        className="sr-only"
        accept=".jpg,.jpeg,.png"
        onChange={(e) => {
          const file = e.currentTarget.files?.[0];
          if (!file) return;
          if (file.type === 'image/jpeg' || file.type === 'image/png') {
            onFileChange(file);
          } else {
            alert('Only JPG or PNG files are allowed');
          }
        }}
      />
    </div>
  );
}
