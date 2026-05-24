'use client';

import { useEffect } from 'react';

/**
 * Hook that attaches an IntersectionObserver to all `.reveal` elements
 * and adds `.visible` when they enter the viewport.
 * Call once in a top-level Client Component (e.g., landing page).
 */
export function useScrollReveal(threshold = 0.1) {
  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>('.reveal');
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold }
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [threshold]);
}
