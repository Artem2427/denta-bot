'use client';

import * as React from 'react';

import { Container } from '@/shared/components/container';
import { PremiumButton } from '@/shared/components/premium-button';

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
          <h1 className="text-dt-h2 font-dt-heading font-bold text-dt-navy">
            Щось пішло не так
          </h1>
          <p className="mt-4 text-dt-body text-dt-graphite">
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
