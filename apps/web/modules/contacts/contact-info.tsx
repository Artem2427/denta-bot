import { PremiumCard } from '@/shared/components/premium-card';
import type { Icon } from '@phosphor-icons/react';
import {
  Clock,
  Envelope,
  Lightning,
  PaperPlaneTilt,
  Sparkle,
} from '@phosphor-icons/react/ssr';

const contactMethods: Array<{ Icon: Icon; label: string; value: string }> = [
  { Icon: PaperPlaneTilt, label: 'Telegram', value: '@dentabot_support' },
  { Icon: Envelope, label: 'Email', value: 'hello@dentabot.ua' },
  { Icon: Clock, label: 'Робочі години', value: 'Пн-Пт 9:00-18:00 Київ' },
];

const benefits: Array<{
  Icon: Icon;
  label: string;
  bg: string;
  iconColor: string;
}> = [
  {
    Icon: Clock,
    label: 'Відповідаємо за 2 години',
    bg: 'bg-green-50',
    iconColor: 'text-green-600',
  },
  {
    Icon: Sparkle,
    label: 'Безкоштовна демонстрація',
    bg: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },
  {
    Icon: Lightning,
    label: 'Налаштування за 1 день',
    bg: 'bg-purple-50',
    iconColor: 'text-purple-600',
  },
];

export function ContactInfo(): React.JSX.Element {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {contactMethods.map((method) => (
          <PremiumCard
            key={method.label}
            className="flex items-center gap-4 hover:translate-y-0 hover:shadow-[var(--shadow-dt-card)]"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-dt-card bg-dt-navy text-dt-warm-white">
              <method.Icon className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm text-dt-graphite">{method.label}</div>
              <div className="font-medium text-dt-navy">{method.value}</div>
            </div>
          </PremiumCard>
        ))}
      </div>
      <div className="space-y-3">
        {benefits.map((benefit) => (
          <div
            key={benefit.label}
            className={`flex items-center gap-3 rounded-dt-card p-4 ${benefit.bg}`}
          >
            <benefit.Icon className={`h-5 w-5 ${benefit.iconColor}`} />
            <span className="text-sm font-medium text-dt-navy">
              {benefit.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
