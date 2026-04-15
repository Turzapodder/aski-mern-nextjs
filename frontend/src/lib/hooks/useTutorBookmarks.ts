import { useCallback, useEffect, useMemo, useState } from 'react';
import { useGetUserQuery } from '@/lib/services/auth';
import { Tutor } from '@/types/TutorsList';

interface BookmarkResponse {
  success?: boolean;
  data?: Tutor[];
  bookmarkedTutorIds?: string[];
}

const getBaseUrl = () => process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const useTutorBookmarks = () => {
  const { data: userData } = useGetUserQuery();
  const isAuthenticated = Boolean(userData?.user?._id);
  const [bookmarkedTutorIds, setBookmarkedTutorIds] = useState<string[]>([]);
  const [bookmarkedTutors, setBookmarkedTutors] = useState<Tutor[]>([]);
  const [loadingBookmarks, setLoadingBookmarks] = useState(false);

  const refreshBookmarks = useCallback(async () => {
    if (!isAuthenticated) {
      setBookmarkedTutorIds([]);
      setBookmarkedTutors([]);
      return;
    }

    setLoadingBookmarks(true);
    try {
      const response = await fetch(`${getBaseUrl()}/api/tutors/bookmarks`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch bookmarks');
      }

      const result: BookmarkResponse = await response.json();
      if (!result?.success) {
        throw new Error('Failed to fetch bookmarks');
      }

      setBookmarkedTutorIds(
        Array.isArray(result.bookmarkedTutorIds)
          ? result.bookmarkedTutorIds.map((id) => String(id))
          : []
      );
      setBookmarkedTutors(Array.isArray(result.data) ? result.data : []);
    } catch {
      setBookmarkedTutorIds([]);
      setBookmarkedTutors([]);
    } finally {
      setLoadingBookmarks(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshBookmarks();
  }, [refreshBookmarks]);

  const toggleBookmark = useCallback(
    async (tutorId: string) => {
      if (!isAuthenticated) {
        return { requiresAuth: true, isBookmarked: false };
      }

      const alreadyBookmarked = bookmarkedTutorIds.includes(tutorId);
      const method = alreadyBookmarked ? 'DELETE' : 'POST';

      const response = await fetch(`${getBaseUrl()}/api/tutors/bookmarks/${encodeURIComponent(tutorId)}`, {
        method,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to update bookmark');
      }

      const result: BookmarkResponse = await response.json();
      if (!result?.success) {
        throw new Error('Failed to update bookmark');
      }

      const nextIds = Array.isArray(result.bookmarkedTutorIds)
        ? result.bookmarkedTutorIds.map((id) => String(id))
        : [];

      setBookmarkedTutorIds(nextIds);
      await refreshBookmarks();

      return {
        requiresAuth: false,
        isBookmarked: nextIds.includes(tutorId),
      };
    },
    [bookmarkedTutorIds, isAuthenticated, refreshBookmarks]
  );

  const bookmarkedSet = useMemo(
    () => new Set(bookmarkedTutorIds.map((id) => String(id))),
    [bookmarkedTutorIds]
  );

  return {
    isAuthenticated,
    loadingBookmarks,
    bookmarkedTutorIds,
    bookmarkedTutors,
    bookmarkedSet,
    refreshBookmarks,
    toggleBookmark,
  };
};
