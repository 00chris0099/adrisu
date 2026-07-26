'use client';

import Link from 'next/link';
import { Package } from 'lucide-react';

interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number | null;
  finalPrice?: number;
  discountPercent?: number;
  image?: string;
  category?: string;
  stock?: number;
  tags?: string[];
}

export default function ProductCard({
  name,
  slug,
  price,
  compareAtPrice,
  finalPrice,
  discountPercent,
  image,
  category,
  stock,
}: ProductCardProps) {
  const displayPrice = finalPrice ?? price;
  const showDiscount = discountPercent && discountPercent > 0 && displayPrice < price;

  return (
    <Link href={`/producto/${slug}`} className="group block">
      <div className="product-image relative overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package size={32} className="text-gray-200" />
          </div>
        )}

        {/* Discount badge */}
        {showDiscount && (
          <div className="absolute top-3 left-3">
            <span className="badge-sale">-{discountPercent}%</span>
          </div>
        )}

        {/* Low stock */}
        {stock !== undefined && stock <= 5 && stock > 0 && (
          <div className="absolute top-3 right-3">
            <span className="badge-stock">Ultimas {stock}</span>
          </div>
        )}
      </div>

      <div className="mt-3 px-0.5">
        {category && (
          <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-0.5">{category}</p>
        )}
        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-brand-600 transition-colors">
          {name}
        </h3>
        <div className="flex items-center gap-2 mt-1.5">
          {showDiscount && (
            <span className="price-original">S/ {price}</span>
          )}
          <span className={showDiscount ? 'price-sale' : 'price'}>S/ {displayPrice}</span>
        </div>
        {stock === 0 && (
          <span className="text-xs text-red-500 font-medium mt-1 block">Agotado</span>
        )}
      </div>
    </Link>
  );
}
