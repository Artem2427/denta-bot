import {
  PremiumAccordion,
  PremiumAccordionContent,
  PremiumAccordionItem,
  PremiumAccordionTrigger,
} from '@/shared/components/premium-accordion';

const faqs = [
  {
    question: 'Скільки коштує підключення?',
    answer:
      'Підключення безкоштовне. Ви платите тільки за обраний тарифний план. Перші 14 днів — безкоштовний пробний період.',
  },
  {
    question: 'Чи складно налаштувати систему?',
    answer:
      'Налаштування дуже просте і займає близько години. Ми надаємо відео інструкції та особисту підтримку на кожному етапі.',
  },
  {
    question: 'Чи потрібен технічний спеціаліст?',
    answer:
      "Ні, система розроблена для зручності звичайних користувачів. Якщо виникнуть питання — наша підтримка завжди на зв'язку.",
  },
  {
    question: 'Як швидко можна почати користуватись?',
    answer:
      'Після реєстрації ви можете налаштувати бота за 1 день та одразу почати приймати записи від пацієнтів.',
  },
  {
    question: 'Чи безпечна система?',
    answer:
      'Так, ми використовуємо сучасні методи шифрування даних та відповідаємо всім стандартам безпеки медичних даних.',
  },
  {
    question: 'Які гарантії якості?',
    answer:
      'Ми надаємо 14 днів безкоштовного тестування. Якщо система вам не підійде — ви можете скасувати в будь-який момент.',
  },
  {
    question: 'Чи можна інтегрувати з існуючою системою?',
    answer:
      "Так, ми маємо API та інтеграції з популярними CRM системами. Зв'яжіться з нами для деталей.",
  },
  {
    question: 'Які методи оплати доступні?',
    answer:
      'Ми приймаємо оплату картками Visa/Mastercard онлайн, а також банківський переказ для юридичних осіб.',
  },
];

export function FaqAccordion(): React.JSX.Element {
  return (
    <PremiumAccordion type="single" collapsible className="space-y-4">
      {faqs.map((faq, index) => (
        <PremiumAccordionItem key={index} value={`item-${index}`}>
          <PremiumAccordionTrigger>{faq.question}</PremiumAccordionTrigger>
          <PremiumAccordionContent>{faq.answer}</PremiumAccordionContent>
        </PremiumAccordionItem>
      ))}
    </PremiumAccordion>
  );
}
