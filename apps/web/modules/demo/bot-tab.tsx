'use client';

import { PremiumButton } from '@/shared/components/premium-button';
import { SignatureMark } from '@/shared/components/signature-mark';
import { EASE_DT_EXPO_OUT } from '@/shared/lib/motion';
import { Checks } from '@phosphor-icons/react';
import { motion } from 'motion/react';
import * as React from 'react';

import { scenarios } from './_data';

type ChatMessage = {
  type: 'bot' | 'user';
  text: string;
  time: string;
};

function nowTime(): string {
  return new Date().toLocaleTimeString('uk-UA', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function seedGreetings(): ChatMessage[] {
  return [
    { type: 'bot', text: 'Вітаю! Я DentaBot 🦷', time: nowTime() },
    {
      type: 'bot',
      text: 'Допоможу записатись на прийом до стоматолога',
      time: nowTime(),
    },
  ];
}

export function BotTab(): React.JSX.Element {
  const [chatMessages, setChatMessages] = React.useState<ChatMessage[]>(() =>
    seedGreetings(),
  );
  const [isTyping, setIsTyping] = React.useState(false);
  const intervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const messageTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const runScenario = React.useCallback((scenarioIndex: number) => {
    // Defensive cleanup guard: cancel any in-flight playback before starting
    // a new one, so retriggering a scenario mid-playback never interleaves
    // or duplicates messages.
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (messageTimeoutRef.current) {
      clearTimeout(messageTimeoutRef.current);
      messageTimeoutRef.current = null;
    }

    setIsTyping(false);
    setChatMessages(seedGreetings());

    const messages = scenarios[scenarioIndex]?.messages ?? [];
    let currentIndex = 0;

    intervalRef.current = setInterval(() => {
      const nextMessage = messages[currentIndex];

      if (!nextMessage) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        return;
      }

      if (nextMessage.type === 'bot') {
        setIsTyping(true);
        messageTimeoutRef.current = setTimeout(() => {
          setChatMessages((prev) => [
            ...prev,
            { ...nextMessage, time: nowTime() },
          ]);
          setIsTyping(false);
          messageTimeoutRef.current = null;
        }, 400);
      } else {
        setChatMessages((prev) => [
          ...prev,
          { ...nextMessage, time: nowTime() },
        ]);
      }

      currentIndex += 1;

      if (currentIndex >= messages.length) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    }, 800);
  }, []);

  React.useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (messageTimeoutRef.current) {
        clearTimeout(messageTimeoutRef.current);
        messageTimeoutRef.current = null;
      }
    };
  }, []);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isTyping]);

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <div className="mx-auto max-w-md">
          <div className="rounded-dt-frame bg-gray-900 p-3 shadow-[var(--shadow-dt-hover)]">
            <div className="flex h-[600px] flex-col overflow-hidden rounded-dt-frame-inner bg-dt-warm-white">
              <div className="flex items-center gap-3 bg-dt-navy px-4 py-3 text-dt-warm-white">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-dt-warm-white">
                  <span className="text-2xl">🦷</span>
                </div>
                <div>
                  <div className="font-semibold">DentaBot</div>
                  <div className="text-xs opacity-90">завжди онлайн</div>
                </div>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto p-4">
                {chatMessages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, ease: EASE_DT_EXPO_OUT }}
                    className={
                      message.type === 'user'
                        ? 'flex justify-end'
                        : 'flex justify-start'
                    }
                  >
                    <div className="max-w-[80%] space-y-1">
                      <div
                        className={
                          message.type === 'user'
                            ? 'rounded-2xl bg-dt-navy px-4 py-2 text-dt-warm-white'
                            : 'flex items-start gap-1.5 rounded-2xl border border-[var(--dt-border)] bg-dt-warm-white px-4 py-2 text-dt-navy'
                        }
                      >
                        {message.type === 'bot' ? (
                          <SignatureMark pulse className="mr-1.5 mt-1.5" />
                        ) : null}
                        <span className="whitespace-pre-line">
                          {message.text}
                        </span>
                      </div>
                      <div
                        className={
                          message.type === 'user'
                            ? 'flex items-center justify-end gap-1 text-dt-caption text-dt-navy/50'
                            : 'flex items-center justify-start gap-1 text-dt-caption text-dt-navy/50'
                        }
                      >
                        <span>{message.time}</span>
                        {message.type === 'user' ? (
                          <Checks
                            weight="regular"
                            className="h-3 w-3 text-dt-navy/50"
                          />
                        ) : null}
                      </div>
                    </div>
                  </motion.div>
                ))}

                {isTyping ? (
                  <div className="flex justify-start">
                    <div className="rounded-2xl border border-[var(--dt-border)] bg-dt-warm-white px-4 py-3">
                      <div className="flex items-center gap-1">
                        <span
                          className="h-1.5 w-1.5 rounded-full bg-dt-navy/40 motion-safe:animate-pulse"
                          style={{ animationDelay: '0ms' }}
                        />
                        <span
                          className="h-1.5 w-1.5 rounded-full bg-dt-navy/40 motion-safe:animate-pulse"
                          style={{ animationDelay: '200ms' }}
                        />
                        <span
                          className="h-1.5 w-1.5 rounded-full bg-dt-navy/40 motion-safe:animate-pulse"
                          style={{ animationDelay: '400ms' }}
                        />
                      </div>
                    </div>
                  </div>
                ) : null}

                <div ref={messagesEndRef} />
              </div>

              <div className="p-3">
                <div className="rounded-full bg-dt-navy/5 px-4 py-2 text-sm text-dt-graphite">
                  Оберіть сценарій справа →
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-dt-h3 font-semibold text-dt-navy">
          Оберіть сценарій:
        </h3>
        {scenarios.map((scenario, index) => (
          <PremiumButton
            key={index}
            onClick={() => runScenario(index)}
            variant="outline"
            className="h-auto w-full justify-start py-4"
          >
            {scenario.label}
          </PremiumButton>
        ))}
        <div className="border-t border-[var(--dt-border)] pt-4">
          <p className="mb-3 text-sm text-dt-graphite">
            Або спробуйте в реальному Telegram:
          </p>
          <PremiumButton variant="coral" className="w-full" asChild>
            <a
              href="https://t.me/dentabot_support"
              target="_blank"
              rel="noopener noreferrer"
            >
              Відкрити в Telegram
            </a>
          </PremiumButton>
        </div>
      </div>
    </div>
  );
}
