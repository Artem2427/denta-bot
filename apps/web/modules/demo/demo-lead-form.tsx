'use client';

import { PremiumButton } from '@/shared/components/premium-button';
import { PremiumDialogTitle } from '@/shared/components/premium-dialog';
import { PremiumInput } from '@/shared/components/premium-input';
import { PremiumTextarea } from '@/shared/components/premium-textarea';
import { getClientApiUrl } from '@/shared/lib/api-url';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle } from '@phosphor-icons/react';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Same fields/schema as apps/web/modules/contacts/contact-form.tsx (D-11) —
// duplicated (~60 lines) rather than shared for two call sites, per
// 06-CONTEXT.md's "Claude's Discretion" note.
const demoLeadFormSchema = z.object({
  name: z.string().trim().min(2, "Ім'я має містити щонайменше 2 символи"),
  clinic: z.string().trim().optional(),
  contact: z
    .string()
    .trim()
    .min(1, 'Вкажіть телефон або email')
    .refine(
      (value) =>
        /^\+?[0-9\s\-()]{7,20}$/.test(value) ||
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      { message: 'Введіть коректний номер телефону або email' },
    ),
  message: z.string().trim().optional(),
});

export type DemoLeadFormValues = z.infer<typeof demoLeadFormSchema>;

export function DemoLeadForm(): React.JSX.Element {
  const form = useForm<DemoLeadFormValues>({
    resolver: zodResolver(demoLeadFormSchema),
    defaultValues: { name: '', clinic: '', contact: '', message: '' },
  });
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const isEmail = EMAIL_REGEX.test(values.contact);
      const res = await fetch(`${getClientApiUrl()}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: values.name,
          clinicName: values.clinic || undefined,
          [isEmail ? 'email' : 'phone']: values.contact,
          message: values.message || undefined,
          source: 'demo',
        }),
      });

      if (res.status === 429) {
        toast.error('Забагато спроб. Зачекайте хвилину і спробуйте ще раз.');
        return;
      }

      if (!res.ok) {
        toast.error('Не вдалося надіслати заявку. Спробуйте ще раз.');
        return;
      }

      setIsSubmitted(true);
      toast.success('Заявку успішно надіслано!');
    } catch {
      toast.error('Не вдалося надіслати заявку. Спробуйте ще раз.');
    }
  });

  return !isSubmitted ? (
    <>
      <PremiumDialogTitle>Замовити демо</PremiumDialogTitle>
      <p className="text-dt-graphite">
        Заповніть форму і ми зв&apos;яжемося з вами найближчим часом
      </p>
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="demo-name" className="text-sm font-medium text-dt-navy">
            Ім&apos;я *
          </label>
          <PremiumInput
            id="demo-name"
            placeholder="Ваше ім'я"
            {...form.register('name')}
          />
          {form.formState.errors.name?.message ? (
            <p className="text-sm text-dt-coral">
              {form.formState.errors.name.message}
            </p>
          ) : null}
        </div>
        <div className="space-y-2">
          <label
            htmlFor="demo-clinic"
            className="text-sm font-medium text-dt-navy"
          >
            Назва клініки
          </label>
          <PremiumInput
            id="demo-clinic"
            placeholder="Назва вашої клініки"
            {...form.register('clinic')}
          />
        </div>
        <div className="space-y-2">
          <label
            htmlFor="demo-contact"
            className="text-sm font-medium text-dt-navy"
          >
            Телефон або email *
          </label>
          <PremiumInput
            id="demo-contact"
            placeholder="+380 XX XXX XX XX або email@example.com"
            {...form.register('contact')}
          />
          {form.formState.errors.contact?.message ? (
            <p className="text-sm text-dt-coral">
              {form.formState.errors.contact.message}
            </p>
          ) : null}
        </div>
        <div className="space-y-2">
          <label
            htmlFor="demo-message"
            className="text-sm font-medium text-dt-navy"
          >
            Повідомлення
          </label>
          <PremiumTextarea
            id="demo-message"
            placeholder="Розкажіть про ваші потреби..."
            rows={4}
            {...form.register('message')}
          />
        </div>
        <PremiumButton
          type="submit"
          variant="coral"
          size="lg"
          className="w-full"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? 'Надсилаємо…' : 'Надіслати заявку'}
        </PremiumButton>
      </form>
    </>
  ) : (
    <div className="py-12 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-dt-teal/10">
        <CheckCircle weight="fill" className="h-8 w-8 text-dt-teal" />
      </div>
      <h3 className="text-dt-h3 font-dt-heading font-bold text-dt-navy">
        Дякуємо!
      </h3>
      <p className="mb-6 text-dt-graphite">
        Ваша заявка успішно надіслана. Ми зв&apos;яжемося з вами найближчим
        часом.
      </p>
    </div>
  );
}
