import {
  Badge,
  Button,
  DataTable,
  DataTableColumnHeader,
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyMedia,
  EmptyTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
} from '@repo/ui';
import type { ColumnDef } from '@tanstack/react-table';
import { useState } from 'react';
import { useNavigate } from 'react-router';

import type { Clinic, ClinicStatus } from './use-clinics';
import { useClinics } from './use-clinics';

const STATUS_OPTIONS: { value: ClinicStatus; label: string }[] = [
  { value: 'trial', label: 'Trial' },
  { value: 'active', label: 'Active' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'cancelled', label: 'Cancelled' },
];

const STATUS_BADGE_VARIANT: Record<
  ClinicStatus,
  'outline' | 'default' | 'destructive' | 'secondary'
> = {
  trial: 'outline',
  active: 'default',
  suspended: 'destructive',
  cancelled: 'secondary',
};

function buildColumns(
  onRowClick: (clinic: Clinic) => void,
): ColumnDef<Clinic>[] {
  return [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Clinic" />
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
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => (
        <span
          className="block max-w-[220px] truncate"
          title={row.original.email}
        >
          {row.original.email}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={STATUS_BADGE_VARIANT[row.original.status]}>
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: 'plan',
      header: 'Plan',
    },
  ];
}

export function ClinicsListPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<ClinicStatus | undefined>(undefined);
  const { data, isPending, isError, refetch } = useClinics(status);

  const columns = buildColumns((clinic) => navigate(`/clinics/${clinic.id}`));

  const hasStatusFilter = status !== undefined;
  const isEmpty = !isPending && !isError && (data?.length ?? 0) === 0;

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1>Clinics</h1>
        <Button>Add Clinic</Button>
      </div>

      <div className="flex items-center gap-2">
        <Select
          value={status ?? 'all'}
          onValueChange={(value) =>
            setStatus(value === 'all' ? undefined : (value as ClinicStatus))
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isPending ? (
        <div className="grid gap-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-10 w-full" />
          ))}
        </div>
      ) : isError ? (
        <Empty>
          <EmptyTitle>Couldn&apos;t load clinics.</EmptyTitle>
          <EmptyDescription>
            Something went wrong loading this data.
          </EmptyDescription>
          <EmptyContent>
            <Button variant="outline" onClick={() => refetch()}>
              Retry
            </Button>
          </EmptyContent>
        </Empty>
      ) : isEmpty && !hasStatusFilter ? (
        <Empty>
          <EmptyMedia />
          <EmptyTitle>No clinics yet</EmptyTitle>
          <EmptyDescription>
            Add your first clinic to start tracking accounts.
          </EmptyDescription>
          <EmptyContent>
            <Button>Add Clinic</Button>
          </EmptyContent>
        </Empty>
      ) : isEmpty && hasStatusFilter ? (
        <Empty>
          <EmptyTitle>No clinics match these filters</EmptyTitle>
          <EmptyDescription>
            <button
              type="button"
              className="underline"
              onClick={() => setStatus(undefined)}
            >
              Clear filters
            </button>
          </EmptyDescription>
        </Empty>
      ) : (
        <DataTable columns={columns} data={data ?? []} />
      )}
    </div>
  );
}
