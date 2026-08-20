'use client';

import { Container } from '@/shared/components/container';
import { PremiumButton } from '@/shared/components/premium-button';
import { PremiumCard } from '@/shared/components/premium-card';
import { PremiumInput } from '@/shared/components/premium-input';
import { PremiumTextarea } from '@/shared/components/premium-textarea';
import { Section } from '@/shared/components/section';
import { SectionHeading } from '@/shared/components/section-heading';
import { getClientApiUrl } from '@/shared/lib/api-url';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle } from '@phosphor-icons/react/ssr';
import { useTranslations } from 'next-intl';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CONTACT_PHONE_REGEX = /^\+?[0-9\s\-()]{7,20}$/;

// Schema factory: same field set/rules as the existing Contacts form
// (name/clinic/contact/message), but with every zod error message sourced
// from `t` so validation feedback is translated too, not just labels (D-06).
function createLeadSchema(t: ReturnType<typeof useTranslations>) {
  return z.object({
    name: z.string().trim().min(2, t('nameError')),
    clinic: z.string().trim().optional(),
    contact: z
      .string()
      .trim()
      .min(1, t('contactRequiredError'))
      .refine(
        (value) => CONTACT_PHONE_REGEX.test(value) || EMAIL_REGEX.test(value),
        { message: t('contactInvalidError') },
      ),
    message: z.string().trim().optional(),
  });
}

type LeadFormValues = z.infer<ReturnType<typeof createLeadSchema>>;

// Single conversion form for the entire landing page (D-07: the interactive
// admin-showcase simulation already gives visitors a "try it" experience, so
// there is no separate demo-lead-form modal wired in anywhere else). The
// POST body/endpoint/source tag are IDENTICAL to modules/contacts/contact-form.tsx
// — `source: 'contacts'` is D-06's explicit requirement and stays literal
// even though this section visually sits near the demo showcase.
export function LeadSection(): React.JSX.Element {
  const t = useTranslations('lead');
  const guarantees = t.raw('guarantees') as string[];
  const schema = React.useMemo(() => createLeadSchema(t), [t]);

  const form = useForm<LeadFormValues>({
    resolver: zodResolver(schema),
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
        toast.error(t('toastRateLimited'));
        return;
      }

      if (!res.ok) {
        toast.error(t('toastGenericError'));
        return;
      }

      setIsSubmitted(true);
      toast.success(t('toastSuccess'));
    } catch {
      toast.error(t('toastGenericError'));
    }
  });

  return (
    <Section id="lead" className="scroll-mt-16 lg:scroll-mt-20" tone="navy">
      <Container>
        <div className="grid items-start gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading
              eyebrow={t('eyebrow')}
              title={t('title')}
              description={t('description')}
              tone="navy"
              className="mb-0"
            />
            <ul className="mt-8 space-y-4">
              {guarantees.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-dt-teal/20 text-dt-teal">
                    <CheckCircle weight="fill" className="h-4 w-4" />
                  </span>
                  <span className="leading-[1.45] text-dt-warm-white/90">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <PremiumCard>
            {!isSubmitted ? (
              <>
                <h3 className="text-dt-h3 font-dt-heading font-semibold text-dt-navy">
                  {t('formTitle')}
                </h3>
                <form onSubmit={onSubmit} className="mt-6 space-y-6">
                  <div className="space-y-2">
                    <label
                      htmlFor="lead-name"
                      className="text-sm font-medium text-dt-navy"
                    >
                      {t('nameLabel')}
                    </label>
                    <PremiumInput
                      id="lead-name"
                      placeholder={t('namePlaceholder')}
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
                      htmlFor="lead-clinic"
                      className="text-sm font-medium text-dt-navy"
                    >
                      {t('clinicLabel')}
                    </label>
                    <PremiumInput
                      id="lead-clinic"
                      placeholder={t('clinicPlaceholder')}
                      {...form.register('clinic')}
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="lead-contact"
                      className="text-sm font-medium text-dt-navy"
                    >
                      {t('contactLabel')}
                    </label>
                    <PremiumInput
                      id="lead-contact"
                      placeholder={t('contactPlaceholder')}
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
                      htmlFor="lead-message"
                      className="text-sm font-medium text-dt-navy"
                    >
                      {t('messageLabel')}
                    </label>
                    <PremiumTextarea
                      id="lead-message"
                      placeholder={t('messagePlaceholder')}
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
                      ? t('submittingLabel')
                      : t('submitLabel')}
                  </PremiumButton>
                  <p className="text-center text-xs text-dt-graphite">
                    {t('consentNote')}
                  </p>
                </form>
              </>
            ) : (
              <div className="py-12 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-dt-teal/10">
                  <CheckCircle weight="fill" className="h-8 w-8 text-dt-teal" />
                </div>
                <h3 className="text-dt-h3 font-dt-heading font-bold text-dt-navy">
                  {t('thanksTitle')}
                </h3>
                <p className="mb-6 text-dt-graphite">{t('thanksBody')}</p>
                <PremiumButton
                  variant="outline"
                  onClick={() => {
                    setIsSubmitted(false);
                    form.reset();
                  }}
                >
                  {t('submitLabel')}
                </PremiumButton>
              </div>
            )}
          </PremiumCard>
        </div>
      </Container>
    </Section>
  );
}
