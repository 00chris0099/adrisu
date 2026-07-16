'use client';

import { useState, useEffect } from 'react';
import { Plus, Loader2, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';

const statusConfig: Record<string, { color: string; label: string }> = {
  pending: { color: 'bg-yellow-500/20 text-yellow-400', label: 'Pendiente' },
  in_progress: { color: 'bg-blue-500/20 text-blue-400', label: 'En Progreso' },
  passed: { color: 'bg-green-500/20 text-green-400', label: 'Aprobado' },
  failed: { color: 'bg-red-500/20 text-red-400', label: 'Rechazado' },
};

export default function CalidadPage() {
  const [checks, setChecks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChecks();
  }, []);

  async function fetchChecks() {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/quality-checks?limit=50');
      if (res.ok) {
        const data = await res.json();
        setChecks(data.data?.items || data.data || []);
      }
    } catch (error) {
      console.error('Error fetching quality checks:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4 pb-20 lg:pb-0">
      <PageHeader
        title="Control de Calidad"
        description={`${checks.length} inspecciones registradas`}
      />

      {loading ? (
        <div className="flex items-center justify-center py-12"><Loader2 size={24} className="animate-spin text-brand-400" /></div>
      ) : checks.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
          <CheckCircle size={32} className="mx-auto mb-2 text-gray-500" />
          <p className="text-sm text-gray-500">No hay inspecciones de calidad registradas</p>
        </div>
      ) : (
        <div className="space-y-3">
          {checks.map((check) => {
            const st = statusConfig[check.status] || statusConfig.pending;
            return (
              <div key={check.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-white">{check.checkNumber || check.id?.substring(0, 8)}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${st.color}`}>{st.label}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Producto: {check.productName || 'N/A'}</p>
                    {check.inspector && <p className="text-xs text-gray-500">Inspector: {check.inspector}</p>}
                    {check.defects && <p className="text-xs text-yellow-400 mt-1">Defectos: {check.defects}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">{new Date(check.createdAt).toLocaleDateString('es-PE')}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
