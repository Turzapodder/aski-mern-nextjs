interface TutorRequestBannerProps {
  tutorName: string;
}

export function TutorRequestBanner({ tutorName }: TutorRequestBannerProps) {
  return (
    <div className="mb-6 rounded-xl border border-gray-100 bg-gray-50 p-4 text-xs sm:text-sm text-gray-600">
      Requesting proposal from{' '}
      <span className="font-semibold text-gray-900">{tutorName}</span>. Once submitted, only this
      tutor will see the request.
    </div>
  );
}
