export interface Tutor {
  id: string;
  name: string;
  avatar?: string;
  bio?: string;
  publicStats?: {
    averageRating?: number;
    totalProjects?: number;
    completedProjects?: number;
    totalReviews?: number;
  };
  hourlyRate?: number;
  skills?: string[];
  subjects?: string[];
}

export interface Teacher {
  id: string;
  name: string;
  subject: string;
  bio: string;
  lessons: number;
  courses: number;
  students: number;
  rating: number;
  price: number;
  originalPrice?: number;
  isTopTutor?: boolean;
  isCertified?: boolean;
  isNewTutor?: boolean;
  isHighDemand?: boolean;
  isOnlines?: boolean;
  image: string;
  badges?: string[];
}

export type SortOption = 'rating-desc' | 'price-asc' | 'price-desc' | 'subject-asc' | 'subject-desc';

export interface Filters {
  subject: string;
  minRating: string;
  maxRate: string;
  skills: string;
}
