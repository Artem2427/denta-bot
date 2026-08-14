import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  Spinner,
} from '@repo/ui';
import { format } from 'date-fns';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router';
import { toast } from 'sonner';
import { z } from 'zod';

import type { UpdateClinicInput } from './use-clinics';
import { ApiError, useClinic, useUpdateClinic } from './use-clinics';

const clinicEditSchema = z.object({
  name: z.string().trim().min(1, 'Name is required.'),
  email: z.string().trim().email('Enter a valid email address.'),
  phone: z.string().trim().optional().or(z.literal('')),
  plan: z.string().trim().min(1, 'Plan is required.'),
  status: z.enum(['trial', 'active', 'suspended', 'cancelled']),
});

type ClinicEditValues = z.infer<typeof clinicEditSchema>;

export function ClinicDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: clinic, isPending } = useClinic(id ?? '');
  const updateClinic = useUpdateClinic();

  const form = useForm<ClinicEditValues>({
    resolver: zodResolver(clinicEditSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      plan: '',
      status: 'trial',
    },
  });

  useEffect(() => {
    if (clinic) {
      form.reset({
        name: clinic.name,
        email: clinic.email,
        phone: clinic.phone ?? '',
        plan: clinic.plan,
        status: clinic.status,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clinic]);

  const onSubmit = form.handleSubmit(async (values) => {
    if (!id) return;

    // CLINIC-04 partial-update semantics: only send fields the admin
    // actually changed, derived from react-hook-form's dirtyFields.
    const dirtyFields = form.formState.dirtyFields;
    const body: UpdateClinicInput = {};
    if (dirtyFields.name) body.name = values.name;
    if (dirtyFields.email) body.email = values.email;
    if (dirtyFields.phone) body.phone = values.phone;
    if (dirtyFields.plan) body.plan = values.plan;
    if (dirtyFields.status) body.status = values.status;

    if (Object.keys(body).length === 0) {
      return;
    }

    try {
      await updateClinic.mutateAsync({ id, body });
      toast.success('Clinic updated.');
      form.reset(values);
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        form.setError('email', {
          message: 'A clinic with this email already exists.',
        });
        return;
      }
      toast.error("Couldn't save your changes. Try again.");
    }
  });

  if (isPending || !clinic) {
    return (
      <div className="grid gap-4 max-w-2xl">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const traceLine = clinic.updatedBy?.email
    ? `Last updated by ${clinic.updatedBy.email} on ${format(
        new Date(clinic.updatedAt),
        "MMM d, yyyy 'at' h:mm a",
      )}`
    : 'Not yet updated';

  return (
    <div className="grid gap-6 max-w-2xl">
      <div>
        <h1>{clinic.name}</h1>
        <p className="text-sm text-muted-foreground">{traceLine}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={onSubmit} className="grid gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="plan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plan</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="trial">Trial</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div>
                <Button
                  type="submit"
                  disabled={
                    updateClinic.isPending || !form.formState.isDirty
                  }
                >
                  {updateClinic.isPending ? <Spinner /> : null}
                  Save Changes
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bot Usage</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm">
          <div>Messages: {clinic.messageCount}</div>
          <div>Bookings: {clinic.bookingsCount}</div>
          <div>
            Last active:{' '}
            {clinic.lastActiveAt
              ? format(new Date(clinic.lastActiveAt), "MMM d, yyyy 'at' h:mm a")
              : 'Never active'}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
