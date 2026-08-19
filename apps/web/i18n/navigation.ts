import { createNavigation } from 'next-intl/navigation';

import { routing } from './routing';

const navigation: ReturnType<typeof createNavigation> = createNavigation(routing);

export const { Link, redirect, usePathname, useRouter, getPathname } =
  navigation;
