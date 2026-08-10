import Link from 'next/link';
import * as React from 'react';

import { StaggerGrid, StaggerItem } from '@/modules/home/stagger-grid';
import { PremiumButton } from '@/shared/components/premium-button';
import { PremiumCard } from '@/shared/components/premium-card';
import { Reveal } from '@/shared/components/reveal';
import { routes } from '@/shared/lib/routes';

import { featuredPost, posts } from './_data';

export function RelatedPosts({
  excludeSlug,
}: {
  excludeSlug: string;
}): React.JSX.Element {
  const related = [featuredPost, ...posts]
    .filter((post) => post.slug !== excludeSlug)
    .slice(0, 3);

  return (
    <section>
      <Reveal>
        <h2 className="mb-8 text-dt-h2 font-dt-heading font-bold text-dt-navy">
          Схожі статті
        </h2>
      </Reveal>
      <StaggerGrid className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {related.map((post) => (
          <StaggerItem key={post.slug}>
            <Link href={routes.blogPost(post.slug)} className="block h-full">
              <PremiumCard className="flex h-full flex-col">
                <h3 className="text-dt-h3 font-dt-heading font-semibold text-dt-navy">
                  {post.title}
                </h3>
                <div className="mt-auto pt-4">
                  <PremiumButton asChild variant="ghost" className="px-0">
                    <span>Читати</span>
                  </PremiumButton>
                </div>
              </PremiumCard>
            </Link>
          </StaggerItem>
        ))}
      </StaggerGrid>
    </section>
  );
}
