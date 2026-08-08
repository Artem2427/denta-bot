'use client';

import { motion, useReducedMotion } from 'motion/react';
import * as React from 'react';

import { useInView } from '@/shared/hooks/use-in-view';
import { revealVariants } from '@/shared/lib/motion';

export function Reveal({
  children,
  className,
  threshold = 0.15,
}: {
  children: React.ReactNode;
  className?: string;
  threshold?: number;
}) {
  const { ref, inView } = useInView<HTMLDivElement>(threshold);
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={
        prefersReducedMotion
          ? { hidden: { opacity: 1 }, visible: { opacity: 1 } }
          : revealVariants
      }
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
    >
      {children}
    </motion.div>
  );
}
