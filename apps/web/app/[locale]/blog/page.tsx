import { Link } from '@/i18n/navigation';
import { BlogFilters } from '@/modules/blog/blog-filters';
import type { Post } from '@/modules/blog/types';
import { Container } from '@/shared/components/container';
import { PremiumBadge } from '@/shared/components/premium-badge';
import { PremiumButton } from '@/shared/components/premium-button';
import { PremiumCard } from '@/shared/components/premium-card';
import { Reveal } from '@/shared/components/reveal';
import { Section } from '@/shared/components/section';
import { getServerApiUrl } from '@/shared/lib/api-url';
import { routes } from '@/shared/lib/routes';
import { Clock } from '@phosphor-icons/react/ssr';
import Image from 'next/image';
import * as React from 'react';

export default async function Blog(): Promise<React.JSX.Element> {
  const res = await fetch(`${getServerApiUrl()}/public/blog-posts`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch blog posts: ${res.status}`);
  }
  const posts = (await res.json()) as Post[];

  if (posts.length === 0) {
    return (
      <div className="min-h-screen pb-16 pt-24 lg:pt-32">
        <section>
          <Container>
            <div className="mx-auto max-w-2xl py-16 text-center">
              <h1 className="text-[clamp(2.25rem,6vw+1rem,4rem)] leading-[1.15] font-dt-heading font-bold text-dt-navy">
                Матеріалів поки немає
              </h1>
              <p className="mt-4 text-[1rem] leading-[1.5] text-dt-graphite">
                Ми вже готуємо перші статті. Загляньте трохи пізніше.
              </p>
            </div>
          </Container>
        </section>
      </div>
    );
  }

  const featuredPost = posts[0]!;
  const remainingPosts = posts.slice(1);

  return (
    <div className="min-h-screen pb-16 pt-24 lg:pt-32">
      <Section className="pb-12">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-[clamp(2.25rem,6vw+1rem,4rem)] leading-[1.15] font-dt-heading font-bold text-dt-navy">
              Корисні матеріали для стоматологій
            </h1>
            <p className="mt-4 text-[1rem] leading-[1.5] text-dt-graphite">
              Поради, дослідження та практичні кейси про автоматизацію запису
              пацієнтів.
            </p>
          </div>
        </Container>
      </Section>

      <Section className="pb-12">
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
                  <h2 className="text-[clamp(1.9rem,3.4vw,2.75rem)] leading-[1.1] tracking-[-0.03em] font-dt-heading font-bold text-dt-navy">
                    {featuredPost.title}
                  </h2>
                  <p className="mt-4 text-dt-graphite">
                    {featuredPost.excerpt}
                  </p>
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
      </Section>

      {remainingPosts.length > 0 ? (
        <Section className="pb-12">
          <Container>
            <BlogFilters posts={remainingPosts} />
          </Container>
        </Section>
      ) : null}
    </div>
  );
}
