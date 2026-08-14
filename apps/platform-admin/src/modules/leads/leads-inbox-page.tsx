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
import { format } from 'date-fns';
import { useState } from 'react';
import { useNavigate } from 'react-router';

import { DateRangePicker } from './date-range-picker';
import type { Lead, LeadSource, LeadStatus } from './use-leads';
import { useLeads } from './use-leads';

const STATUS_OPTIONS: { value: LeadStatus; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'converted', label: 'Converted' },
];

const STATUS_BADGE_VARIANT: Record<
  LeadStatus,
  'default' | 'secondary' | 'outline'
> = {
  new: 'default',
  contacted: 'secondary',
  converted: 'outline',
};

const SOURCE_LABEL: Record<LeadSource, string> = {
  contacts: 'Contacts',
  demo: 'Demo',
};

function buildColumns(onRowClick: (lead: Lead) => void): ColumnDef<Lead>[] {
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
      accessorKey: 'source',
      header: 'Source',
      cell: ({ row }) => (
        <Badge variant="secondary">{SOURCE_LABEL[row.original.source]}</Badge>
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
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created" />
      ),
      cell: ({ row }) =>
        format(new Date(row.original.createdAt), "MMM d, yyyy 'at' h:mm a"),
    },
  ];
}

export function LeadsInboxPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<LeadStatus | undefined>(undefined);
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});

  const from = dateRange.from ? dateRange.from.toISOString() : undefined;
  const to = dateRange.to ? dateRange.to.toISOString() : undefined;

  const { data, isPending, isError, refetch } = useLeads(status, from, to);

  const columns = buildColumns((lead) => navigate(`/leads/${lead.id}`));

  const hasFilters = status !== undefined || Boolean(from) || Boolean(to);
  const isEmpty = !isPending && !isError && (data?.length ?? 0) === 0;

  function clearFilters() {
    setStatus(undefined);
    setDateRange({});
  }

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1>Lead Inbox</h1>
      </div>

      <div className="flex items-center gap-2">
        <Select
          value={status ?? 'all'}
          onValueChange={(value) =>
            setStatus(value === 'all' ? undefined : (value as LeadStatus))
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

        <DateRangePicker
          from={dateRange.from}
          to={dateRange.to}
          onChange={setDateRange}
        />
      </div>

      {isPending ? (
        <div className="grid gap-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-10 w-full" />
          ))}
        </div>
      ) : isError ? (
        <Empty>
          <EmptyTitle>Couldn&apos;t load leads.</EmptyTitle>
          <EmptyDescription>
            Something went wrong loading this data.
          </EmptyDescription>
          <EmptyContent>
            <Button variant="outline" onClick={() => refetch()}>
              Retry
            </Button>
          </EmptyContent>
        </Empty>
      ) : isEmpty && !hasFilters ? (
        <Empty>
          <EmptyMedia />
          <EmptyTitle>No leads yet</EmptyTitle>
          <EmptyDescription>
            Leads from Contacts and Demo submissions on the website will
            appear here.
          </EmptyDescription>
        </Empty>
      ) : isEmpty && hasFilters ? (
        <Empty>
          <EmptyTitle>No leads match these filters</EmptyTitle>
          <EmptyDescription>
            Try adjusting the status or date range.{' '}
            <button type="button" className="underline" onClick={clearFilters}>
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
