"use client";

import { useState, useCallback } from "react";

/**
 * useMobileMenu — Reusable open/close state for any mobile drawer, sheet, or overlay.
 *
 * Usage:
 *   const { isOpen, open, close, toggle } = useMobileMenu()
 *   <Sheet open={isOpen} onOpenChange={toggle}>
 */
export const useMobileMenu = (initialOpen = false) => {
  const [isOpen, setIsOpen] = useState(initialOpen);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return { isOpen, open, close, toggle, setIsOpen };
};

export default useMobileMenu;
