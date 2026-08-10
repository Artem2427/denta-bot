import { Clock } from '@phosphor-icons/react/ssr';
import Image from 'next/image';
import Link from 'next/link';
import * as React from 'react';

import { featuredPost } from '@/modules/blog/_data';
import { BlogFilters } from '@/modules/blog/blog-filters';
import { Container } from '@/shared/components/container';
import { PremiumBadge } from '@/shared/components/premium-badge';
import { PremiumButton } from '@/shared/components/premium-button';
import { PremiumCard } from '@/shared/components/premium-card';
import { Reveal } from '@/shared/components/reveal';
import { routes } from '@/shared/lib/routes';

export default function Blog(): React.JSX.Element {
  return (
    <div className="min-h-screen pb-16 pt-24 lg:pt-32">
      <section className="pb-12">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-dt-h1 font-dt-heading font-bold text-dt-navy">
              Корисні матеріали для стоматологій
            </h1>
            <p className="mt-4 text-dt-body text-dt-graphite">
              Поради, дослідження та практичні кейси про автоматизацію запису
              пацієнтів.
            </p>
          </div>
        </Container>
      </section>

      <section className="pb-12">
        <Container>
          <Reveal>
            <Link href={routes.blogPost(featuredPost.slug)} className="block">
              <PremiumCard className="grid gap-0 overflow-hidden p-0 lg:grid-cols-2">
                <div className="relative h-64 w-full lg:h-full">
                  <Image
                    src={featuredPost.image}
                    alt={featuredPost.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <PremiumBadge variant="teal">
                      {featuredPost.category}
                    </PremiumBadge>
                  </div>
                </div>
                <div className="flex flex-col justify-center p-8">
                  <div className="mb-4 flex items-center gap-2 text-sm text-dt-graphite">
                    <span>{featuredPost.date}</span>
                    <span>•</span>
                    <Clock weight="regular" className="h-4 w-4" />
                    <span>{featuredPost.readTime}</span>
                  </div>
                  <h2 className="text-dt-h2 font-dt-heading font-bold text-dt-navy">
                    {featuredPost.title}
                  </h2>
                  <p className="mt-4 text-dt-graphite">{featuredPost.excerpt}</p>
                  <div className="mt-6">
                    <PremiumButton asChild variant="coral">
                      <span>Читати статтю →</span>
                    </PremiumButton>
                  </div>
                </div>
              </PremiumCard>
            </Link>
          </Reveal>
        </Container>
      </section>

      <section className="pb-12">
        <Container>
          <BlogFilters />
        </Container>
      </section>

      <section>
        <Container>
          <div className="text-center">
            <PremiumButton variant="outline" size="lg">
              Завантажити ще
            </PremiumButton>
          </div>
        </Container>
      </section>
    </div>
  );
}
