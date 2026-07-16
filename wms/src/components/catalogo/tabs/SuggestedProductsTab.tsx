'use client';

import { useState, useEffect, useRef } from 'react';
import { Package, Plus, X, Loader2, Search, Image } from 'lucide-react';

interface SuggestedProduct {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  type: 'existing' | 'custom';
}

interface ProductOption {
  id: string;
  name: string;
  price: number;
  imageUrl: string | null;
}

interface SuggestedProductsTabProps {
  productId: string;
}

export default function SuggestedProductsTab({ productId }: SuggestedProductsTabProps) {
  const [suggestedProducts, setSuggestedProducts] = useState<SuggestedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'existing' | 'custom'>('existing');

  // Existing product search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ProductOption[]>([]);
  const [searching, setSearching] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Custom product form
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newImageUrl, setNewImageUrl] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);

  useEffect(() => {
    if (!productId) {
      setLoading(false);
      return;
    }
    fetch(`/api/v1/suggested-products?product_id=${productId}`)
      .then(r => r.json())
      .then(data => {
        if (data.data) {
          setSuggestedProducts(data.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [productId]);

  const searchProducts = (query: string) => {
    setSearchQuery(query);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    searchTimeout.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/v1/products?q=${encodeURIComponent(query)}&limit=10`);
        const data = await res.json();
        const items = data.data?.items || data.data || [];
        setSearchResults(items.map((p: any) => ({
          id: p.id,
          name: p.name,
          price: Number(p.price),
          imageUrl: p.images?.[0] || null,
        })));
      } catch {
        setSearchResults([]);
      }
      setSearching(false);
    }, 300);
  };

  const addExistingProduct = async (product: ProductOption) => {
    setSaving(true);
    try {
      const res = await fetch('/api/v1/suggested-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: productId,
          linked_product_id: product.id,
          name: product.name,
          description: null,
          price: product.price,
          imageUrl: product.imageUrl,
          type: 'existing',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.data) {
          setSuggestedProducts(prev => [...prev, data.data]);
        }
        setSearchQuery('');
        setSearchResults([]);
        setShowAddForm(false);
      }
    } catch (err) {
      console.error('Failed to add suggested product:', err);
    }
    setSaving(false);
  };

  const addCustomProduct = async () => {
    if (!newName.trim() || !newPrice) return;
    setSaving(true);
    try {
      const res = await fetch('/api/v1/suggested-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: productId,
          name: newName.trim(),
          description: newDescription.trim() || null,
          price: Number(newPrice),
          imageUrl: newImageUrl,
          type: 'custom',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.data) {
          setSuggestedProducts(prev => [...prev, data.data]);
        }
        setNewName('');
        setNewDescription('');
        setNewPrice('');
        setNewImageUrl(null);
        setShowAddForm(false);
      }
    } catch (err) {
      console.error('Failed to add suggested product:', err);
    }
    setSaving(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'suggested-products');
      const res = await fetch('/api/v1/upload', { method: 'POST', body: formData });
      if (res.ok) {
        const data = await res.json();
        setNewImageUrl(data.url);
      }
    } catch (err) {
      console.error('Error uploading image:', err);
    }
    setImageUploading(false);
  };

  const removeSuggested = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/suggested-products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSuggestedProducts(prev => prev.filter(p => p.id !== id));
      }
    } catch (err) {
      console.error('Failed to remove suggested product:', err);
    }
  };

  if (!productId) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Package size={32} className="mx-auto mb-2 text-gray-400" />
        <p className="text-sm">Guarda el producto primero para agregar productos sugeridos.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-300">Productos Sugeridos</h3>
          <p className="text-xs text-gray-500 mt-1">Aparecen en el checkout como opciones adicionales.</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition-colors"
        >
          <Plus size={14} />
          Agregar
        </button>
      </div>

      {showAddForm && (
        <div className="bg-gray-800 rounded-xl p-4 space-y-3">
          {/* Tabs */}
          <div className="flex gap-1 bg-gray-700/50 rounded-lg p-0.5">
            <button
              onClick={() => setActiveTab('existing')}
              className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'existing'
                  ? 'bg-gray-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Producto existente
            </button>
            <button
              onClick={() => setActiveTab('custom')}
              className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'custom'
                  ? 'bg-gray-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Crear nuevo
            </button>
          </div>

          {activeTab === 'existing' ? (
            <div className="space-y-3">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="Buscar producto..."
                  value={searchQuery}
                  onChange={(e) => searchProducts(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {searching && (
                <div className="flex items-center justify-center py-4">
                  <Loader2 size={16} className="animate-spin text-gray-400" />
                </div>
              )}

              {!searching && searchResults.length > 0 && (
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {searchResults.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => addExistingProduct(p)}
                      disabled={saving}
                      className="w-full flex items-center gap-3 p-2 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors text-left disabled:opacity-50"
                    >
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt="" className="w-8 h-8 rounded-md object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-md bg-gray-600 flex items-center justify-center">
                          <Package size={12} className="text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-white truncate">{p.name}</p>
                        <p className="text-[10px] text-gray-400">S/ {p.price.toFixed(2)}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {!searching && searchQuery && searchResults.length === 0 && (
                <p className="text-xs text-gray-500 text-center py-2">Sin resultados</p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Nombre del producto"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <input
                type="text"
                placeholder="Descripcion (opcional)"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">S/</span>
                <input
                  type="number"
                  placeholder="Precio"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Imagen</label>
                <div className="flex items-center gap-3">
                  {newImageUrl ? (
                    <div className="relative">
                      <img src={newImageUrl} alt="" className="w-16 h-16 rounded-lg object-cover" />
                      <button
                        onClick={() => setNewImageUrl(null)}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ) : (
                    <label className="w-16 h-16 rounded-lg bg-gray-700 border border-dashed border-gray-500 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-600 transition-colors">
                      {imageUploading ? (
                        <Loader2 size={16} className="animate-spin text-gray-400" />
                      ) : (
                        <>
                          <Image size={16} className="text-gray-500" />
                          <span className="text-[10px] text-gray-500 mt-0.5">Subir</span>
                        </>
                      )}
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setNewName('');
                    setNewDescription('');
                    setNewPrice('');
                    setNewImageUrl(null);
                  }}
                  className="flex-1 px-3 py-2 text-sm text-gray-400 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={addCustomProduct}
                  disabled={!newName.trim() || !newPrice || saving}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 disabled:opacity-50 transition-colors"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                  Guardar
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 size={20} className="animate-spin text-gray-400" />
        </div>
      ) : suggestedProducts.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Package size={24} className="mx-auto mb-2 text-gray-400" />
          <p className="text-xs">No hay productos sugeridos. Agrega uno arriba.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {suggestedProducts.map((sp) => (
            <div
              key={sp.id}
              className="flex items-center gap-3 p-3 bg-gray-800 rounded-xl"
            >
              {sp.imageUrl ? (
                <img src={sp.imageUrl} alt="" className="w-12 h-12 rounded-lg object-cover" />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-gray-700 flex items-center justify-center">
                  <Package size={16} className="text-gray-500" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{sp.name}</p>
                {sp.description && (
                  <p className="text-xs text-gray-400 truncate">{sp.description}</p>
                )}
                <p className="text-xs font-bold text-green-400 mt-0.5">S/ {Number(sp.price).toFixed(2)}</p>
              </div>
              <span className={`text-[10px] px-1.5 py-0.5 rounded shrink-0 ${
                sp.type === 'custom'
                  ? 'bg-purple-500/20 text-purple-400'
                  : 'bg-blue-500/20 text-blue-400'
              }`}>
                {sp.type === 'custom' ? 'Custom' : 'Existente'}
              </span>
              <button
                onClick={() => removeSuggested(sp.id)}
                className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-colors shrink-0"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
