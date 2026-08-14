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
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  Spinner,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@repo/ui';
import { format } from 'date-fns';
import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { toast } from 'sonner';

import type { LeadStatus } from './use-leads';
import {
  ApiError,
  useConvertLead,
  useLead,
  useUpdateLeadStatus,
} from './use-leads';

const SOURCE_LABEL: Record<string, string> = {
  contacts: 'Contacts',
  demo: 'Demo',
};

const STATUS_OPTIONS: { value: LeadStatus; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'converted', label: 'Converted' },
];

export function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: lead, isPending, isError, refetch } = useLead(id ?? '');
  const updateStatus = useUpdateLeadStatus();
  const convertLead = useConvertLead();

  const [convertDialogOpen, setConvertDialogOpen] = useState(false);
  const [convertError, setConvertError] = useState<string | null>(null);

  if (isPending) {
    return (
      <div className="grid gap-4 max-w-2xl">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isError || !lead) {
    return (
      <Empty>
        <EmptyTitle>Couldn&apos;t load this lead.</EmptyTitle>
        <EmptyDescription>
          Something went wrong loading this data.
        </EmptyDescription>
        <EmptyContent>
          <Button variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  const hasEmail = Boolean(lead.email);

  function openConvertDialog() {
    if (!hasEmail) return;
    setConvertError(null);
    setConvertDialogOpen(true);
  }

  function handleStatusChange(value: string) {
    if (!lead) return;
    const nextStatus = value as LeadStatus;
    if (nextStatus === 'converted') {
      openConvertDialog();
      return;
    }
    updateStatus.mutate(
      { id: lead.id, status: nextStatus },
      {
        onSuccess: () => toast.success('Status updated.'),
        onError: () => toast.error("Couldn't save your changes. Try again."),
      },
    );
  }

  async function handleConfirmConvert() {
    if (!lead) return;
    setConvertError(null);
    try {
      await convertLead.mutateAsync(lead.id);
      setConvertDialogOpen(false);
      toast.success('Lead converted to a clinic.');
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        setConvertError('A clinic with this email already exists.');
        return;
      }
      toast.error("Couldn't save your changes. Try again.");
    }
  }

  const traceLine = lead.updatedBy?.email
    ? `Last updated by ${lead.updatedBy.email} on ${format(
        new Date(lead.updatedAt),
        "MMM d, yyyy 'at' h:mm a",
      )}`
    : 'Not yet updated';

  return (
    <TooltipProvider>
      <div className="grid gap-6 max-w-2xl">
        <div className="flex items-center gap-2">
          <div>
            <h1>{lead.name}</h1>
            <p className="text-sm text-muted-foreground">{traceLine}</p>
          </div>
          <Badge variant="secondary">{SOURCE_LABEL[lead.source]}</Badge>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-1">
              <span className="text-sm font-medium">Clinic name</span>
              <span className="text-sm text-muted-foreground">
                {lead.clinicName ?? 'Not provided'}
              </span>
            </div>
            <div className="grid gap-1">
              <span className="text-sm font-medium">Email</span>
              <span className="text-sm text-muted-foreground">
                {lead.email ?? 'Not provided'}
              </span>
            </div>
            <div className="grid gap-1">
              <span className="text-sm font-medium">Phone</span>
              <span className="text-sm text-muted-foreground">
                {lead.phone ?? 'Not provided'}
              </span>
            </div>
            <div className="grid gap-1">
              <span className="text-sm font-medium">Message</span>
              <span className="w-full whitespace-pre-wrap text-sm text-muted-foreground">
                {lead.message ?? 'Not provided'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex items-center gap-2">
              <Select
                value={lead.status}
                onValueChange={handleStatusChange}
                disabled={updateStatus.isPending}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      disabled={option.value === 'converted' && !hasEmail}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {updateStatus.isPending ? <Spinner /> : null}

              {hasEmail ? (
                <Button variant="outline" onClick={openConvertDialog}>
                  Convert to Clinic
                </Button>
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>
                      <Button variant="outline" disabled>
                        Convert to Clinic
                      </Button>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    Add an email to this lead before converting
                  </TooltipContent>
                </Tooltip>
              )}
            </div>

            {lead.status === 'converted' && lead.clinicId ? (
              <p className="text-sm text-muted-foreground">
                Converted to{' '}
                <Link to={`/clinics/${lead.clinicId}`} className="underline">
                  this clinic
                </Link>
                .
              </p>
            ) : null}
          </CardContent>
        </Card>

        <AlertDialog
          open={convertDialogOpen}
          onOpenChange={(open) => {
            if (convertLead.isPending) return;
            setConvertDialogOpen(open);
            if (!open) setConvertError(null);
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Convert this lead to a clinic?
              </AlertDialogTitle>
              <AlertDialogDescription>
                This creates a new Clinic account from the lead&apos;s
                details.
              </AlertDialogDescription>
            </AlertDialogHeader>
            {convertError ? (
              <p className="text-sm text-destructive">{convertError}</p>
            ) : null}
            <AlertDialogFooter>
              <AlertDialogCancel disabled={convertLead.isPending}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                disabled={convertLead.isPending}
                onClick={(event) => {
                  event.preventDefault();
                  void handleConfirmConvert();
                }}
              >
                {convertLead.isPending ? <Spinner /> : null}
                Convert
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}
