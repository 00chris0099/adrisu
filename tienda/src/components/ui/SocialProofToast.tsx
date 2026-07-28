'use client';

import { useState, useEffect, useRef } from 'react';

const TIME_OPTIONS = ['hace 2 min', 'hace 5 min', 'hace 8 min', 'hace 12 min', 'hace 18 min', 'hace 25 min'];
const AVATAR_COLORS = ['#ec4899', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#6366f1'];
const MIGRATION_NAMES = ['María', 'Carlos', 'Ana', 'Luis', 'Rosa', 'Jorge', 'Claudia', 'Pedro', 'Sofía', 'Miguel', 'Elena', 'Fernando', 'Patricia', 'Roberto', 'Diana', 'Andrés', 'Carmen'];
const MIGRATION_CITIES = ['Lima', 'Arequipa', 'Cusco', 'Trujillo', 'Piura', 'Chiclayo', 'Ica', 'Huancayo', 'Lima', 'Cusco', 'Arequipa', 'Trujillo', 'Lima', 'Piura', 'Chiclayo', 'Ica', 'Huancayo'];

const IMGBB_MAP: Record<string, string> = {
  'Abigail.jpg': 'https://i.ibb.co/p6f3nnyJ/1bcce3d3e809.jpg',
  'Alejandro.jpg': 'https://i.ibb.co/G4g4qY37/075e42a1079e.jpg',
  'Benjamin.jpg': 'https://i.ibb.co/0pYsJLY0/491bdc467f21.jpg',
  'Daniela.jpg': 'https://i.ibb.co/4ngqxGqk/b3cba795ec88.jpg',
  'Eric.jpg': 'https://i.ibb.co/35gfjYyN/581bb8e07080.jpg',
  'jeremy.jpg': 'https://i.ibb.co/MkrVRHPp/a680ac24ecf5.jpg',
  'juan.jpg': 'https://i.ibb.co/Z1H2pbC5/eabd331a6c08.jpg',
  'Liliana.jpg': 'https://i.ibb.co/DDfVsfKB/3bfbe0a72485.jpg',
  'lucas.jpg': 'https://i.ibb.co/Vc7xkG8J/292503f6281b.jpg',
  'martina.jpg': 'https://i.ibb.co/NgP4CTsQ/fc4f09c61a0a.jpg',
  'mateo.jpg': 'https://i.ibb.co/fYhLFh3z/ef852dafb6b5.jpg',
  'melina.jpg': 'https://i.ibb.co/QFXwr5n0/58c6546cd8ba.jpg',
  'santiago.jpg': 'https://i.ibb.co/j9CXN103/15696c5cdb75.jpg',
  'sofia.jpg': 'https://i.ibb.co/MD1PGSxL/569b2641fba8.jpg',
  'thiago.jpg': 'https://i.ibb.co/gL8mJKNV/5ef70ab02ebf.jpg',
  'valentino.jpg': 'https://i.ibb.co/cnfgb57/2f670c2d4f69.jpg',
  'zoey.jpg': 'https://i.ibb.co/WWzkn4rw/d29931d44c37.jpg',
};

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function resolveImageUrl(url: string): string {
  if (url.startsWith('http')) return url;
  const filename = url.split('/').pop() || '';
  if (IMGBB_MAP[filename]) return IMGBB_MAP[filename];
  return url;
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
  if (config.avatars && config.avatars.length > 0) {
    return config.avatars.map(a => ({ ...a, imageUrl: resolveImageUrl(a.imageUrl) }));
  }
  if (config.avatarFiles && config.avatarFiles.length > 0) {
    return config.avatarFiles.map((f: string, i: number) => ({
      id: String(i + 1),
      imageUrl: IMGBB_MAP[f] || resolveImageUrl(`/avatars/${f}`),
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
      <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-3 py-2.5 flex items-center gap-2.5 max-w-[280px]">
        <div
          className="w-9 h-9 rounded-full shrink-0 overflow-hidden border-2 border-white shadow-sm"
          style={{ backgroundColor: bgColor }}
        >
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
                span.className = 'fallback-initial absolute inset-0 flex items-center justify-center text-white text-sm font-bold';
                span.textContent = initial;
                parent.style.position = 'relative';
                parent.appendChild(span);
              }
            }}
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] text-gray-700 leading-tight">{message}</p>
          <p className="text-[9px] text-gray-400 mt-0.5">{time}</p>
        </div>
      </div>
    </div>
  );
}
