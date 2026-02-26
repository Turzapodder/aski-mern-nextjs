"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const PAGE_TITLES: Record<string, string> = {
  "/": "Aski — Learn from Expert Tutors",
  "/user/dashboard": "Dashboard",
  "/user/assignments": "My Assignments",
  "/user/calendar": "Calendar",
  "/user/messages": "Messages",
  "/user/profile": "Profile",
  "/user/projects": "Projects",
  "/user/tutors": "Find Tutors",
  "/user/wallet": "Wallet",
  "/user/settings": "Settings",
  "/admin": "Admin Dashboard",
  "/admin/users": "Users",
  "/admin/tutors": "Tutors",
  "/admin/assignments": "Assignments",
  "/admin/finance": "Finance",
  "/admin/reports": "Disputes",
  "/admin/content-reports": "Reports",
  "/admin/settings": "Settings",
  "/account/login": "Sign In",
  "/account/register": "Create Account",
};

const APP_NAME = "Aski";

/**
 * usePageTitle — Dynamically sets document.title based on current pathname.
 * Falls back to the app name if the route isn't in the map.
 *
 * Usage:
 *   // Call once in root layout client wrapper or per-page
 *   usePageTitle()
 *
 *   // Or override the title for a specific page:
 *   usePageTitle("Custom Page Title")
 */
export const usePageTitle = (overrideTitle?: string) => {
  const pathname = usePathname();

  useEffect(() => {
    if (overrideTitle) {
      document.title = `${overrideTitle} | ${APP_NAME}`;
      return;
    }

    // Exact match first
    const exactTitle = PAGE_TITLES[pathname];
    if (exactTitle) {
      document.title =
        exactTitle === APP_NAME ? exactTitle : `${exactTitle} | ${APP_NAME}`;
      return;
    }

    // Partial match — find the longest prefix
    const matchedKey = Object.keys(PAGE_TITLES)
      .filter((key) => pathname.startsWith(key) && key !== "/")
      .sort((a, b) => b.length - a.length)[0];

    if (matchedKey) {
      const title = PAGE_TITLES[matchedKey];
      document.title = `${title} | ${APP_NAME}`;
    } else {
      document.title = APP_NAME;
    }
  }, [pathname, overrideTitle]);
};

export default usePageTitle;
