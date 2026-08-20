'use client';

import { Container } from '@/shared/components/container';
import { PremiumButton } from '@/shared/components/premium-button';
import * as React from 'react';

export default function BlogError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): React.JSX.Element {
  React.useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen pb-16 pt-24 lg:pt-32">
      <Container>
        <div className="mx-auto max-w-2xl py-16 text-center">
          <h1 className="text-[clamp(1.9rem,3.4vw,2.75rem)] leading-[1.1] tracking-[-0.03em] font-dt-heading font-bold text-dt-navy">
            Щось пішло не так
          </h1>
          <p className="mt-4 text-[1rem] leading-[1.5] text-dt-graphite">
            Не вдалося завантажити дані. Спробуйте оновити сторінку.
          </p>
          <div className="mt-6">
            <PremiumButton onClick={() => reset()}>Оновити</PremiumButton>
          </div>
        </div>
      </Container>
    </div>
  );
}
