import { getTranslations } from 'next-intl/server';

// Server Component (getTranslations): purely presentational, no
// interactivity — the scroll animation is a plain CSS keyframe, so no
// 'use client' boundary is needed.
export async function ChannelMarquee(): Promise<React.JSX.Element> {
  const t = await getTranslations('marquee');
  const channels = t.raw('channels') as string[];
  // Render the list twice back-to-back so the -50% translateX loop is seamless.
  const track = [...channels, ...channels];

  return (
    <div className="overflow-hidden border-t border-b border-[var(--dt-border)] bg-dt-warm-white py-4">
      <style>{`
        @keyframes dt-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
      <div
        className="flex w-max gap-14"
        style={{ animation: 'dt-marquee 32s linear infinite' }}
      >
        {track.map((channel, index) => (
          <span
            key={`${channel}-${index}`}
            className="font-dt-mono text-xs whitespace-nowrap text-dt-graphite/50 uppercase tracking-wide"
          >
            {channel}
          </span>
        ))}
      </div>
    </div>
  );
}
