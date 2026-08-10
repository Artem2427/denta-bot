import { ArrowLeft, Clock, ShareNetwork } from '@phosphor-icons/react/ssr';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import * as React from 'react';

import { getPostBySlug } from '@/modules/blog/_data';
import { PostBody } from '@/modules/blog/post-body';
import { RelatedPosts } from '@/modules/blog/related-posts';
import { Container } from '@/shared/components/container';
import { PremiumBadge } from '@/shared/components/premium-badge';
import { PremiumButton } from '@/shared/components/premium-button';
import { routes } from '@/shared/lib/routes';

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<React.JSX.Element> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen pb-16 pt-24 lg:pt-32">
      <Container>
        <div className="mx-auto max-w-4xl">
          <PremiumButton asChild variant="ghost" className="mb-8 px-0">
            <Link href={routes.blog}>
              <ArrowLeft weight="regular" className="mr-2 h-5 w-5" />
              Назад до блогу
            </Link>
          </PremiumButton>

          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <PremiumBadge variant="teal">{post.category}</PremiumBadge>
              <h1 className="mt-4 text-dt-h1 font-dt-heading font-bold text-dt-navy">
                {post.title}
              </h1>
              <div className="mt-4 flex items-center gap-2 text-sm text-dt-graphite">
                <span>{post.date}</span>
                <span>•</span>
                <Clock weight="regular" className="h-4 w-4" />
                <span>{post.readTime}</span>
              </div>
            </div>
            <PremiumButton
              variant="ghost"
              size="icon"
              aria-label="Поділитися"
            >
              <ShareNetwork weight="regular" className="h-5 w-5" />
            </PremiumButton>
          </div>

          <div className="relative mb-12 aspect-video w-full overflow-hidden rounded-dt-card">
            <Image
              src={post.image}
              alt={post.title}
              fill
              className="object-cover"
            />
          </div>

          <PostBody blocks={post.body} />

          <div className="mb-16 rounded-dt-card bg-dt-navy p-8 text-center text-dt-warm-white lg:p-12">
            <h3 className="text-dt-h3 font-dt-heading font-bold">
              Хочете автоматизувати запис у вашій клініці?
            </h3>
            <p className="mt-2 text-dt-warm-white/80">
              Спробуйте DentaBot безкоштовно протягом 14 днів
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
              <PremiumButton asChild variant="coral" size="lg">
                <Link href={routes.demo}>Спробувати демо</Link>
              </PremiumButton>
              <PremiumButton
                asChild
                variant="outline"
                size="lg"
                className="border-dt-warm-white text-dt-warm-white hover:bg-dt-warm-white/10"
              >
                <Link href={routes.contacts}>Зв&apos;язатись з нами</Link>
              </PremiumButton>
            </div>
          </div>

          <RelatedPosts excludeSlug={post.slug} />
        </div>
      </Container>
    </div>
  );
}
