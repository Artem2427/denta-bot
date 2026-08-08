import { routes } from '@/lib/routes';
import Link from 'next/link';

import { Logo } from './logo';

export function Footer(): React.JSX.Element {
  return (
    <footer className="border-t border-border bg-muted">
      <div className="container mx-auto px-4 py-12 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          {/* Column 1 — Logo + description */}
          <div className="space-y-4">
            <Logo />
            <p className="text-sm text-muted-foreground">
              Автоматизація запису пацієнтів у стоматологічні клініки через
              Telegram бот
            </p>
            <div className="flex gap-3">
              <a
                href="https://t.me/dentabot"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-muted transition-colors hover:bg-brand hover:text-primary-foreground"
              >
                <span className="text-lg">✈️</span>
              </a>
              <a
                href="https://instagram.com/dentabot"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-muted transition-colors hover:bg-brand hover:text-primary-foreground"
              >
                <span className="text-lg">📷</span>
              </a>
            </div>
          </div>

          {/* Column 2 — Product links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Продукт</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href={routes.home}
                  className="text-sm text-muted-foreground transition-colors hover:text-brand"
                >
                  Головна
                </Link>
              </li>
              <li>
                <Link
                  href={routes.prices}
                  className="text-sm text-muted-foreground transition-colors hover:text-brand"
                >
                  Ціни
                </Link>
              </li>
              <li>
                <Link
                  href={routes.demo}
                  className="text-sm text-muted-foreground transition-colors hover:text-brand"
                >
                  Демо
                </Link>
              </li>
              <li>
                <Link
                  href={routes.blog}
                  className="text-sm text-muted-foreground transition-colors hover:text-brand"
                >
                  Блог
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3 — Company links (D-05: keep /about and /privacy, they 404 until a future milestone) */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Компанія</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href={routes.about}
                  className="text-sm text-muted-foreground transition-colors hover:text-brand"
                >
                  Про нас
                </Link>
              </li>
              <li>
                <Link
                  href={routes.contacts}
                  className="text-sm text-muted-foreground transition-colors hover:text-brand"
                >
                  Контакти
                </Link>
              </li>
              <li>
                <Link
                  href={routes.privacy}
                  className="text-sm text-muted-foreground transition-colors hover:text-brand"
                >
                  Політика конфіденційності
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4 — Contact info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Контакти</h3>
            <ul className="space-y-3">
              <li className="text-sm text-muted-foreground">
                <span className="mb-1 block font-medium text-foreground">
                  Email
                </span>
                <a
                  href="mailto:hello@dentabot.ua"
                  className="transition-colors hover:text-brand"
                >
                  hello@dentabot.ua
                </a>
              </li>
              <li className="text-sm text-muted-foreground">
                <span className="mb-1 block font-medium text-foreground">
                  Telegram
                </span>
                <a
                  href="https://t.me/dentabot_support"
                  className="transition-colors hover:text-brand"
                >
                  @dentabot_support
                </a>
              </li>
              <li className="text-sm text-muted-foreground">
                <span className="mb-1 block font-medium text-foreground">
                  Робочі години
                </span>
                Пн-Пт: 9:00 - 18:00
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-8">
          <p className="text-center text-sm text-muted-foreground">
            © 2026 DentaBot by Dankohub
          </p>
        </div>
      </div>
    </footer>
  );
}
