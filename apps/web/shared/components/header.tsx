'use client';

import { List, X } from '@phosphor-icons/react/ssr';
import { AnimatePresence, motion } from 'motion/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';

import { EASE_DT_EXPO_OUT } from '@/shared/lib/motion';
import { routes } from '@/shared/lib/routes';

import { Logo } from './logo';
import { PremiumButton } from './premium-button';

const navLinks = [
  { href: routes.home, label: 'Продукт' },
  { href: routes.prices, label: 'Ціни' },
  { href: routes.demo, label: 'Демо' },
  { href: routes.blog, label: 'Блог' },
  { href: routes.contacts, label: 'Контакти' },
];

export function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={
        isScrolled
          ? 'fixed top-0 left-0 right-0 z-50 bg-dt-warm-white/80 shadow-sm backdrop-blur-md transition-all duration-300'
          : 'fixed top-0 left-0 right-0 z-50 bg-dt-warm-white transition-all duration-300'
      }
    >
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex h-16 items-center justify-between lg:h-20">
          <Logo />

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-8 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={
                  pathname === link.href
                    ? 'text-base font-semibold text-dt-navy transition-colors'
                    : 'text-base font-medium text-dt-graphite transition-colors hover:text-dt-coral'
                }
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden items-center gap-3 lg:flex">
            <PremiumButton variant="outline" size="default" asChild>
              <Link href={routes.demo}>Демо</Link>
            </PremiumButton>
            <PremiumButton variant="coral" size="default" asChild>
              <Link href={routes.contacts}>Спробувати безкоштовно</Link>
            </PremiumButton>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <PremiumButton
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X weight="regular" className="h-6 w-6" />
              ) : (
                <List weight="regular" className="h-6 w-6" />
              )}
            </PremiumButton>
          </div>
        </div>

        {/* Mobile Menu (inline collapse) */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: EASE_DT_EXPO_OUT }}
              className="overflow-hidden border-t border-dt-navy/10 lg:hidden"
            >
              <nav className="flex flex-col gap-4 py-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={
                      pathname === link.href
                        ? 'px-2 py-2 text-base font-semibold text-dt-navy transition-colors'
                        : 'px-2 py-2 text-base font-medium text-dt-graphite transition-colors'
                    }
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="flex flex-col gap-2 pt-2">
                  <PremiumButton variant="outline" size="default" asChild>
                    <Link
                      href={routes.demo}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Демо
                    </Link>
                  </PremiumButton>
                  <PremiumButton variant="coral" size="default" asChild>
                    <Link
                      href={routes.contacts}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Спробувати безкоштовно
                    </Link>
                  </PremiumButton>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
