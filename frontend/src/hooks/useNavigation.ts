"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";

/**
 * useNavigation — Active path detection + navigation with loading indicator.
 *
 * Usage:
 *   const { activeItem, activePath, isNavigating, navigate } = useNavigation()
 */
export const useNavigation = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  // Reset navigating state whenever the pathname actually changes
  useEffect(() => {
    setIsNavigating(false);
  }, [pathname]);

  // Derive the last segment as the "active item" (for sidebar highlight)
  const activeItem = useMemo(() => {
    if (!pathname) return "dashboard";
    const segments = pathname.split("/").filter(Boolean);
    return segments[segments.length - 1] || "dashboard";
  }, [pathname]);

  const activePath = pathname ?? "/";

  /** Navigate programmatically and show loading indicator */
  const navigate = useCallback(
    (href: string) => {
      setIsNavigating(true);
      router.push(href);
    },
    [router],
  );

  /** Called on link click — sets navigating flag and optionally closes mobile menu */
  const handleNavigate = useCallback((onClose?: () => void) => {
    setIsNavigating(true);
    onClose?.();
  }, []);

  return {
    pathname: activePath,
    activeItem,
    activePath,
    isNavigating,
    navigate,
    handleNavigate,
  };
};

export default useNavigation;
