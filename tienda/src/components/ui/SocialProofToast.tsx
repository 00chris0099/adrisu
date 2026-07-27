'use client';

import { useState, useEffect } from 'react';
import { User } from 'lucide-react';

const NAMES = ['María', 'Carlos', 'Ana', 'Luis', 'Rosa', 'Jorge', 'Claudia', 'Pedro', 'Sofía', 'Miguel', 'Elena', 'Fernando', 'Patricia', 'Roberto', 'Diana', 'Andrés', 'Carmen', 'Juan', 'Laura', 'Ricardo'];
const CITIES = ['Lima', 'Arequipa', 'Cusco', 'Trujillo', 'Piura', 'Chiclayo', 'Ica', 'Huancayo', 'Cajamarca', 'Puno'];
const TIME_OPTIONS = ['hace 2 min', 'hace 5 min', 'hace 8 min', 'hace 12 min', 'hace 18 min', 'hace 25 min'];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

interface SocialProofConfig {
  enabled: boolean;
  interval: number;
  messages: string[];
  avatarFiles: string[];
}

interface SocialProofToastProps {
  config: SocialProofConfig;
  productName: string;
}

export default function SocialProofToast({ config, productName }: SocialProofToastProps) {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [person, setPerson] = useState({ name: '', city: '', avatar: '', message: '', time: '' });

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted || !config.enabled || !productName) return;

    const buildPerson = () => {
      const name = randomFrom(NAMES);
      const city = randomFrom(CITIES);
      const avatar = config.avatarFiles.length > 0
        ? `/avatars/${randomFrom(config.avatarFiles)}`
        : '';
      const msgTemplate = config.messages.length > 0
        ? randomFrom(config.messages)
        : '{name} de {city} compró este producto';
      const message = msgTemplate
        .replace('{name}', name)
        .replace('{city}', city)
        .replace('{product}', productName);
      const time = randomFrom(TIME_OPTIONS);
      return { name, city, avatar, message, time };
    };

    setPerson(buildPerson());

    const interval = Math.max(config.interval || 5, 3) * 1000;

    const showTimer = setInterval(() => {
      setPerson(buildPerson());
      setVisible(true);
      setTimeout(() => setVisible(false), 4000);
    }, interval);

    const firstTimer = setTimeout(() => {
      setVisible(true);
      setTimeout(() => setVisible(false), 4000);
    }, Math.max(interval, 5000));

    return () => { clearInterval(showTimer); clearTimeout(firstTimer); };
  }, [mounted, config.enabled, config.interval, config.messages, config.avatarFiles, productName]);

  if (!mounted || !config.enabled || !productName) return null;

  return (
    <div className={`fixed top-3 left-3 md:bottom-4 md:left-4 md:top-auto z-50 transition-all duration-500 ${visible ? 'translate-y-0 opacity-100' : '-translate-y-4 md:translate-y-4 opacity-0 pointer-events-none'}`}>
      <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 flex items-center gap-3 max-w-xs">
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0 overflow-hidden">
          {person.avatar ? (
            <img
              src={person.avatar}
              alt={person.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <User size={14} className={`text-blue-600 ${person.avatar ? 'hidden' : ''}`} />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-gray-700">{person.message}</p>
          <p className="text-[10px] text-gray-400">{person.time}</p>
        </div>
      </div>
    </div>
  );
}
