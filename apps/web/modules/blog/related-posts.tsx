import Link from 'next/link';
import * as React from 'react';

import { StaggerGrid, StaggerItem } from '@/modules/home/stagger-grid';
import { PremiumButton } from '@/shared/components/premium-button';
import { PremiumCard } from '@/shared/components/premium-card';
import { Reveal } from '@/shared/components/reveal';
import { Section } from '@/shared/components/section';
import { SectionHeading } from '@/shared/components/section-heading';
import { routes } from '@/shared/lib/routes';

import type { Post } from './types';

export function RelatedPosts({
  allPosts,
  excludeSlug,
}: {
  allPosts: Post[];
  excludeSlug: string;
}): React.JSX.Element {
  const related = allPosts
    .filter((post) => post.slug !== excludeSlug)
    .slice(0, 3);

  return (
    <Section>
      <Reveal>
        <SectionHeading title="Схожі статті" />
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
    </Section>
  );
}
