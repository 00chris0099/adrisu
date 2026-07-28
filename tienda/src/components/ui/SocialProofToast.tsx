'use client';

import { useState, useEffect, useRef } from 'react';

const TIME_OPTIONS = ['hace 2 min', 'hace 5 min', 'hace 8 min', 'hace 12 min', 'hace 18 min', 'hace 25 min'];
const AVATAR_COLORS = ['#ec4899', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#6366f1'];
const MIGRATION_NAMES = ['María', 'Carlos', 'Ana', 'Luis', 'Rosa', 'Jorge', 'Claudia', 'Pedro', 'Sofía', 'Miguel', 'Elena', 'Fernando', 'Patricia', 'Roberto', 'Diana', 'Andrés', 'Carmen'];
const MIGRATION_CITIES = ['Lima', 'Arequipa', 'Cusco', 'Trujillo', 'Piura', 'Chiclayo', 'Ica', 'Huancayo', 'Lima', 'Cusco', 'Arequipa', 'Trujillo', 'Lima', 'Piura', 'Chiclayo', 'Ica', 'Huancayo'];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

interface SocialProofAvatar {
  id: string;
  imageUrl: string;
  name: string;
  city: string;
}

interface SocialProofConfig {
  enabled: boolean;
  interval: number;
  messages: string[];
  avatars?: SocialProofAvatar[];
  avatarFiles?: string[];
}

interface SocialProofToastProps {
  config: SocialProofConfig;
  productName: string;
}

function migrateAvatars(config: SocialProofConfig): SocialProofAvatar[] {
  if (config.avatars && config.avatars.length > 0) return config.avatars;
  if (config.avatarFiles && config.avatarFiles.length > 0) {
    return config.avatarFiles.map((f: string, i: number) => ({
      id: String(i + 1),
      imageUrl: f.startsWith('/') ? f : `/avatars/${f}`,
      name: MIGRATION_NAMES[i % MIGRATION_NAMES.length],
      city: MIGRATION_CITIES[i % MIGRATION_CITIES.length],
    }));
  }
  return [];
}

export default function SocialProofToast({ config, productName }: SocialProofToastProps) {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [current, setCurrent] = useState<{ avatar: SocialProofAvatar; message: string; time: string } | null>(null);
  const msgIndexRef = useRef(0);

  const avatars = migrateAvatars(config || {});

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted || !config?.enabled || !productName || avatars.length === 0) return;

    const buildNotification = () => {
      const avatar = randomFrom(avatars);
      const msgs = config?.messages || [];
      const template = msgs.length > 0
        ? msgs[msgIndexRef.current % msgs.length]
        : '{name} de {city} compró este producto';
      msgIndexRef.current++;
      const message = template
        .replace('{name}', avatar.name)
        .replace('{city}', avatar.city)
        .replace('{product}', productName);
      const time = randomFrom(TIME_OPTIONS);
      return { avatar, message, time };
    };

    setCurrent(buildNotification());

    const interval = Math.max(config?.interval || 5, 3) * 1000;
    const hideDuration = 4000;
    const extraPause = 1000;

    const showTimer = setInterval(() => {
      setCurrent(buildNotification());
      setVisible(true);
      setTimeout(() => setVisible(false), hideDuration);
    }, interval + hideDuration + extraPause);

    const firstTimer = setTimeout(() => {
      setVisible(true);
      setTimeout(() => setVisible(false), hideDuration);
    }, Math.max(interval, 5000));

    return () => { clearInterval(showTimer); clearTimeout(firstTimer); };
  }, [mounted, config?.enabled, config?.interval, config?.messages, avatars, productName]);

  if (!mounted || !config?.enabled || !current || avatars.length === 0) return null;

  const { avatar, message, time } = current;
  const initial = avatar.name ? avatar.name.charAt(0) : '?';
  const bgColor = AVATAR_COLORS[hashStr(avatar.name) % AVATAR_COLORS.length];

  return (
    <div className={`fixed bottom-20 left-3 z-50 transition-all duration-500 ${visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'}`}>
      <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 flex items-center gap-3 max-w-xs">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 overflow-hidden"
          style={{ backgroundColor: bgColor }}
        >
          {avatar.imageUrl ? (
            <img
              src={avatar.imageUrl}
              alt={avatar.name}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                const parent = (e.target as HTMLImageElement).parentElement;
                if (parent && !parent.querySelector('.fallback-initial')) {
                  const span = document.createElement('span');
                  span.className = 'fallback-initial text-white text-sm font-bold leading-none';
                  span.textContent = initial;
                  parent.appendChild(span);
                }
              }}
            />
          ) : (
            <span className="text-white text-sm font-bold leading-none">{initial}</span>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-xs text-gray-700">{message}</p>
          <p className="text-[10px] text-gray-400">{time}</p>
        </div>
      </div>
    </div>
  );
}
