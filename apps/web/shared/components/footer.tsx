import Link from 'next/link';

import { routes } from '@/shared/lib/routes';

import { Logo } from './logo';

const socialIconClassName =
  'flex h-10 w-10 items-center justify-center rounded-full bg-dt-navy/5 transition-colors hover:bg-dt-coral hover:text-dt-navy';

export function Footer(): React.JSX.Element {
  return (
    <footer className="border-t border-dt-navy/10 bg-dt-warm-white">
      <div className="container mx-auto px-4 lg:px-8 py-16 lg:py-24">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          {/* Column 1 — Logo + description */}
          <div className="space-y-4">
            <Logo />
            <p className="text-sm text-dt-graphite">
              Автоматизація запису пацієнтів у стоматологічні клініки через
              Telegram бот
            </p>
            <div className="flex gap-3">
              <a
                href="https://t.me/dentabot"
                target="_blank"
                rel="noopener noreferrer"
                className={socialIconClassName}
              >
                <span className="text-lg">✈️</span>
              </a>
              <a
                href="https://instagram.com/dentabot"
                target="_blank"
                rel="noopener noreferrer"
                className={socialIconClassName}
              >
                <span className="text-lg">📷</span>
              </a>
            </div>
          </div>

          {/* Column 2 — Product links */}
          <div className="space-y-4">
            <h3 className="font-dt-heading font-semibold text-dt-navy">
              Продукт
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href={routes.home}
                  className="text-sm text-dt-graphite transition-colors hover:text-dt-coral"
                >
                  Головна
                </Link>
              </li>
              <li>
                <Link
                  href={routes.prices}
                  className="text-sm text-dt-graphite transition-colors hover:text-dt-coral"
                >
                  Ціни
                </Link>
              </li>
              <li>
                <Link
                  href={routes.demo}
                  className="text-sm text-dt-graphite transition-colors hover:text-dt-coral"
                >
                  Демо
                </Link>
              </li>
              <li>
                <Link
                  href={routes.blog}
                  className="text-sm text-dt-graphite transition-colors hover:text-dt-coral"
                >
                  Блог
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3 — Company links (D-05: keep /about and /privacy, they 404 until a future milestone) */}
          <div className="space-y-4">
            <h3 className="font-dt-heading font-semibold text-dt-navy">
              Компанія
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href={routes.about}
                  className="text-sm text-dt-graphite transition-colors hover:text-dt-coral"
                >
                  Про нас
                </Link>
              </li>
              <li>
                <Link
                  href={routes.contacts}
                  className="text-sm text-dt-graphite transition-colors hover:text-dt-coral"
                >
                  Контакти
                </Link>
              </li>
              <li>
                <Link
                  href={routes.privacy}
                  className="text-sm text-dt-graphite transition-colors hover:text-dt-coral"
                >
                  Політика конфіденційності
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4 — Contact info */}
          <div className="space-y-4">
            <h3 className="font-dt-heading font-semibold text-dt-navy">
              Контакти
            </h3>
            <ul className="space-y-3">
              <li className="text-sm text-dt-graphite">
                <span className="mb-1 block font-medium text-dt-navy">
                  Email
                </span>
                <a
                  href="mailto:hello@dentabot.ua"
                  className="transition-colors hover:text-dt-coral"
                >
                  hello@dentabot.ua
                </a>
              </li>
              <li className="text-sm text-dt-graphite">
                <span className="mb-1 block font-medium text-dt-navy">
                  Telegram
                </span>
                <a
                  href="https://t.me/dentabot_support"
                  className="transition-colors hover:text-dt-coral"
                >
                  @dentabot_support
                </a>
              </li>
              <li className="text-sm text-dt-graphite">
                <span className="mb-1 block font-medium text-dt-navy">
                  Робочі години
                </span>
                Пн-Пт: 9:00 - 18:00
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-dt-navy/10 pt-8">
          <p className="text-center text-sm text-dt-graphite">
            © 2026 DentaBot by Dankohub
          </p>
        </div>
      </div>
    </footer>
  );
}
