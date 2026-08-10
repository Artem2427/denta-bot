import {
  PremiumAccordion,
  PremiumAccordionContent,
  PremiumAccordionItem,
  PremiumAccordionTrigger,
} from '@/shared/components/premium-accordion';

const faqs = [
  {
    question: 'Чи є безкоштовний пробний період?',
    answer:
      'Так, ми надаємо 14 днів безкоштовного тестування всіх функцій плану Бізнес. Кредитна картка не потрібна.',
  },
  {
    question: 'Як я можу скасувати підписку?',
    answer:
      'Ви можете скасувати підписку в будь-який момент в особистому кабінеті. Доступ до функцій збережеться до кінця оплаченого періоду.',
  },
  {
    question: 'Які методи оплати ви приймаєте?',
    answer:
      'Ми приймаємо оплату банківськими картками Visa/Mastercard, а також банківський переказ для юридичних осіб.',
  },
  {
    question: 'Чи можу я змінити тариф пізніше?',
    answer:
      'Так, ви можете підвищити або знизити тариф в будь-який момент. При підвищенні тарифу різниця буде розрахована пропорційно.',
  },
  {
    question: 'Чи включена технічна підтримка?',
    answer:
      'Так, всі плани включають технічну підтримку. План Бізнес та Клініка отримують пріоритетну підтримку з швидшим часом відповіді.',
  },
  {
    question: 'Що станеться якщо я перевищу ліміт записів?',
    answer:
      'Ми завчасно повідомимо вас про наближення до ліміту. Ви зможете оновити план або оплатити додаткові записи за потреби.',
  },
  {
    question: 'Чи потрібен технічний спеціаліст для налаштування?',
    answer:
      'Ні, налаштування інтуїтивне і займає до 1 години. Ми також надаємо відео інструкції та допомогу нашої команди.',
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
