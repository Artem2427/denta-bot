import * as React from 'react';

import type { PostBodyBlock } from './_data';

export function PostBody({
  blocks,
}: {
  blocks: PostBodyBlock[];
}): React.JSX.Element {
  return (
    <article className="prose prose-lg mb-12 max-w-none">
      {blocks.map((block, index) => {
        switch (block.kind) {
          case 'paragraph':
            return (
              <p
                key={index}
                className={
                  index === 0
                    ? 'mb-6 text-xl leading-relaxed text-dt-graphite'
                    : undefined
                }
              >
                {block.text}
              </p>
            );
          case 'heading':
            return (
              <h2
                key={index}
                className="mt-12 mb-4 text-3xl font-bold text-dt-navy"
              >
                {block.text}
              </h2>
            );
          case 'list':
            return (
              <ul key={index}>
                {block.items.map((item, itemIndex) => (
                  <li key={itemIndex}>{item}</li>
                ))}
              </ul>
            );
          case 'quote':
            return (
              <blockquote
                key={index}
                className="my-8 border-l-4 border-dt-teal pl-6 italic"
              >
                {block.text}
                {block.author ? (
                  <footer className="mt-2 text-sm not-italic">
                    — {block.author}
                  </footer>
                ) : null}
              </blockquote>
            );
          default:
            return null;
        }
      })}
    </article>
  );
}
