import { Home } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@repo/ui';

export default function NotFound(): React.JSX.Element {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md space-y-6 text-center">
        <div className="text-8xl font-bold text-brand">404</div>
        <h1 className="text-3xl font-bold">Сторінку не знайдено</h1>
        <p className="text-muted-foreground">
          Вибачте, сторінка яку ви шукаєте не існує або була переміщена.
        </p>
        <Button size="lg" asChild>
          <Link href="/">
            <Home className="mr-2 h-5 w-5" />
            На головну
          </Link>
        </Button>
      </div>
    </div>
  );
}
