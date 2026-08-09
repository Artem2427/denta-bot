'use client';

import { motion } from 'motion/react';
import * as React from 'react';

import { useInView } from '@/shared/hooks/use-in-view';
import { revealContainerVariants, revealVariants } from '@/shared/lib/motion';

export function StaggerGrid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { ref, inView } = useInView<HTMLDivElement>(0.15);

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={revealContainerVariants}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children }: { children: React.ReactNode }) {
  return <motion.div variants={revealVariants}>{children}</motion.div>;
}
