import { type ClassValue, clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        'text-dt-h1',
        'text-dt-h2',
        'text-dt-h3',
        'text-dt-body',
        'text-dt-caption',
        'text-dt-eyebrow',
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
