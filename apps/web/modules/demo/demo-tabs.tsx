'use client';

import { PremiumButton } from '@/shared/components/premium-button';
import { GearSixIcon, RobotIcon } from '@phosphor-icons/react/ssr';
import { AnimatePresence, motion } from 'motion/react';
import * as React from 'react';

import { AdminTab } from './admin-tab';
import { BotTab } from './bot-tab';

type Tab = 'bot' | 'admin';

export function DemoTabs(): React.JSX.Element {
  const [activeTab, setActiveTab] = React.useState<Tab>('bot');

  return (
    <div>
      <div
        role="tablist"
        className="mx-auto mb-8 grid w-full max-w-md grid-cols-2 gap-2"
      >
        <PremiumButton
          role="tab"
          aria-selected={activeTab === 'bot'}
          variant={activeTab === 'bot' ? 'coral' : 'outline'}
          onClick={() => setActiveTab('bot')}
        >
          <RobotIcon weight="bold" className="size-4" />
          Бот — вид пацієнта
        </PremiumButton>
        <PremiumButton
          role="tab"
          aria-selected={activeTab === 'admin'}
          variant={activeTab === 'admin' ? 'coral' : 'outline'}
          onClick={() => setActiveTab('admin')}
        >
          <GearSixIcon weight="bold" className="size-4" />
          Адмін панель
        </PremiumButton>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          role="tabpanel"
        >
          {activeTab === 'bot' ? <BotTab /> : <AdminTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
