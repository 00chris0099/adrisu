'use client';

import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle, ShoppingCart, Package, Truck, CreditCard, MapPin, Phone, ShieldCheck, MessageCircle, ChevronDown, Plus, Minus, X, Check, Tag, Layers } from 'lucide-react';
import AddressAutocomplete from '@/components/ui/AddressAutocomplete';
import SuggestedProducts from '@/components/checkout/SuggestedProducts';
import { isValidPeruPhone, isValidEmail } from '@/lib/ubigeo';

interface ProductOffer {
  id: string;
  productId: string;
  name: string;
  description: string | null;
  type: string; // "quantity" | "addon"
  quantity: number;
  price: number | string;
  linkedProductId: string | null;
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
}

/**
 * RF-27: Save abandoned checkout when user leaves page
 */
function useAbandonedCheckout(form: any, items: any[], total: number) {
  const savedRef = useRef(false);

  useEffect(() => {
    const saveAbandoned = async () => {
      if (savedRef.current || items.length === 0) return;
      savedRef.current = true;

      try {
        await fetch('/api/v1/abandoned-checkouts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: sessionStorage.getItem('sessionId') || Date.now().toString(),
            email: form.email,
            phone: form.phone,
            name: form.name,
            items: items.map(i => ({
              productId: i.productId,
              sku: i.sku,
              name: i.name,
              price: i.price,
              quantity: i.quantity,
            })),
            subtotal: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
            total,
            shippingAddress: {
              department: form.department,
              province: form.province,
              district: form.district,
              address: form.address,
              reference: form.reference,
            },
            paymentMethod: form.paymentMethod,
          }),
        });
      } catch (err) {
        console.error('Failed to save abandoned checkout:', err);
      }
    };

    const handleBeforeUnload = () => {
      if (items.length > 0 && !savedRef.current) {
        navigator.sendBeacon('/api/v1/abandoned-checkouts', new Blob([
          JSON.stringify({
            sessionId: sessionStorage.getItem('sessionId') || Date.now().toString(),
            email: form.email,
            phone: form.phone,
            name: form.name,
            items: items.map(i => ({
              productId: i.productId,
              sku: i.sku,
              name: i.name,
              price: i.price,
              quantity: i.quantity,
            })),
            subtotal: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
            total,
            shippingAddress: {
              department: form.department,
              province: form.province,
              district: form.district,
              address: form.address,
              reference: form.reference,
            },
            paymentMethod: form.paymentMethod,
          })
        ], { type: 'application/json' }));
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [form, items, total]);
}

