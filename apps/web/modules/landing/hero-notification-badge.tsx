'use client';

import { idleBounceAnimate, idleBounceTransition } from '@/shared/lib/motion';
import { CheckIcon } from '@phosphor-icons/react/ssr';
import { motion, useReducedMotion } from 'motion/react';

export function HeroNotificationBadge({
  text,
}: {
  text: string;
}): React.JSX.Element {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className="absolute -top-4 -right-4 flex items-center gap-2 rounded-dt-card bg-dt-warm-white p-4 shadow-[var(--shadow-dt-hover)]"
      animate={prefersReducedMotion ? undefined : idleBounceAnimate}
      transition={prefersReducedMotion ? undefined : idleBounceTransition}
    >
      <CheckIcon weight="bold" className="h-5 w-5 text-dt-teal" />
      <span className="text-sm font-medium text-dt-navy">{text}</span>
    </motion.div>
  );
}
