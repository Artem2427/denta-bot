export const EASE_DT_EXPO_OUT = [0.16, 1, 0.3, 1] as const;

export const revealVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE_DT_EXPO_OUT },
  },
};

export const revealContainerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

export const hoverLift = {
  y: -4,
  transition: { duration: 0.2, ease: EASE_DT_EXPO_OUT },
};
