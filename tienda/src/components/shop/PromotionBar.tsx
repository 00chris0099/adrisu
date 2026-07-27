'use client';

import { useState, useEffect } from 'react';

interface PromotionBarConfig {
  enabled: boolean;
  message: string;
  hours: number;
  bgColor: string;
  textColor: string;
}

function padZero(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

function getTimeFromHours(totalHours: number) {
  const totalSeconds = Math.max(0, Math.floor(totalHours * 3600));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { hours, minutes, seconds };
}

export default function PromotionBar({ config }: { config: PromotionBarConfig }) {
  const [remaining, setRemaining] = useState(() => getTimeFromHours(config.hours));
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted || !config.enabled || !config.hours || config.hours <= 0) return;

    let totalSeconds = Math.floor(config.hours * 3600);

    const timer = setInterval(() => {
      totalSeconds--;
      if (totalSeconds <= 0) {
        clearInterval(timer);
        setRemaining({ hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      setRemaining({
        hours: Math.floor(totalSeconds / 3600),
        minutes: Math.floor((totalSeconds % 3600) / 60),
        seconds: totalSeconds % 60,
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [mounted, config.enabled, config.hours]);

  if (!mounted || !config.enabled || !config.hours || config.hours <= 0) return null;

  const message = config.message
    .replace('{hours}', padZero(remaining.hours))
    .replace('{minutes}', padZero(remaining.minutes))
    .replace('{seconds}', padZero(remaining.seconds));

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 py-2 px-4 text-center text-xs md:text-sm font-medium"
      style={{ backgroundColor: config.bgColor, color: config.textColor }}
    >
      {message}
    </div>
  );
}
