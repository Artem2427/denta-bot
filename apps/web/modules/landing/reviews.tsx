'use client';

import { CaretLeftIcon, CaretRightIcon, StarIcon } from '@phosphor-icons/react/ssr';
import useEmblaCarousel from 'embla-carousel-react';
import { useTranslations } from 'next-intl';
import * as React from 'react';

import { Container } from '@/shared/components/container';
import { PremiumCard } from '@/shared/components/premium-card';
import { Reveal } from '@/shared/components/reveal';
import { Section } from '@/shared/components/section';
import { SectionHeading } from '@/shared/components/section-heading';

type ReviewItem = {
  text: string;
  initials: string;
  name: string;
  clinic: string;
};

// TODO: mock data for now (reviews namespace, messages/*.json) — swap for
// real per-clinic reviews once that data source exists.
function Stars(): React.JSX.Element {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <StarIcon
          key={i}
          weight="fill"
          className="h-4 w-4 text-yellow-400"
        />
      ))}
    </div>
  );
}

export function Reviews(): React.JSX.Element {
  const t = useTranslations('reviews');
  const items = t.raw('items') as ReviewItem[];
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'start',
  });
  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(false);

  const onSelect = React.useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  React.useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  return (
    <Section>
      <Container>
        <Reveal>
          <div className="mb-dt-48 flex items-center justify-between gap-6">
            <SectionHeading title={t('title')} className="mb-0" />
            <div className="hidden gap-2 sm:flex">
              <button
                type="button"
                aria-label={t('prevLabel')}
                onClick={() => emblaApi?.scrollPrev()}
                disabled={!canScrollPrev}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--dt-border)] text-dt-navy transition-colors hover:bg-dt-navy/5 disabled:opacity-30"
              >
                <CaretLeftIcon weight="bold" className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label={t('nextLabel')}
                onClick={() => emblaApi?.scrollNext()}
                disabled={!canScrollNext}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--dt-border)] text-dt-navy transition-colors hover:bg-dt-navy/5 disabled:opacity-30"
              >
                <CaretRightIcon weight="bold" className="h-4 w-4" />
              </button>
            </div>
          </div>
        </Reveal>
      </Container>

      {/* Full-bleed sibling of Container: no max-width cap, so the carousel
          spans the full section width while the heading+nav row above stays
          capped at --dt-container-max. px-4 lg:px-8 matches Container's own
          horizontal padding so the first card still lines up under the
          heading. Vertical clearance for the hover shadow is genuinely
          additive (pt-6/pb-16 on the track, no negative margin anywhere to
          cancel it) — it can't be silently eaten by Section's own fluid
          clamp padding regardless of viewport width. Asymmetric because
          every shadow layer has a positive/downward Y-offset: --shadow-dt-card
          reaches ~36px down / ~12px up, --shadow-dt-hover reaches ~52px down
          / ~12px up — pt-6 (24px) comfortably covers the upward bleed while
          pb-16 (64px) gives the downward bleed a genuine, non-borrowed
          margin. */}
      <div className="overflow-hidden px-4 lg:px-8" ref={emblaRef}>
        <div className="-ml-6 flex pt-6 pb-16">
          {items.map((item) => (
            <div
              key={item.name}
              className="min-w-0 flex-[0_0_100%] pl-6 sm:flex-[0_0_50%] lg:flex-[0_0_33.3333%]"
            >
              <PremiumCard className="h-full">
                <Stars />
                <p className="mt-4 text-dt-graphite italic">{item.text}</p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-dt-navy/10 font-dt-heading font-semibold text-dt-navy">
                    {item.initials}
                  </div>
                  <div>
                    <div className="font-dt-heading font-semibold text-dt-navy">
                      {item.name}
                    </div>
                    <div className="text-sm text-dt-graphite">
                      {item.clinic}
                    </div>
                  </div>
                </div>
              </PremiumCard>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
