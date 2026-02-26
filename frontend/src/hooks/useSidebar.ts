"use client";

import { useState, useCallback } from "react";

/**
 * useSidebar — Manages collapsible sidebar state for the user dashboard layout.
 *
 * Usage:
 *   const { collapsed, toggle, setCollapsed } = useSidebar()
 */
export const useSidebar = (initialCollapsed = false) => {
  const [collapsed, setCollapsed] = useState(initialCollapsed);

  const toggle = useCallback(() => setCollapsed((prev) => !prev), []);

  const handleToggle = useCallback((isCollapsed: boolean) => {
    setCollapsed(isCollapsed);
  }, []);

  return { collapsed, toggle, handleToggle, setCollapsed };
};

export default useSidebar;
