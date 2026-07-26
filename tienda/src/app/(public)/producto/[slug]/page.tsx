'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, Package, ArrowLeft } from 'lucide-react';
import dynamic from 'next/dynamic';
import Navbar from '@/components/layout/Navbar';

const CheckoutModal = dynamic(() => import('@/components/checkout/CheckoutModal'), { ssr: false });
const LandingPageRenderer = dynamic(() => import('@/components/landing/LandingPageRenderer'), { ssr: false });

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [product, setProduct] = useState<any>(null);
  const [landingBlocks, setLandingBlocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      try {
        const res = await fetch(`/api/v1/products/${params.slug}`);
        if (res.ok) {
          const data = await res.json();
          if (data.data) {
            const p = data.data;
            setProduct({
              id: p.id,
              name: p.name,
              slug: p.slug,
              price: p.price || 0,
              compareAtPrice: p.compareAtPrice || null,
              finalPrice: p.finalPrice || p.price || 0,
              discountPercent: p.discountPercent || 0,
              description: p.description || '',
              shortDescription: p.shortDescription || '',
              brand: p.brand || '',
              stock: p.stock || 0,
              category: p.category?.name || '',
              images: p.images || [],
              ctaText: p.ctaText || 'Lo quiero ahora!',
              crossSellProductIds: p.crossSellProductIds || [],
              height: p.height,
              width: p.width,
              depth: p.depth,
              color: p.color || '',
              materials: p.materials || [],
              recommendedAge: p.recommendedAge || '',
              warrantyDays: p.warrantyDays,
              originCountry: p.originCountry || '',
              weight: p.weight,
              weightUnit: p.weightUnit || 'kg',
              tags: p.tags || [],
              discountPopup: p.discountPopup || null,
            });

            try {
              const landingRes = await fetch(`/api/v1/landings/${p.slug}`);
              if (landingRes.ok) {
                const landingData = await landingRes.json();
                setLandingBlocks(landingData.data?.blocks || []);
              }
            } catch {}
          }
        }
      } catch {}
      setLoading(false);
    }
    fetchProduct();
  }, [params.slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
          <Package size={24} className="text-gray-300" />
        </div>
        <h1 className="text-lg font-semibold text-gray-900 mb-1">Producto no encontrado</h1>
        <p className="text-sm text-gray-500 mb-4">El producto que buscas no existe o fue removido.</p>
        <Link href="/tienda" className="btn-primary">Ver productos</Link>
      </div>
    );
  }

  const mainPrice = Number(product.price) || 0;
  const fp = Number(product.finalPrice) || mainPrice;
  const discPct = product.discountPercent || 0;
  const showStrike = discPct > 0 && fp < mainPrice;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 container-wide py-4 md:py-8">
        {/* Breadcrumb */}
        <nav className="hidden md:flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link href="/" className="hover:text-gray-900 transition-colors">Inicio</Link>
          <ChevronRight size={12} />
          <Link href="/tienda" className="hover:text-gray-900 transition-colors">Tienda</Link>
          {product.category && (
            <>
              <ChevronRight size={12} />
              <span className="text-gray-600">{product.category}</span>
            </>
          )}
          <ChevronRight size={12} />
          <span className="text-gray-900 truncate max-w-[200px]">{product.name}</span>
        </nav>

        {/* Mobile back */}
        <Link href="/tienda" className="md:hidden flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-4 transition-colors">
          <ArrowLeft size={14} /> Volver a tienda
        </Link>

        {/* Product Grid */}
        <div className="grid md:grid-cols-2 gap-8 md:gap-16">
          {/* Image Gallery */}
          <div className="space-y-3">
            <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden">
              {product.images.length > 0 ? (
                <img
                  src={product.images[selectedImage] || product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package size={48} className="text-gray-200" />
                </div>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto no-scrollbar">
                {product.images.map((img: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors ${
                      selectedImage === i ? 'border-gray-900' : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="md:sticky md:top-24 md:self-start">
            {product.brand && (
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">{product.brand}</p>
            )}
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">{product.name}</h1>

            {/* Price */}
            <div className="mb-5">
              <div className="flex items-baseline gap-3 flex-wrap">
                {showStrike && <span className="price-original text-lg">S/ {mainPrice}</span>}
                <span className={showStrike ? 'price-sale text-3xl' : 'price text-3xl'}>S/ {fp}</span>
                {discPct > 0 && <span className="badge-sale">-{discPct}%</span>}
              </div>
            </div>

            {/* Tags */}
            {product.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-5">
                {product.tags.map((tag: string) => (
                  <span key={tag} className="text-xs px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg">{tag}</span>
                ))}
              </div>
            )}

            {/* Description */}
            {product.description && (
              <div className="mb-6">
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{product.description}</p>
              </div>
            )}

            {/* CTA */}
            <button onClick={() => setCheckoutOpen(true)} className="btn-brand w-full py-3.5 text-base">
              {product.ctaText}
            </button>

            {/* Stock */}
            {product.stock <= 5 && product.stock > 0 && (
              <p className="text-xs text-amber-600 font-medium mt-2 text-center">Solo quedan {product.stock} unidades</p>
            )}
            {product.stock === 0 && (
              <p className="text-xs text-red-500 font-medium mt-2 text-center">Agotado</p>
            )}

            {/* Specs */}
            <div className="mt-8 border-t border-gray-100 pt-6">
              {(product.height || product.width || product.depth || product.weight || product.color || product.recommendedAge || product.warrantyDays || product.originCountry || product.materials.length > 0) && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Especificaciones</h3>
                  <dl className="space-y-2">
                    {product.height && (
                      <div className="flex justify-between text-sm">
                        <dt className="text-gray-500">Alto</dt>
                        <dd className="text-gray-900">{product.height} cm</dd>
                      </div>
                    )}
                    {product.width && (
                      <div className="flex justify-between text-sm">
                        <dt className="text-gray-500">Ancho</dt>
                        <dd className="text-gray-900">{product.width} cm</dd>
                      </div>
                    )}
                    {product.depth && (
                      <div className="flex justify-between text-sm">
                        <dt className="text-gray-500">Profundidad</dt>
                        <dd className="text-gray-900">{product.depth} cm</dd>
                      </div>
                    )}
                    {product.weight && (
                      <div className="flex justify-between text-sm">
                        <dt className="text-gray-500">Peso</dt>
                        <dd className="text-gray-900">{product.weight} {product.weightUnit}</dd>
                      </div>
                    )}
                    {product.color && (
                      <div className="flex justify-between text-sm">
                        <dt className="text-gray-500">Color</dt>
                        <dd className="text-gray-900">{product.color}</dd>
                      </div>
                    )}
                    {product.materials.length > 0 && (
                      <div className="flex justify-between text-sm">
                        <dt className="text-gray-500">Materiales</dt>
                        <dd className="text-gray-900">{product.materials.join(', ')}</dd>
                      </div>
                    )}
                    {product.recommendedAge && (
                      <div className="flex justify-between text-sm">
                        <dt className="text-gray-500">Edad recomendada</dt>
                        <dd className="text-gray-900">{product.recommendedAge}</dd>
                      </div>
                    )}
                    {product.warrantyDays && (
                      <div className="flex justify-between text-sm">
                        <dt className="text-gray-500">Garantia</dt>
                        <dd className="text-gray-900">{product.warrantyDays} dias</dd>
                      </div>
                    )}
                    {product.originCountry && (
                      <div className="flex justify-between text-sm">
                        <dt className="text-gray-500">Origen</dt>
                        <dd className="text-gray-900">{product.originCountry}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Landing Page Blocks */}
      {landingBlocks.length > 0 && (
        <div className="border-t border-gray-100">
          <LandingPageRenderer blocks={landingBlocks} />
        </div>
      )}

      {/* Checkout Modal */}
      {checkoutOpen && (
        <CheckoutModal open={checkoutOpen} onClose={() => setCheckoutOpen(false)} product={product} />
      )}
    </div>
  );
}