// Ubigeo simplificado - departamentos principales de Peru
const UBIGEO: Record<string, Record<string, string[]>> = {
  'Lima': { 'Lima': ['Miraflores', 'San Isidro', 'Jesus Maria', 'Magdalena', 'San Borja', 'Surco', 'San Martin de Porres', 'Comas', 'Los Olivos', 'Rimac', 'Cercado', 'Pueblo Libre', 'Brena', 'La Victoria', 'San Luis', 'El Agustino', 'Ate', 'Santa Anita', 'Chorrillos', 'San Juan de Miraflores', 'Villa Maria del Triunfo', 'Villa El Salvador', 'San Juan de Lurigancho', 'Carabayllo', 'Puente Piedra', 'Ancón', 'Santa Rosa'], 'Cañete': ['San Vicente de Cañete', 'Mala', 'Chincha Alta', 'Pisco'] },
  'Arequipa': { 'Arequipa': ['Cercado', 'Cayma', 'Cerro Colorado', 'Characato', 'Chiguata', 'Jacobo Hunter', 'La Joya', 'Mariano Melgar', 'Miraflores', 'Mollebaya', 'Paucarpata', 'Pocsi', 'Polobaya', 'Quequeña', 'Sabandia', 'Sachaca', 'San Juan de Siguas', 'San Juan de Tarucani', 'Santa Isabel de Siguas', 'Santa Rita de Siguas', 'Socabaya', 'Tiabaya', 'Uchumayo', 'Vítor', 'Yanahuara', 'Yarabamba', 'Yura'] },
  'Cusco': { 'Cusco': ['Cercado', 'Wanchaq', 'San Sebastian', 'San Jeronimo', 'Santiago', 'Saylla', 'Huancaro'] },
  'La Libertad': { 'Trujillo': ['Trujillo', 'Huanchaco', 'Lanchipampa', 'La Esperanza', 'Flores', 'Salaverry', 'Víctor Larco Herrera'], 'Chiclayo': ['Chiclayo', 'Pimentel', 'Reque', 'SANTA ROSA', 'Saña', 'Cañaveral'] },
  'Piura': { 'Piura': ['Piura', 'Castilla', 'Catacaos', 'La Arena', 'La Union', 'Las Lomas', 'Tambo Grande'] },
  'Lambayeque': { 'Chiclayo': ['Chiclayo', 'Pimentel', 'Reque'], 'Ferñafe': ['Ferñafe', 'Cañaris', 'Incahuasi'] },
  'Ica': { 'Ica': ['Ica', 'La Tinguiña', 'Los Aquijes', 'Ocucaje', 'Pachacutec', 'Parcona', 'Pueblo Nuevo', 'Salas', 'San Jose de Los Molinos', 'San Juan Bautista', 'Santiago', 'Subtanjalla', 'Tate', 'Yauca del Rosario'] },
  'Junin': { 'Huancayo': ['Huancayo', 'Chilca', 'Chongos Alto', 'Chupuro', 'Colca', 'Comas', 'El Tambo', 'Huancancpco', 'Huancayo', 'Huacrapuquio', 'Hualhuas', 'Huancan', 'Huasicancha', 'Huayucachi', 'Ingenio', 'Pariahuanca', 'Pilcomayo', 'Pucara', 'Quichuas', 'Quilcas', 'San Agustin', 'San Jeronimo de Tunan', 'San Pedro de Saño', 'Santoyo', 'Sapallanga', 'Viques', 'Yacus', 'Yanacancha'] },
};

