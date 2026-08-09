'use client';

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/ui';
import { Calendar, CheckCircle, Clock, Phone, User, X } from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';
import * as React from 'react';

import { routes } from '@/shared/lib/routes';

import {
  appointments,
  barChartData,
  dashboardStats,
  doctors,
  type DashboardStat,
} from './_data';

type Section = 'dashboard' | 'appointments' | 'doctors' | 'patients' | 'settings';

function useCountUp(target: number, durationMs = 1000): number {
  const [value, setValue] = React.useState(0);

  React.useEffect(() => {
    let rafId: number;
    const startTime = performance.now();

    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      setValue(Math.round(target * progress));

      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      }
    }

    rafId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafId);
  }, [target, durationMs]);

  return value;
}

function DashboardStatCard({ stat }: { stat: DashboardStat }): React.JSX.Element {
  const numericTarget =
    typeof stat.value === 'string' ? parseInt(stat.value, 10) : stat.value;
  const suffix = typeof stat.value === 'string' ? '%' : '';
  const count = useCountUp(numericTarget);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {stat.label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">
          {count}
          {suffix}
        </div>
      </CardContent>
    </Card>
  );
}

function DashboardBarChart(): React.JSX.Element {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    const id = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(id);
  }, []);

  return (
    <div className="flex h-40 items-end gap-2">
      {barChartData.map((entry, index) => (
        <div
          key={entry.day}
          className="flex flex-1 flex-col items-center gap-2"
        >
          <div
            className="w-full rounded-t bg-dt-teal transition-all duration-500"
            style={{
              height: mounted ? `${(entry.value / 50) * 100}%` : '0%',
              transitionDelay: `${index * 80}ms`,
            }}
          />
          <span className="text-xs text-muted-foreground">{entry.day}</span>
        </div>
      ))}
    </div>
  );
}

export function AdminTab(): React.JSX.Element {
  const [selectedSection, setSelectedSection] =
    React.useState<Section>('dashboard');

  return (
    <div className="overflow-hidden rounded-xl border">
      <div className="flex items-center justify-between bg-dt-navy px-6 py-3 text-dt-warm-white">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">Демо режим</Badge>
          <span>Клініка &quot;Посмішка&quot;</span>
        </div>
        <Button variant="secondary" size="sm" asChild>
          <Link href={routes.contacts}>Підключити свою клініку →</Link>
        </Button>
      </div>

      <div className="flex">
        <div className="w-64 space-y-2 border-r p-4">
          <Button
            variant={selectedSection === 'dashboard' ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setSelectedSection('dashboard')}
          >
            📊 Dashboard
          </Button>
          <Button
            variant={selectedSection === 'appointments' ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setSelectedSection('appointments')}
          >
            📅 Записи
          </Button>
          <Button
            variant={selectedSection === 'doctors' ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setSelectedSection('doctors')}
          >
            👨‍⚕️ Лікарі
          </Button>
          <Button
            variant={selectedSection === 'patients' ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setSelectedSection('patients')}
          >
            🧑‍🤝‍🧑 Пацієнти
          </Button>
          <Button
            variant={selectedSection === 'settings' ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setSelectedSection('settings')}
          >
            ⚙️ Налаштування
          </Button>
        </div>

        <div className="flex-1 p-6">
          {selectedSection === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.15 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {dashboardStats.map((stat) => (
                  <DashboardStatCard key={stat.label} stat={stat} />
                ))}
              </div>
              <DashboardBarChart />
            </motion.div>
          )}

          {selectedSection === 'appointments' && (
            <motion.div
              key="appointments"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.15 }}
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <User className="mr-1 inline h-4 w-4" />
                      Пацієнт
                    </TableHead>
                    <TableHead>Лікар</TableHead>
                    <TableHead>
                      <Calendar className="mr-1 inline h-4 w-4" />
                      Дата
                    </TableHead>
                    <TableHead>
                      <Clock className="mr-1 inline h-4 w-4" />
                      Час
                    </TableHead>
                    <TableHead>Статус</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>{row.patient}</TableCell>
                      <TableCell>{row.doctor}</TableCell>
                      <TableCell>{row.date}</TableCell>
                      <TableCell>{row.time}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            row.status === 'confirmed' ? 'default' : 'secondary'
                          }
                          className="gap-1"
                        >
                          {row.status === 'confirmed' ? (
                            <CheckCircle className="h-3 w-3" />
                          ) : (
                            <X className="h-3 w-3" />
                          )}
                          {row.status === 'confirmed' ? 'Підтверджено' : 'Очікує'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </motion.div>
          )}

          {selectedSection === 'doctors' && (
            <motion.div
              key="doctors"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.15 }}
              className="grid gap-4 md:grid-cols-2"
            >
              {doctors.map((doctor) => (
                <Card key={doctor.name}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{doctor.avatar}</span>
                      <div>
                        <CardTitle>{doctor.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {doctor.specialty}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      {doctor.experience}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {doctor.schedule}
                    </p>
                    <div className="flex items-center gap-2 pt-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>Зв&apos;язатись з лікарем</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          )}

          {selectedSection === 'patients' && (
            <motion.div
              key="patients"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.15 }}
            >
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">
                    База даних пацієнтів з контактами та історією відвідувань
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {selectedSection === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.15 }}
            >
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">
                    Налаштування клініки, робочих годин, повідомлень та
                    інтеграцій
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
