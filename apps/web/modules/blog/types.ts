export type PostBodyBlock =
  | { kind: 'paragraph'; text: string }
  | { kind: 'heading'; text: string }
  | { kind: 'list'; items: string[] }
  | { kind: 'quote'; text: string; author?: string };

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  image: string;
  // The real API's BlogPostResponseDto.body is Record<string, unknown> —
  // CreateBlogPostDto validates it with @IsObject(), which rejects raw
  // arrays, so admin-authored content is always a JSON *object*. The
  // supported shape is { blocks: PostBodyBlock[] } (a raw array is also
  // accepted for forward/backward compatibility, e.g. pre-seeded content).
  // Callers must use extractPostBodyBlocks() below rather than assuming
  // either shape directly.
  body: unknown;
};

// Normalizes BlogPost.body into a renderable block array. Handles both the
// documented { blocks: [...] } object shape (what CreateBlogPostDto's
// @IsObject() validation actually allows staff to author) and a raw
// PostBodyBlock[] array (accepted for forward/backward compatibility).
// Anything else (empty object, malformed content) safely renders as no body
// rather than throwing.
export function extractPostBodyBlocks(body: unknown): PostBodyBlock[] {
  if (Array.isArray(body)) {
    return body as PostBodyBlock[];
  }
  if (
    body &&
    typeof body === 'object' &&
    Array.isArray((body as { blocks?: unknown }).blocks)
  ) {
    return (body as { blocks: PostBodyBlock[] }).blocks;
  }
  return [];
}
