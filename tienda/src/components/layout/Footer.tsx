'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Send, CheckCircle } from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const res = await fetch('/api/v1/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) { setSubscribed(true); setEmail(''); }
    } catch {}
    setLoading(false);
  }

  return (
    <footer className="bg-gray-950 text-gray-400">
      <div className="container-wide py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <img src="/images/logo.png" alt="AdriSu Kids" className="h-8 w-auto mb-4 brightness-0 invert" />
            <p className="text-sm text-gray-500 leading-relaxed">
              Muebles para bebes de calidad premium. Diseñados con amor en Peru.
            </p>
          </div>

          {/* Tienda */}
          <div>
            <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-4">Tienda</h4>
            <div className="space-y-2.5 text-sm">
              <Link href="/tienda" className="block hover:text-white transition-colors">Todos los productos</Link>
              <Link href="/tienda?categoria=camas-cunas" className="block hover:text-white transition-colors">Camas y Cunas</Link>
              <Link href="/tienda?categoria=sillas-altas" className="block hover:text-white transition-colors">Sillas Altas</Link>
              <Link href="/tienda?categoria=carritos" className="block hover:text-white transition-colors">Carritos</Link>
            </div>
          </div>

          {/* Ayuda */}
          <div>
            <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-4">Ayuda</h4>
            <div className="space-y-2.5 text-sm">
              <Link href="/faq" className="block hover:text-white transition-colors">Preguntas frecuentes</Link>
              <span className="block">Envios a todo el Peru</span>
              <span className="block">Devoluciones en 30 dias</span>
              <span className="block">Pagos seguros</span>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-4">Newsletter</h4>
            <p className="text-sm text-gray-500 mb-3">Recibe ofertas y novedades</p>
            {subscribed ? (
              <div className="flex items-center gap-2 text-emerald-400 text-sm">
                <CheckCircle size={14} /> Suscrito!
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="flex-1 px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-gray-600 transition-colors"
                />
                <button type="submit" disabled={loading || !email} className="p-2 bg-white text-gray-900 rounded-lg hover:bg-gray-200 disabled:opacity-30 transition-colors">
                  <Send size={14} />
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="border-t border-gray-800/50 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-600">
          <span>2026 AdriSu Kids. Todos los derechos reservados.</span>
          <div className="flex gap-4">
            <span>Terminos</span>
            <span>Privacidad</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
