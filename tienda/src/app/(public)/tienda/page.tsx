'use client';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/shop/ProductCard';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { Search, X } from 'lucide-react';
import { expandSearch } from '@/lib/search-synonyms';

const defaultCategories = [{ name: 'Todos', slug: '' }];

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <div className="skeleton aspect-square rounded-2xl" />
          <div className="skeleton h-3 w-1/3 rounded" />
          <div className="skeleton h-4 w-2/3 rounded" />
          <div className="skeleton h-4 w-1/4 rounded" />
        </div>
      ))}
    </div>
  );
}

function TiendaContent() {
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get('categoria') || '';
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc' | 'name'>('newest');
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>(defaultCategories);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('/api/v1/categories');
        if (res.ok) {
          const data = await res.json();
          const cats = data.data || data || [];
          if (Array.isArray(cats) && cats.length > 0) {
            setCategories([{ name: 'Todos', slug: '' }, ...cats.map((c: any) => ({ name: c.name, slug: c.slug }))]);
          }
        }
      } catch {}
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const params = new URLSearchParams({ limit: '50' });
        if (activeCategory) params.set('category', activeCategory);
        if (search) params.set('q', search);
        const res = await fetch(`/api/v1/products?${params}`);
        if (res.ok) {
          const data = await res.json();
          if (data.data?.length) setProducts(data.data);
        }
      } catch {}
      setLoading(false);
    }
    fetchProducts();
  }, [activeCategory, search]);

  let filtered = products;
  if (activeCategory) filtered = filtered.filter((p) => p.category?.slug === activeCategory || p.categoryId === activeCategory);
  if (search) {
    const terms = expandSearch(search);
    const q = search.toLowerCase();
    filtered = filtered.filter((p) => {
      const name = p.name.toLowerCase();
      return terms.some((t) => name.includes(t)) || name.includes(q);
    });
  }

  switch (sortBy) {
    case 'price-asc': filtered.sort((a, b) => (a.price || 0) - (b.price || 0)); break;
    case 'price-desc': filtered.sort((a, b) => (b.price || 0) - (a.price || 0)); break;
    case 'name': filtered.sort((a, b) => a.name.localeCompare(b.name)); break;
    default: break;
  }

  const activeCategoryName = activeCategory
    ? categories.find((c) => c.slug === activeCategory)?.name || 'Tienda'
    : 'Todos los productos';

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container-wide py-8 pb-24 md:pb-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-display-sm text-gray-900">{activeCategoryName}</h1>
          <p className="mt-1 text-sm text-gray-500">{filtered.length} productos</p>
        </div>

        {/* Category pills */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6 pb-1">
          {categories.map((cat) => (
            <Link key={cat.slug} href={cat.slug ? `/tienda?categoria=${cat.slug}` : '/tienda'}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeCategory === cat.slug || (!activeCategory && !cat.slug)
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>
              {cat.name}
            </Link>
          ))}
        </div>

        {/* Search + Sort */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar productos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-clean pl-9 pr-8"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={14} />
              </button>
            )}
          </div>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)} className="select-clean sm:w-48">
            <option value="newest">Mas recientes</option>
            <option value="price-asc">Menor precio</option>
            <option value="price-desc">Mayor precio</option>
            <option value="name">Nombre A-Z</option>
          </select>
        </div>

        {/* Grid */}
        {loading ? (
          <SkeletonGrid />
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filtered.map((p) => (
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
                tags={p.tags}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
              <Search size={24} className="text-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-900 mb-1">No se encontraron productos</p>
            <p className="text-sm text-gray-500 mb-4">Intenta con otros terminos</p>
            <Link href="/tienda" className="text-sm font-medium text-brand-600 hover:text-brand-700">Ver todos</Link>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default function TiendaPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
      </div>
    }>
      <TiendaContent />
    </Suspense>
  );
}
