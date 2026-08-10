import { Container } from '@/shared/components/container';
import { Reveal } from '@/shared/components/reveal';
import { Check } from '@phosphor-icons/react/ssr';

function CheckCell(): React.JSX.Element {
  return <Check weight="regular" className="mx-auto h-5 w-5 text-dt-teal" />;
}

function DashCell(): React.JSX.Element {
  return <span className="text-dt-graphite">—</span>;
}

export function ComparisonTable(): React.JSX.Element {
  return (
    <section className="bg-dt-navy/5 py-8 lg:py-12">
      <Container>
        <Reveal>
          <h2 className="mb-12 text-center text-dt-h2 font-dt-heading font-bold text-dt-navy">
            Детальне порівняння планів
          </h2>
        </Reveal>
        <div className="overflow-x-auto">
          <table className="mx-auto w-full max-w-5xl">
            <thead>
              <tr className="border-b border-dt-navy/10">
                <th className="py-4 text-left text-dt-navy">Функція</th>
                <th className="py-4 text-center text-dt-navy">Старт</th>
                <th className="py-4 text-center text-dt-navy">Бізнес</th>
                <th className="py-4 text-center text-dt-navy">Клініка</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-dt-navy/10">
                <td className="py-4 text-dt-navy">Записи на місяць</td>
                <td className="py-4 text-center text-dt-navy">100</td>
                <td className="py-4 text-center text-dt-navy">500</td>
                <td className="py-4 text-center text-dt-navy">Необмежено</td>
              </tr>
              <tr className="border-b border-dt-navy/10">
                <td className="py-4 text-dt-navy">Кількість лікарів</td>
                <td className="py-4 text-center text-dt-navy">1</td>
                <td className="py-4 text-center text-dt-navy">5</td>
                <td className="py-4 text-center text-dt-navy">Необмежено</td>
              </tr>
              <tr className="border-b border-dt-navy/10">
                <td className="py-4 text-dt-navy">Telegram бот</td>
                <td className="py-4 text-center">
                  <CheckCell />
                </td>
                <td className="py-4 text-center">
                  <CheckCell />
                </td>
                <td className="py-4 text-center">
                  <CheckCell />
                </td>
              </tr>
              <tr className="border-b border-dt-navy/10">
                <td className="py-4 text-dt-navy">Автонагадування</td>
                <td className="py-4 text-center">
                  <CheckCell />
                </td>
                <td className="py-4 text-center">
                  <CheckCell />
                </td>
                <td className="py-4 text-center">
                  <CheckCell />
                </td>
              </tr>
              <tr className="border-b border-dt-navy/10">
                <td className="py-4 text-dt-navy">Базова аналітика</td>
                <td className="py-4 text-center">
                  <CheckCell />
                </td>
                <td className="py-4 text-center">
                  <DashCell />
                </td>
                <td className="py-4 text-center">
                  <DashCell />
                </td>
              </tr>
              <tr className="border-b border-dt-navy/10">
                <td className="py-4 text-dt-navy">Розширена аналітика</td>
                <td className="py-4 text-center">
                  <DashCell />
                </td>
                <td className="py-4 text-center">
                  <CheckCell />
                </td>
                <td className="py-4 text-center">
                  <CheckCell />
                </td>
              </tr>
              <tr className="border-b border-dt-navy/10">
                <td className="py-4 text-dt-navy">Повна аналітика</td>
                <td className="py-4 text-center">
                  <DashCell />
                </td>
                <td className="py-4 text-center">
                  <DashCell />
                </td>
                <td className="py-4 text-center">
                  <CheckCell />
                </td>
              </tr>
              <tr className="border-b border-dt-navy/10">
                <td className="py-4 text-dt-navy">Збір відгуків</td>
                <td className="py-4 text-center">
                  <DashCell />
                </td>
                <td className="py-4 text-center">
                  <CheckCell />
                </td>
                <td className="py-4 text-center">
                  <CheckCell />
                </td>
              </tr>
              <tr className="border-b border-dt-navy/10">
                <td className="py-4 text-dt-navy">Інтеграції</td>
                <td className="py-4 text-center">
                  <DashCell />
                </td>
                <td className="py-4 text-center">
                  <CheckCell />
                </td>
                <td className="py-4 text-center">
                  <CheckCell />
                </td>
              </tr>
              <tr className="border-b border-dt-navy/10">
                <td className="py-4 text-dt-navy">API доступ</td>
                <td className="py-4 text-center">
                  <DashCell />
                </td>
                <td className="py-4 text-center">
                  <DashCell />
                </td>
                <td className="py-4 text-center">
                  <CheckCell />
                </td>
              </tr>
              <tr className="border-b border-dt-navy/10">
                <td className="py-4 text-dt-navy">Декілька локацій</td>
                <td className="py-4 text-center">
                  <DashCell />
                </td>
                <td className="py-4 text-center">
                  <DashCell />
                </td>
                <td className="py-4 text-center">
                  <CheckCell />
                </td>
              </tr>
              <tr className="border-b border-dt-navy/10">
                <td className="py-4 text-dt-navy">Email підтримка</td>
                <td className="py-4 text-center">
                  <CheckCell />
                </td>
                <td className="py-4 text-center">
                  <CheckCell />
                </td>
                <td className="py-4 text-center">
                  <CheckCell />
                </td>
              </tr>
              <tr className="border-b border-dt-navy/10">
                <td className="py-4 text-dt-navy">Пріоритетна підтримка</td>
                <td className="py-4 text-center">
                  <DashCell />
                </td>
                <td className="py-4 text-center">
                  <CheckCell />
                </td>
                <td className="py-4 text-center">
                  <CheckCell />
                </td>
              </tr>
              <tr className="border-b border-dt-navy/10">
                <td className="py-4 text-dt-navy">Персональний менеджер</td>
                <td className="py-4 text-center">
                  <DashCell />
                </td>
                <td className="py-4 text-center">
                  <DashCell />
                </td>
                <td className="py-4 text-center">
                  <CheckCell />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Container>
    </section>
  );
}
