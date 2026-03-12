interface FormHeaderProps {
  requestedTutorName?: string;
}

export function FormHeader({ requestedTutorName }: FormHeaderProps) {
  return (
    <div className="mb-6">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
        {requestedTutorName ? (
          'Request a Proposal'
        ) : (
          <>
            Post a <span className="text-secondary-500">New Project</span>
          </>
        )}
      </h2>
      <p className="text-gray-600 text-xs sm:text-sm">
        {requestedTutorName
          ? 'Share your assignment details to invite this tutor to send a proposal.'
          : 'Please provide the necessary details below'}
      </p>
    </div>
  );
}
