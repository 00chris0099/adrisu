'use client';

import { useState, useEffect } from 'react';
import { LandingPageBlock } from '../ProductFormContext';

interface LandingBlockRendererProps {
  block: LandingPageBlock;
}

function getStylesFromSettings(styles: Record<string, any>): React.CSSProperties {
  if (!styles || Object.keys(styles).length === 0) return {};
  const css: React.CSSProperties = {};
  if (styles.backgroundColor) css.backgroundColor = styles.backgroundColor;
  if (styles.backgroundImage) css.backgroundImage = `url(${styles.backgroundImage})`;
  if (styles.margin) {
    const m = styles.margin;
    css.margin = `${m.top || '0'} ${m.right || '0'} ${m.bottom || '0'} ${m.left || '0'}`;
  }
  if (styles.padding) {
    const p = styles.padding;
    css.padding = `${p.top || '0'} ${p.right || '0'} ${p.bottom || '0'} ${p.left || '0'}`;
  }
  if (styles.border) {
    const b = styles.border;
    if (b.width && b.width !== '0') css.border = `${b.width} ${b.style || 'solid'} ${b.color || '#e5e7eb'}`;
    if (b.radius && b.radius !== '0') css.borderRadius = b.radius;
  }
  if (styles.shadow) {
    const s = styles.shadow;
    if (s.blur && s.blur !== '0') css.boxShadow = `${s.offsetX || '0'} ${s.offsetY || '0'} ${s.blur} ${s.spread || '0'} ${s.color || 'rgba(0,0,0,0.1)'}`;
  }
  return css;
}

function getVideoEmbedUrl(url: string): string {
  if (!url) return '';
  if (url.includes('youtu.be/')) {
    const id = url.split('youtu.be/')[1]?.split('?')[0];
    return `https://www.youtube.com/embed/${id}`;
  }
  if (url.includes('youtube.com/watch')) {
    return url.replace('watch?v=', 'embed/');
  }
  if (url.includes('youtube.com/embed/')) {
    return url;
  }
  if (url.includes('vimeo.com/')) {
    const id = url.split('vimeo.com/')[1]?.split('?')[0];
    return `https://player.vimeo.com/video/${id}`;
  }
  if (url.includes('player.vimeo.com/')) {
    return url;
  }
  return url;
}

