'use client';

import { Stat } from '@/shared/components/stat';
import { useCountUp } from '@/shared/hooks/use-count-up';

type HeroStat = { value: string; label: string };

/** The only numerically-animatable stat ("−70%" — animates the 70). The
 * other two ("24/7", "1 день"/"1 day") are not meaningfully animatable
 * counts and render as static Stat values. */
function AnimatedFirstStat({ label }: { label: string }): React.JSX.Element {
  const count = useCountUp(70, 1800);

  return <Stat value={`−${count}%`} label={label} />;
}

export function HeroStats({
  stats,
}: {
  stats: HeroStat[];
}): React.JSX.Element {
  return (
    <div className="grid grid-cols-3 gap-4 pt-8">
      {stats.map((stat, index) =>
        index === 0 ? (
          <AnimatedFirstStat key={stat.label} label={stat.label} />
        ) : (
          <Stat key={stat.label} value={stat.value} label={stat.label} />
        ),
      )}
    </div>
  );
}
