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
  // The real API's BlogPostResponseDto.body is Record<string, unknown> — its
  // runtime shape is not guaranteed to be PostBodyBlock[] (CreateBlogPostDto
  // validates body with @IsObject(), which rejects arrays). Callers must
  // guard with Array.isArray() before treating it as blocks.
  body: unknown;
};
