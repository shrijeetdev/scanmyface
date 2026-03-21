'use client';
import { useEffect, useRef } from 'react';

/**
 * Intersection Observer hook for scroll-reveal animations.
 * Returns a ref to attach to the element.
 * Adds `.scroll-visible` class when element enters viewport.
 */
export function useScrollReveal(options = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('scroll-visible');
          observer.unobserve(el); // Only animate once
        }
      },
      { threshold: options.threshold || 0.1, rootMargin: options.rootMargin || '0px 0px -40px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return ref;
}

/**
 * Component wrapper that adds scroll-reveal animation to its children.
 * Uses CSS class `.scroll-reveal` → `.scroll-visible` transition.
 */
export function ScrollReveal({ children, delay = 0, style = {} }) {
  const ref = useScrollReveal();

  return (
    <div
      ref={ref}
      className="scroll-reveal"
      style={{ ...style, transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
