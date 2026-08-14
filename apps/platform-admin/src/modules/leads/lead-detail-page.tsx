import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Skeleton,
} from '@repo/ui';
import { format } from 'date-fns';
import { useParams } from 'react-router';

import { useLead } from './use-leads';

const SOURCE_LABEL: Record<string, string> = {
  contacts: 'Contacts',
  demo: 'Demo',
};

export function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: lead, isPending } = useLead(id ?? '');

  if (isPending || !lead) {
    return (
      <div className="grid gap-4 max-w-2xl">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const traceLine = lead.updatedBy?.email
    ? `Last updated by ${lead.updatedBy.email} on ${format(
        new Date(lead.updatedAt),
        "MMM d, yyyy 'at' h:mm a",
      )}`
    : 'Not yet updated';

  return (
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
    </div>
  );
}
