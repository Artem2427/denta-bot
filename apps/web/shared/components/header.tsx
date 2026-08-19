'use client';

import { Link, usePathname } from '@/i18n/navigation';
import { LocaleSwitcher } from '@/shared/components/locale-switcher';
import { EASE_DT_EXPO_OUT } from '@/shared/lib/motion';
import { routes } from '@/shared/lib/routes';
import { List, X } from '@phosphor-icons/react/ssr';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useTranslations } from 'next-intl';
import * as React from 'react';

import { Container } from './container';
import { Logo } from './logo';
import { PremiumButton } from './premium-button';

export function Header() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const prefersReducedMotion = useReducedMotion();

  // 3 in-page anchors (retired-route content folds into the single landing
  // page as sections, Plan 07) + Blog, which stays a real, unprefixed route
  // (D-09) — deliberately only 4 nav items (design's own header also shows
  // "Контакти", but that's superseded by the primary CTA's #lead target,
  // kept to 4 to avoid redundancy per the client's "not overloaded"
  // instruction).
  const navLinks = [
    { href: '#product', label: t('product'), isBlog: false },
    { href: '#pricing', label: t('pricing'), isBlog: false },
    { href: '#demo', label: t('demo'), isBlog: false },
    { href: routes.blog, label: t('blog'), isBlog: true },
  ] as const;

  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={
        isScrolled
          ? 'fixed top-0 left-0 right-0 z-50 bg-dt-warm-white/[0.86] shadow-sm backdrop-blur-[14px] border-b border-[var(--dt-border)] transition-all duration-[var(--dt-duration-base)]'
          : 'fixed top-0 left-0 right-0 z-50 bg-dt-warm-white transition-all duration-300'
      }
    >
      <Container>
        <div className="flex h-16 items-center justify-between lg:h-20">
          <Logo />

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-8 lg:flex">
            {navLinks.map((link) =>
              link.isBlog ? (
                <Link
                  key={link.href}
                  href={link.href}
                  className={
                    pathname === link.href
                      ? 'text-base font-semibold text-dt-navy transition-colors'
                      : 'text-base font-medium text-dt-graphite transition-colors hover:text-dt-teal'
                  }
                >
                  {link.label}
                </Link>
              ) : (
                // Same-page hash jump — no active-state (meaningless for
                // hash links), no Next Link needed at all.
                <a
                  key={link.href}
                  href={link.href}
                  className="text-base font-medium text-dt-graphite transition-colors hover:text-dt-teal"
                >
                  {link.label}
                </a>
              ),
            )}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden items-center gap-3 lg:flex">
            <LocaleSwitcher />
            <PremiumButton variant="outline" size="default" asChild>
              <a href="#demo">{t('ctaOutline')}</a>
            </PremiumButton>
            <PremiumButton variant="coral" size="default" asChild>
              <a href="#lead">{t('ctaPrimary')}</a>
            </PremiumButton>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <PremiumButton
              variant="outline"
              size="icon"
              className="size-14"
              aria-label={isMobileMenuOpen ? t('menuClose') : t('menuOpen')}
              aria-expanded={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X weight="bold" className="h-7 w-7" />
              ) : (
                <List weight="bold" className="h-7 w-7" />
              )}
            </PremiumButton>
          </div>
        </div>

        {/* Mobile Menu (inline collapse) */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={
                prefersReducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, height: 0 }
              }
              animate={
                prefersReducedMotion
                  ? { opacity: 1 }
                  : { opacity: 1, height: 'auto' }
              }
              exit={
                prefersReducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, height: 0 }
              }
              transition={
                prefersReducedMotion
                  ? { duration: 0.01 }
                  : { duration: 0.25, ease: EASE_DT_EXPO_OUT }
              }
              className="overflow-hidden border-t border-[var(--dt-border)] lg:hidden"
            >
              <nav className="flex flex-col gap-4 py-4">
                {navLinks.map((link) =>
                  link.isBlog ? (
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
                  ) : (
                    <a
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="px-2 py-2 text-base font-medium text-dt-graphite transition-colors"
                    >
                      {link.label}
                    </a>
                  ),
                )}
                <div className="flex flex-col gap-2 pt-2">
                  <LocaleSwitcher />
                  <PremiumButton variant="outline" size="default" asChild>
                    <a href="#demo" onClick={() => setIsMobileMenuOpen(false)}>
                      {t('ctaOutline')}
                    </a>
                  </PremiumButton>
                  <PremiumButton variant="coral" size="default" asChild>
                    <a href="#lead" onClick={() => setIsMobileMenuOpen(false)}>
                      {t('ctaPrimary')}
                    </a>
                  </PremiumButton>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </Container>
    </header>
  );
}
