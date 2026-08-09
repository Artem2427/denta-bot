'use client';

import { useInView } from '@/shared/hooks/use-in-view';
import { revealContainerVariants, revealVariants } from '@/shared/lib/motion';
import { motion, useReducedMotion } from 'motion/react';
import * as React from 'react';

export function StaggerGrid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { ref, inView } = useInView<HTMLDivElement>(0.15);
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={
        prefersReducedMotion
          ? { hidden: {}, visible: {} }
          : revealContainerVariants
      }
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children }: { children: React.ReactNode }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className="h-full"
      variants={
        prefersReducedMotion
          ? { hidden: { opacity: 1 }, visible: { opacity: 1 } }
          : revealVariants
      }
    >
      {children}
    </motion.div>
  );
}