function CountdownBlock({ content, customStyles }: { content: Record<string, any>; customStyles: React.CSSProperties }) {
  const [timeLeft, setTimeLeft] = useState({ days: '00', hours: '00', minutes: '00', seconds: '00' });

  useEffect(() => {
    if (!content.endDate) return;

    const calculate = () => {
      const now = new Date().getTime();
      const target = new Date(content.endDate).getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft({ days: '00', hours: '00', minutes: '00', seconds: '00' });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({
        days: String(days).padStart(2, '0'),
        hours: String(hours).padStart(2, '0'),
        minutes: String(minutes).padStart(2, '0'),
        seconds: String(seconds).padStart(2, '0'),
      });
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [content.endDate]);

  return (
    <div className="py-8 px-6 text-center" style={{ ...customStyles, backgroundColor: content.backgroundColor || '#1f2937', color: content.textColor || '#ffffff' }}>
      {content.label && <p className="text-sm font-medium mb-4">{content.label}</p>}
      <div className="flex items-center justify-center gap-3">
        {[
          { val: timeLeft.days, label: 'Dias' },
          { val: timeLeft.hours, label: 'Horas' },
          { val: timeLeft.minutes, label: 'Min' },
          { val: timeLeft.seconds, label: 'Seg' },
        ].map((item, i) => (
          <div key={i} className="text-center">
            <div className="text-2xl font-bold px-3 py-2 rounded-lg" style={{ backgroundColor: 'rgba(0,0,0,0.3)', color: content.numberColor || '#ef4444' }}>{item.val}</div>
            <p className="text-[10px] mt-1 opacity-70">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function TabsBlock({ content, customStyles }: { content: Record<string, any>; customStyles: React.CSSProperties }) {
  const [activeTab, setActiveTab] = useState(0);
  const items = content.items || [];

  return (
    <div className="py-6 px-6" style={customStyles}>
      <div className="flex border-b border-gray-200 mb-4">
        {items.slice(0, 6).map((item: any, i: number) => (
          <button
            key={i}
            onClick={() => setActiveTab(i)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              i === activeTab ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {item.title}
          </button>
        ))}
      </div>
      <p className="text-sm text-gray-600 whitespace-pre-wrap">{items[activeTab]?.content || ''}</p>
    </div>
  );
}

function ContactFormBlock({ content, customStyles }: { content: Record<string, any>; customStyles: React.CSSProperties }) {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="py-8 px-6 bg-gray-50 text-center" style={customStyles}>
        <p className="text-green-600 font-semibold">{content.successMessage || 'Mensaje enviado correctamente!'}</p>
      </div>
    );
  }

  return (
    <div className="py-8 px-6 bg-gray-50" style={customStyles}>
      <div className="max-w-md mx-auto">
        {content.title && <h3 className="text-lg font-bold text-gray-900 mb-2 text-center">{content.title}</h3>}
        {content.description && <p className="text-sm text-gray-600 mb-4 text-center">{content.description}</p>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input type="text" placeholder="Nombre" required className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            <input type="email" placeholder="Email" required className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <input type="tel" placeholder="Telefono" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          <textarea placeholder="Mensaje" rows={3} required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none" />
          <button type="submit" className="w-full py-2.5 text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity" style={{ backgroundColor: content.buttonColor || '#16a34a' }}>
            {content.submitText || 'Enviar'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function LandingBlockRenderer({ block }: LandingBlockRendererProps) {
  const customStyles = getStylesFromSettings(block.settings?.styles);

  switch (block.type) {
    case 'hero':
      return (
        <div className="py-12 px-6 text-center" style={{ ...customStyles, backgroundColor: block.settings.backgroundColor || '#16a34a', color: block.settings.textColor || '#ffffff' }}>
          <h2 className="text-2xl md:text-3xl font-bold mb-3">{block.content.title}</h2>
          <p className="text-sm md:text-base opacity-90 mb-6">{block.content.subtitle}</p>
          {block.content.buttonText && (
            <a href={block.content.buttonUrl || '#'} className="inline-block px-6 py-3 bg-white/20 hover:bg-white/30 rounded-full text-sm font-semibold transition-colors">
              {block.content.buttonText}
            </a>
          )}
        </div>
      );

    case 'text':
      return (
        <div className="py-6 px-6" style={customStyles}>
          {block.content.heading && <h3 className="text-lg font-bold text-gray-900 mb-2">{block.content.heading}</h3>}
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{block.content.body}</p>
        </div>
      );

    case 'image':
      return (
        <div style={customStyles}>
          {block.content.url ? (
            <img
              src={block.content.url}
              alt={block.content.caption || ''}
              className="block"
              style={{
                width: `${block.content.width || 100}%`,
                margin: block.content.alignment === 'left' ? '0 auto 0 0' : block.content.alignment === 'right' ? '0 0 0 auto' : '0 auto',
              }}
            />
          ) : (
            <div className="bg-gray-100 h-48 flex items-center justify-center text-gray-400 text-sm">Sin imagen</div>
          )}
          {block.content.caption && <p className="text-xs text-gray-500 mt-1 px-6 text-center">{block.content.caption}</p>}
        </div>
      );

    case 'gallery':
      return (
        <div style={customStyles}>
          <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${block.content.columns || 2}, 1fr)` }}>
            {(block.content.images || []).filter(Boolean).map((url: string, i: number) => (
              <img key={i} src={url} alt="" className="w-full h-32 object-cover" />
            ))}
          </div>
        </div>
      );

    case 'video':
      return (
        <div style={customStyles}>
          {block.content.url ? (
            <div className="aspect-video">
              <iframe src={getVideoEmbedUrl(block.content.url)} className="w-full h-full" allowFullScreen />
            </div>
          ) : (
            <div className="bg-gray-100 aspect-video flex items-center justify-center text-gray-400 text-sm">Sin video</div>
          )}
        </div>
      );

    case 'features':
      return (
        <div className="py-8 px-6" style={customStyles}>
          <div className="grid grid-cols-3 gap-4">
            {(block.content.items || []).map((item: any, i: number) => (
              <div key={i} className="text-center p-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-green-600 text-lg">{getIconEmoji(item.icon)}</span>
                </div>
                <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                <p className="text-xs text-gray-500 mt-1">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      );

    case 'cta':
      return (
        <div className="py-8 px-6 text-center" style={customStyles}>
          <a href={block.content.url || '#'} className="inline-block px-8 py-3 rounded-xl text-sm font-semibold transition-transform hover:scale-105" style={{ backgroundColor: block.content.backgroundColor || '#16a34a', color: block.content.textColor || '#ffffff' }}>
            {block.content.text}
          </a>
        </div>
      );

    case 'testimonials':
      return (
        <div className="py-8 px-6 bg-gray-50" style={customStyles}>
          <div className="grid grid-cols-3 gap-4">
            {(block.content.items || []).map((item: any, i: number) => (
              <div key={i} className="bg-white p-4 rounded-xl shadow-sm">
                <div className="flex gap-0.5 mb-2">
                  {[1, 2, 3, 4, 5].map(s => (
                    <span key={s} className={`text-sm ${s <= item.rating ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
                  ))}
                </div>
                <p className="text-xs text-gray-600 italic mb-2">"{item.text}"</p>
                <p className="text-[10px] font-medium text-gray-900">— {item.name}</p>
              </div>
            ))}
          </div>
        </div>
      );

    case 'faq':
      return (
        <div className="py-6 px-6" style={customStyles}>
          {(block.content.items || []).map((item: any, i: number) => (
            <details key={i} className="border border-gray-200 rounded-lg mb-2 last:mb-0">
              <summary className="px-4 py-3 text-sm font-medium cursor-pointer hover:bg-gray-50">{item.question}</summary>
              <div className="px-4 pb-3 text-sm text-gray-600">{item.answer}</div>
            </details>
          ))}
        </div>
      );

    case 'accordion':
      return (
        <div className="py-6 px-6" style={customStyles}>
          {(block.content.items || []).map((item: any, i: number) => (
            <AccordionItem key={i} title={item.title || item.question || ''} content={item.content || item.answer || ''} />
          ))}
        </div>
      );

    case 'columns':
      return (
        <div className="py-6 px-6" style={customStyles}>
          <div className="flex gap-4">
            {(block.content.columns || []).map((col: any, i: number) => (
              <div key={i} style={{ flex: `0 0 ${col.width || 50}%` }}>
                {col.title && <h4 className="font-semibold text-sm mb-1">{col.title}</h4>}
                <p className="text-xs text-gray-600">{col.content}</p>
              </div>
            ))}
          </div>
        </div>
      );

    case 'divider':
      return (
        <div className="py-2 px-6" style={customStyles}>
          <hr style={{ borderStyle: block.content.style || 'solid', borderColor: block.content.color || '#e5e7eb', borderWidth: `${block.content.thickness || 1}px` }} />
        </div>
      );

    case 'spacing':
      return <div style={{ height: `${block.content.height || 60}px`, ...customStyles }} />;

    case 'contact':
      return <ContactFormBlock content={block.content} customStyles={customStyles} />;

    case 'countdown':
      return <CountdownBlock content={block.content} customStyles={customStyles} />;

    case 'tabs':
      return <TabsBlock content={block.content} customStyles={customStyles} />;

    default:
      return null;
  }
}

function AccordionItem({ title, content }: { title: string; content: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 rounded-lg mb-2 last:mb-0">
      <button onClick={() => setOpen(!open)} className="w-full px-4 py-3 text-sm font-medium text-left flex items-center justify-between hover:bg-gray-50">
        {title}
        <span className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}>▼</span>
      </button>
      {open && <div className="px-4 pb-3 text-sm text-gray-600">{content}</div>}
    </div>
  );
}

function getIconEmoji(icon: string): string {
  const icons: Record<string, string> = {
    truck: '🚚', shield: '🛡️', refresh: '🔄', star: '⭐', heart: '❤️',
    gift: '🎁', check: '✓', clock: '🕐', phone: '📞', mail: '✉️',
  };
  return icons[icon] || '✓';
}
