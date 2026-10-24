/**
 * COSMIC FRONTIER — Unified Motion Design System
 * 
 * Standard motion tokens, physics-based camera interpolation,
 * accessible reduced-motion support, and tab visibility hooks.
 */

import { useState, useEffect } from 'react';

/**
 * Standardized Motion Duration Tokens (milliseconds)
 */
export const MOTION_DURATIONS = {
  MICRO: 120,       // Hover, active, focus rings, clicks
  FAST: 200,        // Dropdowns, popovers, icon rotations, tab switches
  NORMAL: 300,      // Modals, card expansions, view transitions
  PANEL: 450,       // Large side-drawers, mobile navigation drawer
  TRANSIT: 600,     // Timeline epoch scrub transit, encounter jump
  SCENE: 750        // 3D camera flight, planetary focal transitions
} as const;

/**
 * Standardized Easing Curves (CSS cubic-bezier strings & JS functions)
 */
export const MOTION_EASINGS = {
  // Entering elements: fast start, gentle deceleration
  ENTER: 'cubic-bezier(0.16, 1, 0.3, 1)',
  // Exiting elements: accelerates away
  EXIT: 'cubic-bezier(0.7, 0, 0.84, 0)',
  // Symmetrical two-way moves: smooth acceleration and deceleration
  IN_OUT: 'cubic-bezier(0.4, 0, 0.2, 1)',
  // Interactive spring-like response for buttons and active states
  SNAPPY: 'cubic-bezier(0.2, 0.9, 0.3, 1)',
  // Radar / continuous loops
  LINEAR: 'linear'
} as const;

/**
 * Math easing functions for 60fps canvas & WebGL animation frames
 */
export const Easing = {
  linear: (t: number): number => t,
  easeOutQuad: (t: number): number => t * (2 - t),
  easeInOutQuad: (t: number): number => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  easeOutCubic: (t: number): number => 1 - Math.pow(1 - t, 3),
  easeInOutCubic: (t: number): number => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  easeOutExpo: (t: number): number => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  smoothStep: (t: number): number => t * t * (3 - 2 * t)
};

/**
 * Smooth exponential dampening / lerp for frame-rate independent camera easing
 * @param current Current value
 * @param target Target value
 * @param speed Smoothing speed multiplier (e.g. 5 to 10)
 * @param deltaSec Elapsed delta time in seconds
 */
export function damp(current: number, target: number, speed: number, deltaSec: number): number {
  return current + (target - current) * (1 - Math.exp(-speed * deltaSec));
}

/**
 * Angle interpolation with wrap-around at 2*PI
 */
export function lerpAngle(current: number, target: number, alpha: number): number {
  const twoPi = Math.PI * 2;
  let diff = (target - current) % twoPi;
  if (diff < -Math.PI) diff += twoPi;
  if (diff > Math.PI) diff -= twoPi;
  return current + diff * alpha;
}

/**
 * React Hook: Senses both OS prefers-reduced-motion and manual user toggle
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const manualClass = document.documentElement.classList.contains('reduce-motion');
    return media.matches || manualClass;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => {
      const manualClass = document.documentElement.classList.contains('reduce-motion');
      setReduced(e.matches || manualClass);
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
    } else {
      mediaQuery.addListener(handler);
    }

    // Observer for manual class toggle on documentElement
    const observer = new MutationObserver(() => {
      const hasClass = document.documentElement.classList.contains('reduce-motion');
      setReduced(mediaQuery.matches || hasClass);
    });

    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handler);
      } else {
        mediaQuery.removeListener(handler);
      }
      observer.disconnect();
    };
  }, []);

  return reduced;
}

/**
 * React Hook: Senses browser tab visibility (document.hidden)
 * Used to immediately pause 3D / 2D animation loops when the tab is backgrounded
 */
export function useDocumentVisibility(): boolean {
  const [isVisible, setIsVisible] = useState<boolean>(() => {
    if (typeof document === 'undefined') return true;
    return document.visibilityState === 'visible';
  });

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const handleVisibilityChange = () => {
      setIsVisible(document.visibilityState === 'visible');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return isVisible;
}

