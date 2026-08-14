import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Trash2Icon } from 'lucide-react';
import { useEffect } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import {
  ApiError,
  useCreatePricingPlan,
  usePricingPlan,
  useUpdatePricingPlan,
} from './use-pricing-plans';

// Mirrors CreatePricingPlanDto's class-validator rules field-for-field.
// `features` is represented internally as `{ value: string }[]` since
// react-hook-form's useFieldArray requires array items to be objects —
// mapped to/from a plain string[] at the DTO boundary. Zero features
// allowed, no minimum enforced (UI Considerations: zero-one-many).
const pricingPlanFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required.'),
  monthlyPrice: z.string().trim().min(1, 'Monthly price is required.'),
  yearlyPrice: z.string().trim().min(1, 'Yearly price is required.'),
  description: z.string().trim().min(1, 'Description is required.'),
  features: z.array(z.object({ value: z.string() })),
  isPopular: z.boolean(),
  published: z.boolean(),
});

type PricingPlanFormValues = z.infer<typeof pricingPlanFormSchema>;

const EMPTY_DEFAULTS: PricingPlanFormValues = {
  name: '',
  monthlyPrice: '',
  yearlyPrice: '',
  description: '',
  features: [],
  isPopular: false,
  published: false,
};

export function PricingPlanFormDialog({
  planId,
  open,
  onOpenChange,
}: {
  planId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const isEditMode = Boolean(planId);
  const {
    data: plan,
    isPending: isLoadingPlan,
    isError: isPlanError,
    refetch: refetchPlan,
  } = usePricingPlan(planId ?? '');
  const createPricingPlan = useCreatePricingPlan();
  const updatePricingPlan = useUpdatePricingPlan();

  const form = useForm<PricingPlanFormValues>({
    resolver: zodResolver(pricingPlanFormSchema),
    defaultValues: EMPTY_DEFAULTS,
  });

  const featureFields = useFieldArray({
    control: form.control,
    name: 'features',
  });

  useEffect(() => {
    if (!open) return;
    if (isEditMode && plan) {
      form.reset({
        name: plan.name,
        monthlyPrice: plan.monthlyPrice,
        yearlyPrice: plan.yearlyPrice,
        description: plan.description,
        features: plan.features.map((value) => ({ value })),
        isPopular: plan.isPopular,
        published: plan.published,
      });
    } else if (!isEditMode) {
      form.reset(EMPTY_DEFAULTS);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isEditMode, plan]);

  const isSaving = createPricingPlan.isPending || updatePricingPlan.isPending;

  const onSubmit = form.handleSubmit(async (values) => {
    const body = {
      name: values.name,
      monthlyPrice: values.monthlyPrice,
      yearlyPrice: values.yearlyPrice,
      description: values.description,
      features: values.features.map((feature) => feature.value),
      isPopular: values.isPopular,
      published: values.published,
    };

    try {
      if (isEditMode && planId) {
        await updatePricingPlan.mutateAsync({ id: planId, body });
        toast.success('Plan updated.');
      } else {
        await createPricingPlan.mutateAsync(body);
        toast.success('Plan created.');
      }
      onOpenChange(false);
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        toast.error('A plan with these details already exists.');
        return;
      }
      toast.error("Couldn't save your changes. Try again.");
    }
  });

  const traceLine =
    isEditMode && plan
      ? plan.updatedBy?.email
        ? `Last updated by ${plan.updatedBy.email} on ${format(
            new Date(plan.updatedAt),
            "MMM d, yyyy 'at' h:mm a",
          )}`
        : 'Not yet updated'
      : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Plan' : 'Add Plan'}</DialogTitle>
        </DialogHeader>

        {isEditMode && isLoadingPlan ? (
          <div className="grid gap-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : isEditMode && (isPlanError || !plan) ? (
          <Empty>
            <EmptyTitle>Couldn&apos;t load this plan.</EmptyTitle>
            <EmptyDescription>
              Something went wrong loading this data.
            </EmptyDescription>
            <EmptyContent>
              <Button variant="outline" onClick={() => refetchPlan()}>
                Retry
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          <Form {...form}>
            <form onSubmit={onSubmit} className="grid gap-4">
              {traceLine ? (
                <p className="text-sm text-muted-foreground">{traceLine}</p>
              ) : null}
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
                name="monthlyPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monthly price</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="yearlyPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Yearly price</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-2">
                <FormLabel>Features</FormLabel>
                {featureFields.fields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-2">
                    <FormField
                      control={form.control}
                      name={`features.${index}.value`}
                      render={({ field: inputField }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input {...inputField} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Remove feature"
                      onClick={() => featureFields.remove(index)}
                    >
                      <Trash2Icon />
                    </Button>
                  </div>
                ))}
                <div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => featureFields.append({ value: '' })}
                  >
                    Add feature
                  </Button>
                </div>
              </div>

              <FormField
                control={form.control}
                name="isPopular"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center gap-2">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="!mt-0">Popular</FormLabel>
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

              <DialogFooter>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? <Spinner /> : null}
                  {isEditMode ? 'Save Changes' : 'Add Plan'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
