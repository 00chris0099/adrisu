'use client';

import { useState, useEffect } from 'react';
import { Plus, FileText, Download, Send, Eye, Trash2, Filter } from 'lucide-react';

interface Invoice {
  id: string;
  invoiceNumber: string;
  documentType: string;
  customerName: string;
  customerDoc: string;
  orderNumber: string | null;
  status: string;
  subtotal: number;
  taxAmount: number;
  total: number;
  pdfUrl: string | null;
  createdAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-800 text-gray-300',
  issued: 'bg-green-500/20 text-green-400',
  paid: 'bg-blue-500/20 text-blue-400',
  cancelled: 'bg-red-500/20 text-red-400',
};

const STATUS_LABELS: Record<string, string> = {
  draft: 'Borrador',
  issued: 'Emitida',
  paid: 'Pagada',
  cancelled: 'Anulada',
};

export default function AccountingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [stats, setStats] = useState({ total: 0, pending: 0, paid: 0 });

  useEffect(() => {
    fetchInvoices();
    fetchStats();
  }, [filterStatus, filterType]);

  async function fetchInvoices() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus) params.set('status', filterStatus);
      if (filterType) params.set('type', filterType);
      params.set('limit', '50');

      const res = await fetch(`/api/v1/invoices?${params}`);
      const data = await res.json();
      setInvoices(data.data?.items || []);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchStats() {
    try {
      const res = await fetch('/api/v1/accounting');
      const data = await res.json();
      setStats(data.data?.stats || { total: 0, pending: 0, paid: 0 });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }

  async function handleSend(invoice: Invoice) {
    if (!confirm(`Enviar ${invoice.documentType === 'BOLETA' ? 'boleta' : 'factura'} ${invoice.invoiceNumber} a Nubefact?`)) return;

    try {
      const res = await fetch(`/api/v1/invoices/${invoice.id}/send`, { method: 'POST' });
      const data = await res.json();

      if (data.error) {
        alert(`Error: ${data.error}`);
        return;
      }

      alert(`Enviada exitosamente. CDR: ${data.data?.nubefact?.cdrDescription}`);
      fetchInvoices();
      fetchStats();
    } catch (error) {
      alert('Error al enviar');
    }
  }

  async function handleViewPdf(invoice: Invoice) {
    window.open(`/api/v1/invoices/${invoice.id}/pdf`, '_blank');
  }

  async function handleDelete(invoice: Invoice) {
    if (!confirm(`Eliminar ${invoice.invoiceNumber}?`)) return;

    try {
      await fetch(`/api/v1/invoices/${invoice.id}`, { method: 'DELETE' });
      fetchInvoices();
      fetchStats();
    } catch (error) {
      alert('Error al eliminar');
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Facturacion</h1>
          <p className="text-gray-400">Gestion de facturas, boletas y notas</p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-xl hover:bg-brand-700"
        >
          <Plus size={18} />
          Nuevo Comprobante
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="text-sm text-gray-400">Total Comprobantes</div>
          <div className="text-2xl font-bold">{stats.total}</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="text-sm text-gray-400">Pendientes</div>
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="text-sm text-gray-400">Pagadas</div>
          <div className="text-2xl font-bold text-green-600">{stats.paid}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-4">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-sm text-white"
        >
          <option value="">Todos los estados</option>
          <option value="draft">Borrador</option>
          <option value="issued">Emitida</option>
          <option value="paid">Pagada</option>
          <option value="cancelled">Anulada</option>
        </select>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-sm text-white"
        >
          <option value="">Todos los tipos</option>
          <option value="FACTURA">Factura</option>
          <option value="BOLETA">Boleta</option>
          <option value="NOTA_CREDITO">Nota de Credito</option>
          <option value="NOTA_DEBITO">Nota de Debito</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Numero</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Tipo</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Cliente</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Estado</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">Total</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Fecha</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-400">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">Cargando...</td>
              </tr>
            ) : invoices.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">No hay comprobantes</td>
              </tr>
            ) : (
              invoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-800/50">
                  <td className="px-4 py-3 font-mono text-sm">{invoice.invoiceNumber}</td>
                  <td className="px-4 py-3 text-sm">{invoice.documentType}</td>
                  <td className="px-4 py-3 text-sm">{invoice.customerName}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[invoice.status] || ''}`}>
                      {STATUS_LABELS[invoice.status] || invoice.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium">S/ {invoice.total.toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm text-gray-400">
                    {new Date(invoice.createdAt).toLocaleDateString('es-PE')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      {invoice.status === 'draft' && (
                        <button
                          onClick={() => handleSend(invoice)}
                          className="p-1 text-green-400 hover:bg-green-500/10 rounded"
                          title="Enviar a Nubefact"
                        >
                          <Send size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => handleViewPdf(invoice)}
                        className="p-1 text-blue-400 hover:bg-blue-500/10 rounded"
                        title="Ver PDF"
                      >
                        <Eye size={16} />
                      </button>
                      {invoice.status === 'draft' && (
                        <button
                          onClick={() => handleDelete(invoice)}
                          className="p-1 text-red-400 hover:bg-red-500/10 rounded"
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* New Invoice Modal */}
      {showNewModal && (
        <NewInvoiceModal
          onClose={() => setShowNewModal(false)}
          onCreated={() => {
            setShowNewModal(false);
            fetchInvoices();
            fetchStats();
          }}
        />
      )}
    </div>
  );
}

function NewInvoiceModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [documentType, setDocumentType] = useState('FACTURA');
  const [customerId, setCustomerId] = useState('');
  const [customers, setCustomers] = useState<any[]>([]);
  const [items, setItems] = useState<Array<{ description: string; quantity: number; unitPrice: number; discount: number }>>([
    { description: '', quantity: 1, unitPrice: 0, discount: 0 },
  ]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/v1/customers?limit=100')
      .then(res => res.json())
      .then(data => setCustomers(data.data?.items || []))
      .catch(() => {});
  }, []);

  function addItem() {
    setItems([...items, { description: '', quantity: 1, unitPrice: 0, discount: 0 }]);
  }

  function removeItem(index: number) {
    setItems(items.filter((_, i) => i !== index));
  }

  function updateItem(index: number, field: string, value: any) {
    const newItems = [...items];
    (newItems[index] as any)[field] = value;
    setItems(newItems);
  }

  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity - item.discount, 0);
  const igv = subtotal * 0.18;
  const total = subtotal + igv;

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch('/api/v1/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentType,
          customerId: customerId || null,
          items,
        }),
      });

      if (res.ok) {
        onCreated();
      } else {
        const data = await res.json();
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      alert('Error al guardar');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <h2 className="text-xl font-bold mb-4 text-white">Nuevo Comprobante</h2>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-300">Tipo de Documento</label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className="w-full bg-gray-800 border-gray-700 text-white rounded-lg px-3 py-2"
            >
              <option value="FACTURA">Factura Electronica</option>
              <option value="BOLETA">Boleta de Venta</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-300">Cliente</label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full bg-gray-800 border-gray-700 text-white rounded-lg px-3 py-2"
            >
              <option value="">Cliente variado</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.fullName} - {c.documentNumber}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Items */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="font-medium text-gray-300">Items</label>
            <button onClick={addItem} className="text-blue-400 text-sm hover:underline">+ Agregar item</button>
          </div>
          <div className="space-y-2">
            {items.map((item, index) => (
              <div key={index} className="flex gap-2 items-center">
                <input
                  placeholder="Descripcion"
                  value={item.description}
                  onChange={(e) => updateItem(index, 'description', e.target.value)}
                  className="flex-1 bg-gray-800 border-gray-700 text-white rounded px-2 py-1 text-sm"
                />
                <input
                  type="number"
                  placeholder="Cant."
                  value={item.quantity}
                  onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                  className="w-16 bg-gray-800 border-gray-700 text-white rounded px-2 py-1 text-sm"
                />
                <input
                  type="number"
                  placeholder="Precio"
                  value={item.unitPrice}
                  onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                  className="w-24 bg-gray-800 border-gray-700 text-white rounded px-2 py-1 text-sm"
                />
                <input
                  type="number"
                  placeholder="Desc."
                  value={item.discount}
                  onChange={(e) => updateItem(index, 'discount', parseFloat(e.target.value) || 0)}
                  className="w-20 bg-gray-800 border-gray-700 text-white rounded px-2 py-1 text-sm"
                />
                <span className="w-24 text-right text-sm font-medium text-gray-300">S/ {(item.unitPrice * item.quantity - item.discount).toFixed(2)}</span>
                {items.length > 1 && (
                  <button onClick={() => removeItem(index)} className="text-red-400 hover:text-red-300 text-sm">X</button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="border-t border-gray-800 pt-4 mb-4">
          <div className="flex justify-end space-y-1">
            <div className="w-48">
              <div className="flex justify-between text-sm text-gray-300"><span>Subtotal:</span><span>S/ {subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-sm text-gray-300"><span>IGV (18%):</span><span>S/ {igv.toFixed(2)}</span></div>
              <div className="flex justify-between font-bold text-lg border-t border-gray-800 pt-1 text-gray-300"><span>Total:</span><span>S/ {total.toFixed(2)}</span></div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border border-gray-700 text-gray-300 rounded-xl hover:bg-gray-800">Cancelar</button>
          <button
            onClick={handleSave}
            disabled={saving || items.length === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Guardando...' : 'Guardar Borrador'}
          </button>
        </div>
      </div>
    </div>
  );
}
