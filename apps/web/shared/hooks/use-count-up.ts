'use client';

import { useEffect, useState } from 'react';
import { useReducedMotion } from 'motion/react';

export function useCountUp(target: number, durationMs = 1000): number {
  const prefersReducedMotion = useReducedMotion();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion) {
      setValue(target);
      return;
    }

    let rafId: number;
    const startTime = performance.now();

    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      setValue(Math.round(target * progress));

      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      }
    }

    rafId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafId);
  }, [target, durationMs, prefersReducedMotion]);

  return value;
}
