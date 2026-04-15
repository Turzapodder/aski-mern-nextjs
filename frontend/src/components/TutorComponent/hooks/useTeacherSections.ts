import { useMemo } from 'react';
import { Tutor, Teacher } from '../../../types/TutorsList';

/**
 * Custom hook for mapping tutors into teacher card data
 * @param tutors Array of tutors
 * @returns Flattened teacher array
 */
export const useTeacherSections = (tutors: Tutor[]) => {
  return useMemo(() => {
    return tutors.map((tutor) => {
      const rating = tutor.publicStats?.averageRating ?? 0;
      const totalProjects = tutor.publicStats?.totalProjects ?? 0;
      const completedProjects = tutor.publicStats?.completedProjects ?? 0;
      const totalReviews = tutor.publicStats?.totalReviews ?? 0;
      const subjectName = tutor.subjects?.[0] || 'Tutors';

      const teacher: Teacher = {
        id: tutor.id,
        name: tutor.name,
        subject: subjectName,
        bio: tutor.bio || 'No bio available yet.',
        lessons: completedProjects,
        courses: totalProjects,
        students: totalReviews,
        rating,
        price: tutor.hourlyRate || 0,
        isTopTutor: rating >= 4.8,
        isNewTutor: totalProjects > 0 && totalProjects < 5,
        isHighDemand: completedProjects >= 20,
        badges: tutor.skills?.slice(0, 1),
        image: tutor.avatar || '/assets/tutor-profile.svg',
      };
      return teacher;
    });
  }, [tutors]);
};
