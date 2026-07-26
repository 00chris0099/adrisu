'use client';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/shop/ProductCard';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Bed, Armchair, Baby, Palette, Bath, ToyBrick, Truck, Shield, RotateCcw, MessageCircle, ArrowRight } from 'lucide-react';

const categories = [
  { name: 'Camas y Cunas', slug: 'camas-cunas', Icon: Bed },
  { name: 'Sillas Altas', slug: 'sillas-altas', Icon: Armchair },
  { name: 'Carritos', slug: 'carritos', Icon: Baby },
  { name: 'Decoracion', slug: 'decoracion', Icon: Palette },
  { name: 'Banos', slug: 'banos', Icon: Bath },
  { name: 'Juguetes', slug: 'juguetes', Icon: ToyBrick },
];

const trustBadges = [
  { Icon: Truck, title: 'Envio gratis', desc: 'En pedidos +S/150' },
  { Icon: Shield, title: 'Garantia', desc: 'Hasta 12 meses' },
  { Icon: RotateCcw, title: 'Devoluciones', desc: 'En 30 dias' },
  { Icon: MessageCircle, title: 'Soporte 24/7', desc: 'WhatsApp' },
];

export default function HomePage() {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/v1/products?limit=8')
      .then(r => r.json())
      .then(data => {
        if (data.data) setProducts(data.data);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 pb-20 md:pb-0">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gray-950">
          <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'url(https://i.ibb.co/kVhw0H2H/Products-decorative-flyer-webpage-2-K-202607111423.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-950/90 via-gray-950/70 to-gray-950/50" />
          <div className="container-wide relative z-10 py-20 md:py-32">
            <div className="max-w-2xl">
              <p className="text-brand-400 text-sm font-medium tracking-wide uppercase mb-4">AdriSu Kids</p>
              <h1 className="text-display-lg text-white">
                Muebles para bebes
                <span className="text-brand-400"> con amor</span>
              </h1>
              <p className="mt-5 text-lg text-gray-400 max-w-md leading-relaxed">
                Todo lo que tu bebe necesita: camas, sillas, carritos y decoracion. Calidad premium en todo el Peru.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link href="/tienda" className="btn-primary gap-2">
                  Ver catalogo
                  <ArrowRight size={16} />
                </Link>
                <Link href="/tienda?categoria=camas-cunas" className="btn-secondary">
                  Camas y Cunas
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="section">
          <div className="container-wide">
            <div className="text-center mb-12">
              <h2 className="text-display-sm text-gray-900">Categorias</h2>
              <p className="mt-2 text-gray-500">Explora nuestro catalogo</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {categories.map((cat) => (
                <Link key={cat.slug} href={`/tienda?categoria=${cat.slug}`}
                  className="group flex flex-col items-center p-5 rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-elevated transition-all duration-200">
                  <div className="w-12 h-12 bg-gray-50 group-hover:bg-brand-50 rounded-xl flex items-center justify-center transition-colors">
                    <cat.Icon size={22} className="text-gray-600 group-hover:text-brand-600 transition-colors" strokeWidth={1.5} />
                  </div>
                  <h3 className="mt-3 text-sm font-medium text-gray-900 text-center">{cat.name}</h3>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="section bg-gray-50/50">
          <div className="container-wide">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="text-display-sm text-gray-900">Destacados</h2>
                <p className="mt-2 text-gray-500">Los mas elegidos por nuestros clientes</p>
              </div>
              <Link href="/tienda" className="hidden md:flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                Ver todo <ArrowRight size={14} />
              </Link>
            </div>

            {products.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {products.map((p) => (
                  <ProductCard
                    key={p.id}
                    id={p.id}
                    name={p.name}
                    slug={p.slug}
                    price={p.price}
                    compareAtPrice={p.compareAtPrice}
                    finalPrice={p.finalPrice}
                    discountPercent={p.discountPercent}
                    image={p.images?.[0]}
                    category={p.category?.name}
                    stock={p.stock}
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-3">
                    <div className="skeleton aspect-square rounded-2xl" />
                    <div className="skeleton h-3 w-1/3 rounded" />
                    <div className="skeleton h-4 w-2/3 rounded" />
                    <div className="skeleton h-4 w-1/4 rounded" />
                  </div>
                ))}
              </div>
            )}

            <Link href="/tienda" className="md:hidden flex items-center justify-center gap-1 mt-8 text-sm font-medium text-gray-600 hover:text-gray-900">
              Ver todos los productos <ArrowRight size={14} />
            </Link>
          </div>
        </section>

        {/* Trust Badges */}
        <section className="section">
          <div className="container-wide">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {trustBadges.map((badge) => (
                <div key={badge.title} className="text-center">
                  <div className="w-12 h-12 mx-auto bg-gray-50 rounded-xl flex items-center justify-center mb-3">
                    <badge.Icon size={20} className="text-gray-600" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900">{badge.title}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">{badge.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
