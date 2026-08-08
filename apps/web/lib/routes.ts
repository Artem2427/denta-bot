export const routes = {
  home: '/',
  prices: '/prices',
  demo: '/demo',
  blog: '/blog',
  blogPost: (slug: string) => `/blog/${slug}`,
  contacts: '/contacts',
  about: '/about',
  privacy: '/privacy',
} as const;
