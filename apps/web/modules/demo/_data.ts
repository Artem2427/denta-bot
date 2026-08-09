export const scenarios = [
  {
    label: 'Записатись на прийом',
    messages: [
      { type: 'user' as const, text: 'Хочу записатись' },
      { type: 'bot' as const, text: 'Чудово! Оберіть зручну дату:' },
      {
        type: 'bot' as const,
        text: '📅 8 березня (Сб)\n📅 10 березня (Пн)\n📅 11 березня (Вт)',
      },
      { type: 'user' as const, text: '10 березня' },
      {
        type: 'bot' as const,
        text: 'Оберіть час:\n⏰ 10:00\n⏰ 14:00\n⏰ 16:30',
      },
      { type: 'user' as const, text: '14:00' },
      {
        type: 'bot' as const,
        text: 'Оберіть лікаря:\n👨‍⚕️ Доктор Іваненко Петро\n👩‍⚕️ Доктор Коваль Олена',
      },
      { type: 'user' as const, text: 'Доктор Коваль Олена' },
      {
        type: 'bot' as const,
        text: '✅ Готово! Ви записані на 10 березня о 14:00 до лікаря Коваль Олена.\n\nНадішлю нагадування за день до прийому.',
      },
    ],
  },
  {
    label: 'Перенести запис',
    messages: [
      { type: 'user' as const, text: 'Хочу перенести запис' },
      { type: 'bot' as const, text: 'Зараз у вас запис на 10 березня о 14:00' },
      {
        type: 'bot' as const,
        text: 'Оберіть нову дату:\n📅 11 березня (Вт)\n📅 12 березня (Ср)\n📅 13 березня (Чт)',
      },
      { type: 'user' as const, text: '11 березня' },
      {
        type: 'bot' as const,
        text: 'Оберіть час:\n⏰ 11:00\n⏰ 15:00\n⏰ 17:00',
      },
      { type: 'user' as const, text: '15:00' },
      {
        type: 'bot' as const,
        text: '✅ Запис перенесено! Нова дата: 11 березня о 15:00',
      },
    ],
  },
  {
    label: 'Скасувати запис',
    messages: [
      { type: 'user' as const, text: 'Потрібно скасувати запис' },
      {
        type: 'bot' as const,
        text: 'Ваш запис: 10 березня о 14:00 до лікаря Коваль Олена',
      },
      { type: 'bot' as const, text: 'Ви впевнені що хочете скасувати?' },
      { type: 'user' as const, text: 'Так, скасувати' },
      {
        type: 'bot' as const,
        text: '✅ Запис скасовано. Сподіваємось побачити вас іншого разу!',
      },
    ],
  },
];

export type ChatScenario = (typeof scenarios)[number];
export type ChatScenarioMessage = ChatScenario['messages'][number];

export const appointments = [
  {
    id: 1,
    patient: 'Іваненко Марія',
    doctor: 'Доктор Коваль О.',
    date: '10 березня',
    time: '14:00',
    status: 'confirmed' as const,
  },
  {
    id: 2,
    patient: 'Петренко Олександр',
    doctor: 'Доктор Іваненко П.',
    date: '10 березня',
    time: '15:30',
    status: 'confirmed' as const,
  },
  {
    id: 3,
    patient: 'Сидоренко Анна',
    doctor: 'Доктор Коваль О.',
    date: '11 березня',
    time: '10:00',
    status: 'pending' as const,
  },
  {
    id: 4,
    patient: 'Мельник Ігор',
    doctor: 'Доктор Іваненко П.',
    date: '11 березня',
    time: '11:30',
    status: 'confirmed' as const,
  },
  {
    id: 5,
    patient: 'Коваленко Ольга',
    doctor: 'Доктор Коваль О.',
    date: '12 березня',
    time: '09:00',
    status: 'confirmed' as const,
  },
];

export type Appointment = (typeof appointments)[number];

export const doctors = [
  {
    name: 'Іваненко Петро Сергійович',
    specialty: 'Терапевт-стоматолог',
    experience: '12 років досвіду',
    schedule: 'Пн, Ср, Пт: 9:00 - 18:00',
    avatar: '👨‍⚕️',
  },
  {
    name: 'Коваль Олена Михайлівна',
    specialty: 'Хірург-стоматолог',
    experience: '8 років досвіду',
    schedule: 'Вт, Чт, Сб: 10:00 - 19:00',
    avatar: '👩‍⚕️',
  },
  {
    name: 'Сидоренко Андрій Васильович',
    specialty: 'Ортодонт',
    experience: '15 років досвіду',
    schedule: 'Пн-Пт: 10:00 - 17:00',
    avatar: '👨‍⚕️',
  },
];

export type Doctor = (typeof doctors)[number];

const dashboardStatLabels = [
  'Записів сьогодні',
  'Записів цього тижня',
  'Активних пацієнтів',
  'Завантаженість',
];
const dashboardStatValues: (number | string)[] = [12, 47, 156, '85%'];

export const dashboardStats = dashboardStatLabels.map((label, index) => ({
  label,
  value: dashboardStatValues[index] as number | string,
}));

export type DashboardStat = (typeof dashboardStats)[number];

const barChartValues = [42, 38, 45, 50, 47, 40, 35];
const barChartDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];

export const barChartData = barChartValues.map((value, index) => ({
  day: barChartDays[index] as string,
  value,
}));

export type BarChartEntry = (typeof barChartData)[number];
