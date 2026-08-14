import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Badge,
  Button,
  DataTable,
  DataTableColumnHeader,
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyMedia,
  EmptyTitle,
  Skeleton,
  Spinner,
  Tabs,
  TabsList,
  TabsTrigger,
} from '@repo/ui';
import type { ColumnDef } from '@tanstack/react-table';
import { Trash2Icon } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

import type { BlogPost } from './use-blog-posts';
import { useBlogPosts, useDeleteBlogPost } from './use-blog-posts';

function DeleteBlogPostAction({ blogPost }: { blogPost: BlogPost }) {
  const [open, setOpen] = useState(false);
  const deleteBlogPost = useDeleteBlogPost();

  async function handleConfirm() {
    try {
      await deleteBlogPost.mutateAsync(blogPost.id);
      toast.success('Post deleted.');
      setOpen(false);
    } catch {
      toast.error("Couldn't delete this post. Try again.");
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Delete post"
        disabled={deleteBlogPost.isPending}
        onClick={(event) => {
          event.stopPropagation();
          setOpen(true);
        }}
      >
        {deleteBlogPost.isPending ? <Spinner /> : <Trash2Icon />}
      </Button>
      <AlertDialogContent onClick={(event) => event.stopPropagation()}>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this post?</AlertDialogTitle>
          <AlertDialogDescription>
            This can&apos;t be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteBlogPost.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={deleteBlogPost.isPending}
            onClick={(event) => {
              event.preventDefault();
              void handleConfirm();
            }}
          >
            {deleteBlogPost.isPending ? <Spinner /> : null}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function buildColumns(
  onRowClick: (blogPost: BlogPost) => void,
): ColumnDef<BlogPost>[] {
  return [
    {
      accessorKey: 'title',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Title" />
      ),
      cell: ({ row }) => (
        <button
          type="button"
          className="max-w-[280px] truncate text-left underline-offset-2 hover:underline"
          title={row.original.title}
          onClick={() => onRowClick(row.original)}
        >
          {row.original.title}
        </button>
      ),
    },
    {
      accessorKey: 'category',
      header: 'Category',
    },
    {
      accessorKey: 'published',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.published ? 'default' : 'outline'}>
          {row.original.published ? 'Published' : 'Draft'}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => <DeleteBlogPostAction blogPost={row.original} />,
    },
  ];
}

export function BlogPostsPage() {
  const navigate = useNavigate();
  const { data, isPending, isError, refetch } = useBlogPosts();

  const columns = buildColumns((blogPost) =>
    navigate(`/content/blog/${blogPost.id}/edit`),
  );

  const isEmpty = !isPending && !isError && (data?.length ?? 0) === 0;

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1>Blog Posts</h1>
        <Button onClick={() => navigate('/content/blog/new')}>
          New Post
        </Button>
      </div>

      <Tabs value="blog">
        <TabsList>
          <TabsTrigger value="blog" onClick={() => navigate('/content/blog')}>
            Blog Posts
          </TabsTrigger>
          <TabsTrigger
            value="pricing"
            onClick={() => navigate('/content/pricing')}
          >
            Pricing Plans
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {isPending ? (
        <div className="grid gap-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-10 w-full" />
          ))}
        </div>
      ) : isError ? (
        <Empty>
          <EmptyTitle>Couldn&apos;t load posts.</EmptyTitle>
          <EmptyDescription>
            Something went wrong loading this data.
          </EmptyDescription>
          <EmptyContent>
            <Button variant="outline" onClick={() => refetch()}>
              Retry
            </Button>
          </EmptyContent>
        </Empty>
      ) : isEmpty ? (
        <Empty>
          <EmptyMedia />
          <EmptyTitle>No blog posts yet</EmptyTitle>
          <EmptyDescription>
            Create your first post to publish it on the site.
          </EmptyDescription>
          <EmptyContent>
            <Button onClick={() => navigate('/content/blog/new')}>
              New Post
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <DataTable columns={columns} data={data ?? []} />
      )}
    </div>
  );
}