interface FormErrors { [key: string]: string; }

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clearCart, updateQuantity, removeItem } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [offers, setOffers] = useState<any[]>([]);
  const [selectedOffers, setSelectedOffers] = useState<string[]>([]);
  const [productOffers, setProductOffers] = useState<Record<string, ProductOffer[]>>({});
  const [selectedProductOffers, setSelectedProductOffers] = useState<Record<string, string>>({});
  const [linkedProducts, setLinkedProducts] = useState<Record<string, any>>({});
  const [selectedSuggestedProducts, setSelectedSuggestedProducts] = useState<any[]>([]);
  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    department: '', province: '', district: '', address: '', reference: '',
    paymentMethod: 'contraentrega' as string,
  });

  // RF-27: Track abandoned checkout
  useAbandonedCheckout(form, items, total());

  useEffect(() => {
    fetch('/api/v1/offers').then(r => r.json()).then(d => setOffers(d.data || [])).catch(() => {});
  }, []);

  // Fetch per-product offers for each cart item
  useEffect(() => {
    const fetchAll = async () => {
      const results: Record<string, ProductOffer[]> = {};
      const linkedIdsSet = new Set<string>();
      for (const item of items) {
        if (!item.productId) continue;
        try {
          const res = await fetch(`/api/v1/offers?product_id=${item.productId}`);
          const data = await res.json();
          if (data.data && data.data.length > 0) {
            results[item.productId] = data.data;
            // Collect linked product IDs for addon offers
            data.data.forEach((o: ProductOffer) => {
              if (o.type === 'addon' && o.linkedProductId) linkedIdsSet.add(o.linkedProductId);
            });
          }
        } catch {}
      }
      setProductOffers(results);
      // Set default selected offers to 'main' for each product
      setSelectedProductOffers(prev => {
        const next = { ...prev };
        for (const item of items) {
          if (item.productId && !next[item.productId]) next[item.productId] = 'main';
        }
        return next;
      });
      // Fetch linked products
      if (linkedIdsSet.size > 0) {
        try {
          const res = await fetch(`/api/v1/products?limit=50`);
          const data = await res.json();
          const allProducts = Array.isArray(data.data) ? data.data : [];
          const map: Record<string, any> = {};
          allProducts.forEach((p: any) => { map[p.id] = p; });
          setLinkedProducts(map);
        } catch {}
      }
    };
    if (items.length > 0) fetchAll();
  }, [items]);

  // Get unique product IDs from cart items
  const productIds = [...new Set(items.map(item => item.productId).filter(Boolean))];

  // Handle suggested products
  const handleSelectSuggested = (product: any) => {
    setSelectedSuggestedProducts(prev => [...prev, product]);
  };

  const handleDeselectSuggested = (productId: string) => {
    setSelectedSuggestedProducts(prev => prev.filter(p => p.id !== productId));
  };

  const suggestedTotal = selectedSuggestedProducts.reduce((sum, p) => sum + p.price, 0);

  // Calculate per-product offer-adjusted prices
  const getItemPrice = (item: any): number => {
    const offerId = selectedProductOffers[item.productId];
    if (!offerId || offerId === 'main') return item.price;
    const productOfferList = productOffers[item.productId] || [];
    const offer = productOfferList.find((o: ProductOffer) => o.id === offerId);
    if (!offer) return item.price;
    if (offer.type === 'quantity') return Number(offer.price) || 0;
    if (offer.type === 'addon') {
      const linkedPrice = Number(linkedProducts[offer.linkedProductId || '']?.price) || 0;
      return item.price + (Number(offer.price) || 0);
    }
    return item.price;
  };

  const getItemQuantity = (item: any): number => {
    const offerId = selectedProductOffers[item.productId];
    if (!offerId || offerId === 'main') return item.quantity;
    const productOfferList = productOffers[item.productId] || [];
    const offer = productOfferList.find((o: ProductOffer) => o.id === offerId);
    if (offer?.type === 'quantity') return offer.quantity * item.quantity;
    return item.quantity;
  };

  // Get addon linked items from selected offers
  const addonItems = items.reduce((acc: any[], item) => {
    const offerId = selectedProductOffers[item.productId];
    if (!offerId || offerId === 'main') return acc;
    const productOfferList = productOffers[item.productId] || [];
    const offer = productOfferList.find((o: ProductOffer) => o.id === offerId);
    if (offer?.type === 'addon' && offer.linkedProductId && linkedProducts[offer.linkedProductId]) {
      const lp = linkedProducts[offer.linkedProductId];
      acc.push({
        productId: lp.id,
        name: lp.name,
        price: Number(offer.price) || 0,
        image: lp.images?.[0] || '',
        quantity: item.quantity,
        isAddon: true,
        parentProductId: item.productId,
      });
    }
    return acc;
  }, []);

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!form.name.trim()) e.name = 'Nombre requerido';
    if (!form.email.trim() || !isValidEmail(form.email)) e.email = 'Email invalido';
    if (!form.phone.trim() || !isValidPeruPhone(form.phone)) e.phone = 'Celular invalido (9 digitos, empieza con 9)';
    if (!form.department) e.department = 'Departamento requerido';
    if (!form.province) e.province = 'Provincia requerida';
    if (!form.district) e.district = 'Distrito requerido';
    if (!form.address.trim()) e.address = 'Direccion requerida';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (items.length === 0) { alert('Tu carrito esta vacio'); return; }
    if (!validate()) return;
    setLoading(true);
    try {
      const offerDiscount = selectedOffers.reduce((sum, oid) => {
        const o = offers.find((of: any) => of.id === oid);
        return sum + (o ? (subtotal * o.discountPercent / 100) : 0);
      }, 0);
      const finalTotal = subtotal + shipping - offerDiscount + suggestedTotal;

      const orderRes = await fetch('/api/v1/orders', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [
            ...items.map((i) => ({
              name: i.name,
              price: getItemPrice(i),
              quantity: getItemQuantity(i),
              productId: i.productId,
              sku: i.productId,
              offerId: selectedProductOffers[i.productId] || 'main',
            })),
            ...addonItems.map((a) => ({
              name: a.name,
              price: a.price,
              quantity: a.quantity,
              productId: a.productId,
              sku: `addon-${a.productId}`,
              isAddon: true,
              parentProductId: a.parentProductId,
            })),
            ...selectedSuggestedProducts.map((p) => ({ name: p.name, price: p.price, quantity: 1, productId: p.id, sku: `suggested-${p.id}`, isSuggested: true })),
          ],
          customer: { name: form.name, email: form.email, phone: form.phone },
          shipping: { department: form.department, province: form.province, district: form.district, address: form.address, reference: form.reference },
          paymentMethod: form.paymentMethod,
          suggestedProducts: selectedSuggestedProducts,
        }),
      });
      if (!orderRes.ok) throw new Error('Error');
      const orderData = await orderRes.json();
      const orderNumber = orderData.data.orderNumber;

      if (form.paymentMethod === 'mercadopago') {
        const mpRes = await fetch('/api/v1/payments/mercadopago', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: orderData.data.id, amount: finalTotal, currency: 'PEN' }),
        });
        if (mpRes.ok) {
          const mpData = await mpRes.json();
          if (mpData.success && mpData.data) {
            clearCart();
            const url = mpData.data.sandboxUrl || mpData.data.checkoutUrl;
            if (url && typeof url === 'string' && url.startsWith('http')) { window.location.href = url; return; }
          }
        }
      }

      clearCart();
      router.push(`/pedido?n=${orderNumber}`);
    } catch { alert('Error al procesar. Intenta de nuevo.'); }
    setLoading(false);
  };

  const subtotal = items.reduce((sum, item) => sum + getItemPrice(item) * item.quantity, 0) + addonItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal >= 150 ? 0 : 10;
  const offerDiscount = selectedOffers.reduce((sum, oid) => {
    const o = offers.find((of: any) => of.id === oid);
    return sum + (o ? (subtotal * o.discountPercent / 100) : 0);
  }, 0);
  const finalTotal = subtotal + shipping - offerDiscount + suggestedTotal;
  const departments = Object.keys(UBIGEO);
  const provinces = form.department ? Object.keys(UBIGEO[form.department] || {}) : [];
  const districts = (form.department && form.province) ? (UBIGEO[form.department]?.[form.province] || []) : [];

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <header className="bg-white border-b border-gray-100"><div className="max-w-7xl mx-auto px-4 h-14 flex items-center"><Link href="/"><img src="/images/logo.png" alt="AdriSu Kids" className="h-9 w-auto" /></Link></div></header>
        <main className="flex-1 flex flex-col items-center justify-center px-4">
          <ShoppingCart size={48} className="text-gray-300 mb-4" />
          <h1 className="text-xl font-bold mb-2">Tu carrito esta vacio</h1>
          <p className="text-gray-500 mb-6">Agrega productos para continuar</p>
          <Link href="/tienda" className="bg-green-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-green-700">Ir a la tienda</Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100"><div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/"><img src="/images/logo.png" alt="AdriSu Kids" className="h-9 w-auto" /></Link>
        <span className="text-sm text-gray-500">{items.length} productos en tu pedido</span>
      </div></header>

      <main className="max-w-5xl mx-auto px-4 py-6 md:py-10">
        <h1 className="text-2xl font-bold mb-6">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Main Form - 3 cols */}
          <div className="lg:col-span-3 space-y-5">

            {/* Section 1: Product Summary */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <h2 className="font-semibold flex items-center gap-2 mb-4"><Package size={18} className="text-green-600" /> Tu pedido</h2>
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.productId} className="flex gap-3 items-center">
                    <img src={item.image} alt="" className="w-14 h-14 rounded-xl object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.name}</p>
                      <div className="flex items-center gap-2">
                        {item.compareAtPrice && Number(item.compareAtPrice) > item.price && (
                          <span className="text-xs text-gray-400 line-through">S/ {item.compareAtPrice}</span>
                        )}
                        <p className="text-xs text-gray-500">S/ {item.price} c/u</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center"><Minus size={12} /></button>
                      <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center"><Plus size={12} /></button>
                    </div>
                    <span className="text-sm font-semibold ml-2">S/ {item.price * item.quantity}</span>
                    <button onClick={() => removeItem(item.productId)} className="text-gray-400 hover:text-red-500 ml-1"><X size={14} /></button>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 2: Configurable Offers */}
            {offers.length > 0 && (
              <div className="bg-white rounded-2xl p-5 border border-gray-100">
                <h2 className="font-semibold flex items-center gap-2 mb-3"><ShieldCheck size={18} className="text-green-600" /> Ofertas disponibles</h2>
                <div className="space-y-2">
                  {offers.map((offer: any) => (
                    <label key={offer.id} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${selectedOffers.includes(offer.id) ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
                      <input type="checkbox" checked={selectedOffers.includes(offer.id)}
                        onChange={(e) => setSelectedOffers(e.target.checked ? [...selectedOffers, offer.id] : selectedOffers.filter((id) => id !== offer.id))}
                        className="w-4 h-4 text-green-600 rounded" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{offer.name}</p>
                        <p className="text-xs text-gray-500">{offer.description || `Min ${offer.minQuantity} unidades`}</p>
                      </div>
                      <span className="text-sm font-bold text-green-600">-{offer.discountPercent}%</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Section 3: Contact & Shipping Form */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 space-y-4">
              <h2 className="font-semibold flex items-center gap-2"><MapPin size={18} className="text-green-600" /> Datos de envio</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Nombre completo *</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={`w-full px-3 py-2.5 border rounded-xl text-sm ${errors.name ? 'border-red-300' : 'border-gray-200'}`} placeholder="Juan Perez" />
                  {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Celular *</label>
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={`w-full px-3 py-2.5 border rounded-xl text-sm ${errors.phone ? 'border-red-300' : 'border-gray-200'}`} placeholder="999123456" maxLength={9} />
                  {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">Email *</label>
                <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} type="email" className={`w-full px-3 py-2.5 border rounded-xl text-sm ${errors.email ? 'border-red-300' : 'border-gray-200'}`} placeholder="tu@email.com" />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Departamento *</label>
                  <select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value, province: '', district: '' })} className={`w-full px-3 py-2.5 border rounded-xl text-sm ${errors.department ? 'border-red-300' : 'border-gray-200'}`}>
                    <option value="">Seleccionar...</option>
                    {departments.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                  {errors.department && <p className="text-xs text-red-500 mt-1">{errors.department}</p>}
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Provincia *</label>
                  <select value={form.province} onChange={(e) => setForm({ ...form, province: e.target.value, district: '' })} disabled={!form.department} className={`w-full px-3 py-2.5 border rounded-xl text-sm ${errors.province ? 'border-red-300' : 'border-gray-200'}`}>
                    <option value="">Seleccionar...</option>
                    {provinces.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                  {errors.province && <p className="text-xs text-red-500 mt-1">{errors.province}</p>}
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Distrito *</label>
                  <select value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} disabled={!form.province} className={`w-full px-3 py-2.5 border rounded-xl text-sm ${errors.district ? 'border-red-300' : 'border-gray-200'}`}>
                    <option value="">Seleccionar...</option>
                    {districts.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                  {errors.district && <p className="text-xs text-red-500 mt-1">{errors.district}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">Direccion *</label>
                <AddressAutocomplete value={form.address} onChange={(v) => setForm({ ...form, address: v })} department={form.department} province={form.province} district={form.district} placeholder="Av. Ejemplo 123" error={errors.address} />
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">Referencia (opcional)</label>
                <input value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm" placeholder="Frente al parque" />
              </div>
            </div>

            {/* Section 4: Info */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <h2 className="font-semibold flex items-center gap-2 mb-3"><Package size={18} className="text-green-600" /> Informacion</h2>
              <p className="text-sm text-gray-500">Completa los datos de envio para continuar con tu pedido.</p>
            </div>

            {/* Section 4.5: Suggested Products */}
            <SuggestedProducts
              productIds={productIds}
              selectedProducts={selectedSuggestedProducts}
              onSelect={handleSelectSuggested}
              onDeselect={handleDeselectSuggested}
            />

            {/* Section 5: Info */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-sm text-amber-800 font-medium flex items-center gap-2"><Phone size={14} /> Pago contraentrega</p>
                <p className="text-xs text-amber-700 mt-1">Tu pedido sera confirmado y coordinado para entrega.</p>
              </div>
            </div>

            {/* Section 6: Confirm Button - Redirige a WhatsApp */}
            <button onClick={() => {
              if (items.length === 0) { alert('Tu carrito esta vacio'); return; }
              if (!validate()) return;

              const itemsList = items.map(i => {
                const price = getItemPrice(i);
                const qty = getItemQuantity(i);
                return `- ${i.name} x${qty} = S/ ${(price * qty).toFixed(2)}`;
              }).join('%0A');
              const addonList = addonItems.length > 0
                ? '%0A🎁 *Productos incluidos en oferta:*%0A' + addonItems.map(a => `- ${a.name} = S/ ${(a.price * a.quantity).toFixed(2)}`).join('%0A')
                : '';
              const suggestedList = selectedSuggestedProducts.length > 0
                ? '%0A📦 *Productos sugeridos:*%0A' + selectedSuggestedProducts.map(p => `- ${p.name} = S/ ${p.price.toFixed(2)}`).join('%0A')
                : '';
              const msg = `🛒 *Nuevo Pedido - AdriSu Kids*%0A%0A👤 *Cliente:* ${encodeURIComponent(form.name)}%0A📱 *Celular:* ${form.phone}%0A📧 *Email:* ${encodeURIComponent(form.email || 'No proporcionado')}%0A%0A📦 *Productos:*%0A${itemsList}${addonList}${suggestedList}%0A%0A💰 *Resumen:*%0A- Subtotal: S/ ${subtotal.toFixed(2)}%0A- Envio (aproximadamente): S/ ${shipping.toFixed(2)}%0A${offerDiscount > 0 ? `- Descuento: -S/ ${offerDiscount.toFixed(2)}%0A` : ''}${suggestedTotal > 0 ? `- Sugeridos: +S/ ${suggestedTotal.toFixed(2)}%0A` : ''}- *TOTAL: S/ ${finalTotal.toFixed(2)}*%0A%0A📍 *Direccion de envio:*%0A${encodeURIComponent(form.department)} - ${encodeURIComponent(form.province)} - ${encodeURIComponent(form.district)}%0A${encodeURIComponent(form.address)}%0ARef: ${encodeURIComponent(form.reference || 'Sin referencia')}`;
              window.open(`https://wa.me/51951308866?text=${msg}`, '_blank');
              clearCart();
            }} disabled={loading}
              className="w-full py-4 rounded-xl font-bold text-lg bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 flex items-center justify-center gap-2 transition-colors">
              {loading ? <><Loader2 size={20} className="animate-spin" /> Procesando...</> : 'Realizar pedido'}
            </button>
          </div>

          {/* Sidebar - 2 cols */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-5 border border-gray-100 sticky top-20 space-y-4">
              <h3 className="font-semibold">Resumen</h3>
              <div className="space-y-2 text-sm">
                {items.map((item) => {
                  const adjustedPrice = getItemPrice(item);
                  const hasOffer = selectedProductOffers[item.productId] && selectedProductOffers[item.productId] !== 'main';
                  return (
                    <div key={item.productId}>
                      <div className="flex justify-between">
                        <span className="text-gray-500">{item.name} x{getItemQuantity(item)}</span>
                        <span className={hasOffer ? 'text-green-600 font-medium' : ''}>S/ {(adjustedPrice * item.quantity).toFixed(2)}</span>
                      </div>
                      {hasOffer && (
                        <div className="flex justify-between text-[10px] text-gray-400">
                          <span className="ml-1">Original: S/ {(item.price * item.quantity).toFixed(2)}</span>
                          <span className="text-green-500">ahorro</span>
                        </div>
                      )}
                    </div>
                  );
                })}
                {addonItems.map((addon) => (
                  <div key={`addon-${addon.productId}`} className="flex justify-between text-blue-600">
                    <span>+ {addon.name}</span>
                    <span>S/ {(addon.price * addon.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>S/ {subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Envio (aproximadamente)</span><span>{shipping === 0 ? 'Gratis' : `S/ ${shipping}`}</span></div>
                {offerDiscount > 0 && <div className="flex justify-between text-green-600"><span>Descuento ofertas</span><span>-S/ {offerDiscount.toFixed(2)}</span></div>}
                {suggestedTotal > 0 && (
                  <div className="flex justify-between text-blue-600">
                    <span>Productos sugeridos ({selectedSuggestedProducts.length})</span>
                    <span>+S/ {suggestedTotal.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t pt-2 flex justify-between font-bold text-lg"><span>Total</span><span className="text-green-600">S/ {finalTotal.toFixed(2)}</span></div>
              </div>
              {subtotal < 150 && <p className="text-xs text-gray-400 text-center">Envio gratis en compras mayores a S/ 150</p>}
            </div>
          </div>
                )}
                <div className="border-t pt-2 flex justify-between font-bold text-lg"><span>Total</span><span className="text-green-600">S/ {finalTotal.toFixed(2)}</span></div>
              </div>
              {subtotal < 150 && <p className="text-xs text-gray-400 text-center">Envio gratis en compras mayores a S/ 150</p>}
              </div>

              {/* Per-product offer selectors */}
              {items.map((item) => {
                const itemOffers = productOffers[item.productId];
                if (!itemOffers || itemOffers.length === 0) return null;
                const currentOffer = selectedProductOffers[item.productId] || 'main';
                return (
                  <div key={`offers-${item.productId}`} className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs font-medium text-gray-500 mb-2">Ofertas para: {item.name}</p>
                    <div className="space-y-1.5">
                      {/* Main option */}
                      <button
                        onClick={() => setSelectedProductOffers(prev => ({ ...prev, [item.productId]: 'main' }))}
                        className={`w-full flex items-center gap-2.5 p-2 rounded-lg border-2 transition-all text-left ${currentOffer === 'main' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}
                      >
                        <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center shrink-0">
                          <Tag size={14} className="text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-900">Producto individual</p>
                        </div>
                        <span className="text-xs font-bold text-green-600">S/ {item.price}</span>
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${currentOffer === 'main' ? 'border-green-500 bg-green-500' : 'border-gray-300'}`}>
                          {currentOffer === 'main' && <Check size={10} className="text-white" />}
                        </div>
                      </button>
                      {/* Offer options */}
                      {itemOffers.map((offer) => {
                        const isSelected = currentOffer === offer.id;
                        const offerPrice = Number(offer.price) || 0;
                        let displayPrice = offerPrice;
                        let unitLabel = '';
                        if (offer.type === 'quantity') {
                          unitLabel = `${offer.quantity} unidades`;
                        } else if (offer.type === 'addon') {
                          const linked = linkedProducts[offer.linkedProductId || ''];
                          displayPrice = item.price + offerPrice;
                          unitLabel = linked ? `+ ${linked.name}` : 'Producto adicional';
                        }
                        return (
                          <button
                            key={offer.id}
                            onClick={() => setSelectedProductOffers(prev => ({ ...prev, [item.productId]: isSelected ? 'main' : offer.id }))}
                            className={`w-full flex items-center gap-2.5 p-2 rounded-lg border-2 transition-all text-left ${isSelected ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}
                          >
                            {offer.imageUrl ? (
                              <img src={offer.imageUrl} alt="" className="w-8 h-8 rounded-md object-cover shrink-0" />
                            ) : (
                              <div className="w-8 h-8 bg-orange-100 rounded-md flex items-center justify-center shrink-0">
                                <Layers size={14} className="text-orange-600" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-gray-900 truncate">{offer.name}</p>
                              <p className="text-[10px] text-gray-500">{offer.description || unitLabel}</p>
                            </div>
                            <span className="text-xs font-bold text-green-600 shrink-0">S/ {displayPrice.toFixed(2)}</span>
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? 'border-green-500 bg-green-500' : 'border-gray-300'}`}>
                              {isSelected && <Check size={10} className="text-white" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
      </main>

    </div>
  );
}
