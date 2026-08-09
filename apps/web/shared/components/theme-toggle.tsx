'use client';

import { Moon, Sun } from '@phosphor-icons/react/ssr';
import { useTheme } from 'next-themes';
import * as React from 'react';

import { PremiumButton } from './premium-button';

export function ThemeToggle(): React.JSX.Element {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <PremiumButton variant="ghost" size="icon" className="h-10 w-10">
        <Sun weight="regular" className="h-5 w-5" />
      </PremiumButton>
    );
  }

  return (
    <PremiumButton
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="h-10 w-10"
    >
      {theme === 'dark' ? (
        <Sun weight="regular" className="h-5 w-5" />
      ) : (
        <Moon weight="regular" className="h-5 w-5" />
      )}
      <span className="sr-only">Перемкнути тему</span>
    </PremiumButton>
  );
}
