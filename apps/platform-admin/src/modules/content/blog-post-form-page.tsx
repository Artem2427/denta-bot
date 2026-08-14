import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Card,
  CardContent,
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyTitle,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Skeleton,
  Spinner,
  Switch,
  Textarea,
} from '@repo/ui';
import { format } from 'date-fns';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';
import { z } from 'zod';

import {
  ApiError,
  useBlogPost,
  useCreateBlogPost,
  useUpdateBlogPost,
} from './use-blog-posts';

// The `body` field is edited/previewed as raw JSON text only — it is NEVER
// injected into the DOM as raw/executed HTML or otherwise interpreted as
// markup anywhere in this admin UI (T-05-07-01). Real sanitized end-user
// rendering is Phase 6's concern on apps/web.
const blogPostFormSchema = z.object({
  slug: z.string().trim().min(1, 'Slug is required.'),
  title: z.string().trim().min(1, 'Title is required.'),
  excerpt: z.string().trim().min(1, 'Excerpt is required.'),
  category: z.string().trim().min(1, 'Category is required.'),
  date: z.string().trim().min(1, 'Date is required.'),
  readTime: z.string().trim().min(1, 'Read time is required.'),
  image: z.string().trim().min(1, 'Image is required.'),
  body: z.string().refine((value) => {
    try {
      JSON.parse(value);
      return true;
    } catch {
      return false;
    }
  }, 'Body must be valid JSON.'),
  published: z.boolean(),
});

type BlogPostFormValues = z.infer<typeof blogPostFormSchema>;

const EMPTY_DEFAULTS: BlogPostFormValues = {
  slug: '',
  title: '',
  excerpt: '',
  category: '',
  date: '',
  readTime: '',
  image: '',
  body: '{}',
  published: false,
};

export function BlogPostFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const {
    data: blogPost,
    isPending: isLoadingBlogPost,
    isError: isBlogPostError,
    refetch: refetchBlogPost,
  } = useBlogPost(id ?? '');
  const createBlogPost = useCreateBlogPost();
  const updateBlogPost = useUpdateBlogPost();

  const form = useForm<BlogPostFormValues>({
    resolver: zodResolver(blogPostFormSchema),
    defaultValues: EMPTY_DEFAULTS,
  });

  useEffect(() => {
    if (blogPost) {
      form.reset({
        slug: blogPost.slug,
        title: blogPost.title,
        excerpt: blogPost.excerpt,
        category: blogPost.category,
        date: blogPost.date,
        readTime: blogPost.readTime,
        image: blogPost.image,
        body: JSON.stringify(blogPost.body, null, 2),
        published: blogPost.published,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blogPost]);

  const isSaving = createBlogPost.isPending || updateBlogPost.isPending;

  const onSubmit = form.handleSubmit(async (values) => {
    const body = {
      slug: values.slug,
      title: values.title,
      excerpt: values.excerpt,
      category: values.category,
      date: values.date,
      readTime: values.readTime,
      image: values.image,
      // Parsed back into an object immediately before submit — never
      // rendered as HTML client-side, only sent as the DTO's Json field.
      body: JSON.parse(values.body) as Record<string, unknown>,
      published: values.published,
    };

    try {
      if (isEditMode && id) {
        await updateBlogPost.mutateAsync({ id, body });
        toast.success('Post updated.');
      } else {
        await createBlogPost.mutateAsync(body);
        toast.success('Post created.');
      }
      navigate('/content/blog');
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        form.setError('slug', {
          message: 'A blog post with this slug already exists.',
        });
        return;
      }
      toast.error("Couldn't save your changes. Try again.");
    }
  });

  if (isEditMode && isLoadingBlogPost) {
    return (
      <div className="grid gap-4 max-w-2xl">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (isEditMode && (isBlogPostError || !blogPost)) {
    return (
      <Empty>
        <EmptyTitle>Couldn&apos;t load this post.</EmptyTitle>
        <EmptyDescription>
          Something went wrong loading this data.
        </EmptyDescription>
        <EmptyContent>
          <Button variant="outline" onClick={() => refetchBlogPost()}>
            Retry
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  const traceLine =
    isEditMode && blogPost
      ? blogPost.updatedBy?.email
        ? `Last updated by ${blogPost.updatedBy.email} on ${format(
            new Date(blogPost.updatedAt),
            "MMM d, yyyy 'at' h:mm a",
          )}`
        : 'Not yet updated'
      : null;

  return (
    <div className="grid gap-6 max-w-2xl">
      <div>
        <h1>{isEditMode ? 'Edit Post' : 'New Post'}</h1>
        {traceLine ? (
          <p className="text-sm text-muted-foreground">{traceLine}</p>
        ) : null}
      </div>

      <Card>
        <CardContent>
          <Form {...form}>
            <form onSubmit={onSubmit} className="grid gap-4">
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="excerpt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Excerpt</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="readTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Read time</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="body"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Body (JSON)</FormLabel>
                    <FormControl>
                      <Textarea rows={12} className="font-mono" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="published"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center gap-2">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="!mt-0">Published</FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? <Spinner /> : null}
                  {isEditMode ? 'Save Changes' : 'Create Post'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
