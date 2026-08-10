'use client';

import { Clock, MagnifyingGlass } from '@phosphor-icons/react/ssr';
import Image from 'next/image';
import Link from 'next/link';
import * as React from 'react';

import { StaggerGrid, StaggerItem } from '@/modules/home/stagger-grid';
import { PremiumBadge } from '@/shared/components/premium-badge';
import { PremiumButton } from '@/shared/components/premium-button';
import { PremiumCard } from '@/shared/components/premium-card';
import { PremiumInput } from '@/shared/components/premium-input';
import { routes } from '@/shared/lib/routes';

import { posts } from './_data';

const categories = ['Всі', 'Автоматизація', 'Маркетинг', 'Управління клінікою'];

export function BlogFilters(): React.JSX.Element {
  const [search, setSearch] = React.useState('');
  const [activeCategory, setActiveCategory] = React.useState('Всі');

  const filtered = posts.filter((post) => {
    const matchesCategory =
      activeCategory === 'Всі' || post.category === activeCategory;
    const query = search.trim().toLowerCase();
    const matchesSearch =
      query === '' ||
      post.title.toLowerCase().includes(query) ||
      post.excerpt.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  return (
    <div>
      <div className="mx-auto mb-12 max-w-2xl space-y-6">
        <div className="relative">
          <MagnifyingGlass
            weight="regular"
            className="pointer-events-none absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-dt-graphite/50"
          />
          <PremiumInput
            type="text"
            placeholder="Пошук статей..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          {categories.map((category) => (
            <PremiumButton
              key={category}
              type="button"
              variant={category === activeCategory ? 'coral' : 'outline'}
              size="sm"
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </PremiumButton>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="py-16 text-center text-dt-body text-dt-graphite">
          За вашим запитом нічого не знайдено
        </p>
      ) : (
        <StaggerGrid className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((post) => (
            <StaggerItem key={post.slug}>
              <Link href={routes.blogPost(post.slug)} className="block h-full">
                <PremiumCard className="flex h-full flex-col p-0">
                  <div className="relative h-48 w-full overflow-hidden rounded-t-dt-card">
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-3 left-3">
                      <PremiumBadge variant="teal">{post.category}</PremiumBadge>
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <div className="mb-2 flex items-center gap-2 text-sm text-dt-graphite">
                      <span>{post.date}</span>
                      <span>•</span>
                      <Clock weight="regular" className="h-4 w-4" />
                      <span>{post.readTime}</span>
                    </div>
                    <h3 className="text-dt-h3 font-dt-heading font-semibold text-dt-navy">
                      {post.title}
                    </h3>
                    <p className="mt-2 flex-1 text-dt-graphite">{post.excerpt}</p>
                    <div className="mt-4">
                      <PremiumButton asChild variant="ghost" className="px-0">
                        <span>Читати →</span>
                      </PremiumButton>
                    </div>
                  </div>
                </PremiumCard>
              </Link>
            </StaggerItem>
          ))}
        </StaggerGrid>
      )}
    </div>
  );
}
