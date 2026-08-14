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

import { PricingPlanFormDialog } from './pricing-plan-form-dialog';
import type { PricingPlan } from './use-pricing-plans';
import { useDeletePricingPlan, usePricingPlans } from './use-pricing-plans';

function DeletePricingPlanAction({ plan }: { plan: PricingPlan }) {
  const [open, setOpen] = useState(false);
  const deletePricingPlan = useDeletePricingPlan();

  async function handleConfirm() {
    try {
      await deletePricingPlan.mutateAsync(plan.id);
      toast.success('Plan deleted.');
      setOpen(false);
    } catch {
      toast.error("Couldn't delete this plan. Try again.");
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Delete plan"
        disabled={deletePricingPlan.isPending}
        onClick={(event) => {
          event.stopPropagation();
          setOpen(true);
        }}
      >
        {deletePricingPlan.isPending ? <Spinner /> : <Trash2Icon />}
      </Button>
      <AlertDialogContent onClick={(event) => event.stopPropagation()}>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this plan?</AlertDialogTitle>
          <AlertDialogDescription>
            This can&apos;t be undone. It will no longer appear on the Prices
            page.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deletePricingPlan.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={deletePricingPlan.isPending}
            onClick={(event) => {
              event.preventDefault();
              void handleConfirm();
            }}
          >
            {deletePricingPlan.isPending ? <Spinner /> : null}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function buildColumns(
  onRowClick: (plan: PricingPlan) => void,
): ColumnDef<PricingPlan>[] {
  return [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => (
        <button
          type="button"
          className="max-w-[220px] truncate text-left underline-offset-2 hover:underline"
          title={row.original.name}
          onClick={() => onRowClick(row.original)}
        >
          {row.original.name}
        </button>
      ),
    },
    {
      accessorKey: 'monthlyPrice',
      header: 'Monthly price',
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
      accessorKey: 'isPopular',
      header: 'Popular',
      cell: ({ row }) =>
        row.original.isPopular ? <Badge variant="secondary">Popular</Badge> : null,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => <DeletePricingPlanAction plan={row.original} />,
    },
  ];
}

export function PricingPlansPage() {
  const navigate = useNavigate();
  const { data, isPending, isError, refetch } = usePricingPlans();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string | undefined>(
    undefined,
  );

  function openCreateDialog() {
    setEditingPlanId(undefined);
    setDialogOpen(true);
  }

  function openEditDialog(plan: PricingPlan) {
    setEditingPlanId(plan.id);
    setDialogOpen(true);
  }

  const columns = buildColumns(openEditDialog);

  const isEmpty = !isPending && !isError && (data?.length ?? 0) === 0;

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1>Pricing Plans</h1>
        <Button onClick={openCreateDialog}>New Plan</Button>
      </div>

      <Tabs value="pricing">
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
          <EmptyTitle>Couldn&apos;t load pricing plans.</EmptyTitle>
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
          <EmptyTitle>No pricing plans yet</EmptyTitle>
          <EmptyDescription>
            Add a plan to make it available on the Prices page.
          </EmptyDescription>
          <EmptyContent>
            <Button onClick={openCreateDialog}>New Plan</Button>
          </EmptyContent>
        </Empty>
      ) : (
        <DataTable columns={columns} data={data ?? []} />
      )}

      <PricingPlanFormDialog
        planId={editingPlanId}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}
