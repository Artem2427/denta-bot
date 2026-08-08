'use client';

import { routes } from '@/lib/routes';
import { Button } from '@repo/ui';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';

import { Logo } from './logo';
import { ThemeToggle } from './theme-toggle';

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
          ? 'fixed top-0 left-0 right-0 z-50 bg-background/80 shadow-sm backdrop-blur-md transition-all duration-300'
          : 'fixed top-0 left-0 right-0 z-50 bg-background transition-all duration-300'
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
                    ? 'text-base font-medium text-brand transition-colors hover:text-brand'
                    : 'text-base font-medium text-muted-foreground transition-colors hover:text-brand'
                }
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden items-center gap-3 lg:flex">
            <ThemeToggle />
            <Button variant="brand-outline" size="default" asChild>
              <Link href={routes.demo}>Демо</Link>
            </Button>
            <Button variant="brand" size="default" asChild>
              <Link href={routes.contacts}>Спробувати безкоштовно</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu (inline collapse) */}
        {isMobileMenuOpen && (
          <div className="border-t border-border py-4 lg:hidden">
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={
                    pathname === link.href
                      ? 'px-2 py-2 text-base font-medium text-brand transition-colors'
                      : 'px-2 py-2 text-base font-medium text-muted-foreground transition-colors'
                  }
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex flex-col gap-2 pt-2">
                <Button variant="brand-outline" size="default" asChild>
                  <Link
                    href={routes.demo}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Демо
                  </Link>
                </Button>
                <Button variant="brand" size="default" asChild>
                  <Link
                    href={routes.contacts}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Спробувати безкоштовно
                  </Link>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
