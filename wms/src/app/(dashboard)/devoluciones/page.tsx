'use client';

import { useState, useEffect } from 'react';
import { Plus, Loader2, Package, CheckCircle, XCircle, Clock } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';

const statusConfig: Record<string, { color: string; label: string }> = {
  pending: { color: 'bg-yellow-500/20 text-yellow-400', label: 'Pendiente' },
  inspecting: { color: 'bg-blue-500/20 text-blue-400', label: 'Inspeccionando' },
  approved: { color: 'bg-green-500/20 text-green-400', label: 'Aprobada' },
  rejected: { color: 'bg-red-500/20 text-red-400', label: 'Rechazada' },
  refunded: { color: 'bg-purple-500/20 text-purple-400', label: 'Reembolsada' },
};

export default function DevolucionesPage() {
  const [returns, setReturns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchReturns();
  }, []);

  async function fetchReturns() {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/returns?limit=50');
      if (res.ok) {
        const data = await res.json();
        setReturns(data.data?.items || data.data || []);
      }
    } catch (error) {
      console.error('Error fetching returns:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4 pb-20 lg:pb-0">
      <PageHeader
        title="Devoluciones / RMA"
        description={`${returns.length} devoluciones registradas`}
        actions={
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-brand-700">
            <Plus size={18} /> Nueva Devolucion
          </button>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center py-12"><Loader2 size={24} className="animate-spin text-brand-400" /></div>
      ) : returns.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
          <Package size={32} className="mx-auto mb-2 text-gray-500" />
          <p className="text-sm text-gray-500">No hay devoluciones registradas</p>
        </div>
      ) : (
        <div className="space-y-3">
          {returns.map((ret) => {
            const st = statusConfig[ret.status] || statusConfig.pending;
            return (
              <div key={ret.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-white">{ret.returnNumber}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${st.color}`}>{st.label}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Pedido: {ret.orderNumber || 'N/A'}</p>
                    <p className="text-xs text-gray-500">Cliente: {ret.customerName || 'N/A'}</p>
                    {ret.reason && <p className="text-xs text-gray-400 mt-1">Motivo: {ret.reason}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">{new Date(ret.createdAt).toLocaleDateString('es-PE')}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <ReturnModal onClose={() => setShowModal(false)} onSaved={() => { setShowModal(false); fetchReturns(); }} />
      )}
    </div>
  );
}

function ReturnModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ orderNumber: '', customerName: '', reason: '', items: '' });
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch('/api/v1/returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNumber: form.orderNumber,
          customerName: form.customerName,
          reason: form.reason,
          items: form.items ? form.items.split(',').map((i: string) => ({ productName: i.trim(), quantity: 1 })) : [],
        }),
      });
      if (res.ok) onSaved();
      else alert('Error al crear devolucion');
    } catch (error) {
      alert('Error al crear devolucion');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-xl font-bold mb-4">Nueva Devolucion</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Numero de Pedido</label>
            <input value={form.orderNumber} onChange={(e) => setForm({ ...form, orderNumber: e.target.value })}
              placeholder="ADR-20260715-00001" className="w-full border rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Cliente</label>
            <input value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })}
              className="w-full border rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Motivo</label>
            <textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })}
              className="w-full border rounded-lg px-3 py-2" rows={3} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Productos (separados por coma)</label>
            <input value={form.items} onChange={(e) => setForm({ ...form, items: e.target.value })}
              placeholder="Cuna Convertible, Silla Alta" className="w-full border rounded-lg px-3 py-2" />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancelar</button>
          <button onClick={handleSave} disabled={saving || !form.orderNumber}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
            {saving ? 'Guardando...' : 'Crear Devolucion'}
          </button>
        </div>
      </div>
    </div>
  );
}
