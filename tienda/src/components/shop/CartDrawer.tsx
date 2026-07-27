'use client';

import { ShoppingBag, X, Minus, Plus, Trash2, ArrowRight, ChevronDown } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import Link from 'next/link';
import { useState } from 'react';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, removeItem, updateQuantity, total, itemCount } = useCartStore();
  const [summaryOpen, setSummaryOpen] = useState(true);

  if (!open) return null;

  const shipping = total() >= 150 ? 0 : 10;
  const finalTotal = total() + shipping;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h2 className="text-base font-semibold text-gray-900">
            Carrito {itemCount() > 0 && <span className="text-gray-400 font-normal">({itemCount()})</span>}
          </h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Mobile: Summary Accordion at TOP */}
        {items.length > 0 && (
          <div className="md:hidden border-b border-gray-100 shrink-0">
            <button
              onClick={() => setSummaryOpen(!summaryOpen)}
              className="w-full flex items-center justify-between px-6 py-3 text-left"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900">S/ {finalTotal.toFixed(2)}</span>
                <span className="text-xs text-gray-400">· {itemCount()} items</span>
              </div>
              <ChevronDown
                size={16}
                className={`text-gray-400 transition-transform ${summaryOpen ? 'rotate-180' : ''}`}
              />
            </button>
            {summaryOpen && (
              <div className="px-6 pb-4 space-y-3 animate-fade-in">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="font-medium text-gray-700">S/ {total().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Envio</span>
                    <span className="font-medium text-gray-700">{shipping === 0 ? 'Gratis' : `S/ ${shipping.toFixed(2)}`}</span>
                  </div>
                  <div className="border-t border-gray-100 pt-1.5 flex justify-between">
                    <span className="text-xs font-semibold text-gray-900">Total</span>
                    <span className="text-xs font-bold text-gray-900">S/ {finalTotal.toFixed(2)}</span>
                  </div>
                </div>
                <Link href="/checkout" onClick={onClose} className="btn-primary w-full justify-center gap-2 text-sm py-2.5">
                  Ir a checkout
                  <ArrowRight size={14} />
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
                <ShoppingBag size={24} className="text-gray-300" />
              </div>
              <p className="text-sm text-gray-500 mb-1">Tu carrito esta vacio</p>
              <Link href="/tienda" onClick={onClose} className="text-sm font-medium text-brand-600 hover:text-brand-700">
                Ir a la tienda
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.productId} className="flex gap-3">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-50 shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{item.sku}</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-0 border border-gray-200 rounded-lg">
                        <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-50 rounded-l-lg transition-colors">
                          <Minus size={12} />
                        </button>
                        <span className="w-7 h-7 flex items-center justify-center text-xs font-medium text-gray-900 border-x border-gray-200">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-50 rounded-r-lg transition-colors">
                          <Plus size={12} />
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-gray-900">S/ {(item.price * item.quantity).toFixed(2)}</span>
                        <button onClick={() => removeItem(item.productId)} className="text-gray-300 hover:text-red-500 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Desktop Footer (hidden on mobile) */}
        {items.length > 0 && (
          <div className="hidden md:block border-t border-gray-100 px-6 py-5 space-y-4 shrink-0">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-medium text-gray-900">S/ {total().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Envio</span>
                <span className="font-medium text-gray-900">{shipping === 0 ? 'Gratis' : `S/ ${shipping.toFixed(2)}`}</span>
              </div>
              <div className="border-t border-gray-100 pt-2 flex justify-between">
                <span className="text-sm font-semibold text-gray-900">Total</span>
                <span className="text-sm font-bold text-gray-900">S/ {finalTotal.toFixed(2)}</span>
              </div>
            </div>
            <Link href="/checkout" onClick={onClose} className="btn-primary w-full justify-center gap-2">
              Continuar al checkout
              <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
