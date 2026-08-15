'use client';

import { PremiumButton } from '@/shared/components/premium-button';
import { PremiumCard } from '@/shared/components/premium-card';
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

const contactFormSchema = z.object({
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

export type ContactFormValues = z.infer<typeof contactFormSchema>;

export function ContactForm(): React.JSX.Element {
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
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
          source: 'contacts',
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

  return (
    <PremiumCard>
      {!isSubmitted ? (
        <>
          <h2 className="text-dt-h3 font-dt-heading font-semibold text-dt-navy">
            Залишити заявку
          </h2>
          <p className="text-dt-graphite">
            Заповніть форму і ми зв&apos;яжемося з вами найближчим часом
          </p>
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="text-sm font-medium text-dt-navy"
              >
                Ім&apos;я *
              </label>
              <PremiumInput
                id="name"
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
                htmlFor="clinic"
                className="text-sm font-medium text-dt-navy"
              >
                Назва клініки
              </label>
              <PremiumInput
                id="clinic"
                placeholder="Назва вашої клініки"
                {...form.register('clinic')}
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="contact"
                className="text-sm font-medium text-dt-navy"
              >
                Телефон або email *
              </label>
              <PremiumInput
                id="contact"
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
                htmlFor="message"
                className="text-sm font-medium text-dt-navy"
              >
                Повідомлення
              </label>
              <PremiumTextarea
                id="message"
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
              {form.formState.isSubmitting
                ? 'Надсилаємо…'
                : 'Надіслати заявку'}
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
          <PremiumButton
            variant="outline"
            onClick={() => {
              setIsSubmitted(false);
              form.reset();
            }}
          >
            Надіслати ще одну заявку
          </PremiumButton>
        </div>
      )}
    </PremiumCard>
  );
}
