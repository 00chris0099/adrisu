'use client';

import Link from 'next/link';
import { ShoppingBag, Search, Menu, X, User, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useCartStore } from '@/store/cartStore';
import CartDrawer from '@/components/shop/CartDrawer';
import { signOut, useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const itemCount = useCartStore((s) => s.itemCount());
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  useEffect(() => setMounted(true), []);

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="container-wide">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center shrink-0">
              <img src="/images/logo.png" alt="AdriSu Kids" className="h-8 md:h-9 w-auto" />
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              <Link href="/" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-50 transition-colors">
                Inicio
              </Link>
              <Link href="/tienda" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-50 transition-colors">
                Tienda
              </Link>
              <Link href="/tienda?categoria=camas-cunas" className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-50 transition-colors">
                Camas
              </Link>
              <Link href="/tienda?categoria=sillas-altas" className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-50 transition-colors">
                Sillas
              </Link>
              <Link href="/tienda?categoria=carritos" className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-50 transition-colors">
                Carritos
              </Link>
            </nav>

            {/* Right */}
            <div className="flex items-center gap-1">
              <button className="hidden md:flex w-10 h-10 items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors">
                <Search size={18} />
              </button>

              <button onClick={() => setCartOpen(true)} className="relative w-10 h-10 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors">
                <ShoppingBag size={18} />
                {itemCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-brand-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </button>

              {mounted && session ? (
                <div className="hidden md:flex items-center gap-1 ml-1">
                  <span className="text-xs text-gray-500 max-w-[80px] truncate">{session.user?.name}</span>
                  <button onClick={() => signOut()} className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="Cerrar sesion">
                    <LogOut size={16} />
                  </button>
                </div>
              ) : (
                <Link href="/login" className="hidden md:flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors">
                  <User size={16} />
                  <span className="font-medium">Entrar</span>
                </Link>
              )}

              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <nav className="md:hidden pb-4 border-t border-gray-100 pt-3 space-y-1 animate-fade-in">
              <Link href="/" className="block px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-xl" onClick={() => setMobileMenuOpen(false)}>
                Inicio
              </Link>
              <Link href="/tienda" className="block px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-xl" onClick={() => setMobileMenuOpen(false)}>
                Tienda
              </Link>
              <Link href="/tienda?categoria=camas-cunas" className="block px-3 py-2.5 text-sm text-gray-500 hover:bg-gray-50 rounded-xl" onClick={() => setMobileMenuOpen(false)}>
                Camas y Cunas
              </Link>
              <Link href="/tienda?categoria=sillas-altas" className="block px-3 py-2.5 text-sm text-gray-500 hover:bg-gray-50 rounded-xl" onClick={() => setMobileMenuOpen(false)}>
                Sillas Altas
              </Link>
              <Link href="/tienda?categoria=carritos" className="block px-3 py-2.5 text-sm text-gray-500 hover:bg-gray-50 rounded-xl" onClick={() => setMobileMenuOpen(false)}>
                Carritos
              </Link>
              <div className="border-t border-gray-100 mt-2 pt-2">
                {mounted && session ? (
                  <>
                    <div className="px-3 py-2">
                      <p className="text-sm font-medium text-gray-900">{session.user?.name}</p>
                      <p className="text-xs text-gray-400">{session.user?.email}</p>
                    </div>
                    <button onClick={() => { signOut(); setMobileMenuOpen(false); }} className="w-full text-left px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl">
                      Cerrar sesion
                    </button>
                  </>
                ) : (
                  <Link href="/login" className="block px-3 py-2.5 text-sm font-medium text-brand-600 hover:bg-brand-50 rounded-xl" onClick={() => setMobileMenuOpen(false)}>
                    Iniciar sesion
                  </Link>
                )}
              </div>
            </nav>
          )}
        </div>
      </header>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-gray-100 safe-bottom">
        <div className="flex items-center justify-around py-1.5 px-2">
          <Link href="/" className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-[10px] font-medium transition-colors min-w-[56px] ${
            pathname === '/' ? 'text-gray-900' : 'text-gray-400'
          }`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={pathname === '/' ? 2.5 : 1.5} strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>
            <span>Inicio</span>
          </Link>
          <Link href="/tienda" className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-[10px] font-medium transition-colors min-w-[56px] ${
            pathname === '/tienda' ? 'text-gray-900' : 'text-gray-400'
          }`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={pathname === '/tienda' ? 2.5 : 1.5} strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            <span>Tienda</span>
          </Link>
          <button onClick={() => setCartOpen(true)} className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-[10px] font-medium transition-colors min-w-[56px] relative ${
            cartOpen ? 'text-gray-900' : 'text-gray-400'
          }`}>
            <ShoppingBag size={20} strokeWidth={1.5} />
            {itemCount > 0 && (
              <span className="absolute top-0.5 right-2 w-3.5 h-3.5 bg-brand-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">{itemCount}</span>
            )}
            <span>Carrito</span>
          </button>
          <Link href="/login" className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-[10px] font-medium transition-colors min-w-[56px] ${
            pathname === '/login' ? 'text-gray-900' : 'text-gray-400'
          }`}>
            <User size={20} strokeWidth={1.5} />
            <span>Cuenta</span>
          </Link>
        </div>
      </nav>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
