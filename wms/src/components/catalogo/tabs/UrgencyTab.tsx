'use client';

import { useProductForm } from '../ProductFormContext';
import { Clock, Eye, Megaphone, MessageSquare, User, Plus, X } from 'lucide-react';

const AVAILABLE_AVATARS = [
  'Abigail.jpg', 'Alejandro.jpg', 'Benjamin.jpg', 'Daniela.jpg', 'Eric.jpg',
  'jeremy.jpg', 'juan.jpg', 'Liliana.jpg', 'lucas.jpg',
  'martina.jpg', 'mateo.jpg', 'melina.jpg', 'santiago.jpg', 'sofia.jpg',
  'thiago.jpg', 'valentino.jpg', 'zoey.jpg',
];

const DEFAULT_MESSAGES = [
  '{name} de {city} compró este producto',
  '{name} de {city} acabó de comprar',
  '{name} de {city} se lo llevó',
];

export default function UrgencyTab() {
  const {
    promotionBar, updatePromotionBar, togglePromotionBar,
    socialProof, updateSocialProof, toggleSocialProof,
  } = useProductForm();

  const addMessage = () => {
    updateSocialProof({ messages: [...socialProof.messages, ''] });
  };

  const updateMessage = (index: number, value: string) => {
    const updated = [...socialProof.messages];
    updated[index] = value;
    updateSocialProof({ messages: updated });
  };

  const removeMessage = (index: number) => {
    updateSocialProof({ messages: socialProof.messages.filter((_, i) => i !== index) });
  };

  const toggleAvatar = (file: string) => {
    const current = socialProof.avatarFiles || [];
    if (current.includes(file)) {
      updateSocialProof({ avatarFiles: current.filter(f => f !== file) });
    } else {
      updateSocialProof({ avatarFiles: [...current, file] });
    }
  };

  return (
    <div className="space-y-8">
      {/* ============================================================ */}
      {/* PROMOTION BAR */}
      {/* ============================================================ */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-red-400" />
            <div>
              <h3 className="text-sm font-medium text-gray-300">Barra de Promoción</h3>
              <p className="text-xs text-gray-500">Cuenta regresiva en la parte superior de la página del producto</p>
            </div>
          </div>
          <button
            type="button"
            onClick={togglePromotionBar}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              promotionBar.enabled ? 'bg-red-600' : 'bg-gray-700'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                promotionBar.enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {promotionBar.enabled && (
          <div className="space-y-4 bg-gray-800/50 border border-gray-700 rounded-xl p-4">
            {/* Preview */}
            <div className="bg-gray-900 rounded-xl p-3 border border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <Eye size={12} className="text-gray-500" />
                <span className="text-xs text-gray-500">Vista previa</span>
              </div>
              <div
                className="rounded-lg px-4 py-2 text-center text-sm font-medium"
                style={{ backgroundColor: promotionBar.bgColor, color: promotionBar.textColor }}
              >
                {(promotionBar.message || '¡Oferta por tiempo limitado!')
                  .replace('{hours}', String(promotionBar.hours || 24).padStart(2, '0'))
                  .replace('{minutes}', '00')
                  .replace('{seconds}', '00')}
              </div>
            </div>

            {/* Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Mensaje de la barra</label>
                <input
                  type="text"
                  value={promotionBar.message}
                  onChange={(e) => updatePromotionBar({ message: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                  placeholder="¡Oferta por tiempo limitado! Quedan {hours}h {minutes}m {seconds}s"
                />
                <p className="text-[10px] text-gray-600 mt-1">
                  Variables: {'{hours}'} {'{minutes}'} {'{seconds}'} — se rellenan automáticamente
                </p>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">Horas de countdown</label>
                <input
                  type="number"
                  value={promotionBar.hours || 24}
                  onChange={(e) => updatePromotionBar({ hours: parseInt(e.target.value) || 24 })}
                  min="1"
                  max="720"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
                <p className="text-[10px] text-gray-600 mt-1">Cuántas horas dura la oferta (1-720)</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Color de fondo</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={promotionBar.bgColor}
                      onChange={(e) => updatePromotionBar({ bgColor: e.target.value })}
                      className="w-10 h-10 rounded-lg border border-gray-700 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={promotionBar.bgColor}
                      onChange={(e) => updatePromotionBar({ bgColor: e.target.value })}
                      className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Color de texto</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={promotionBar.textColor}
                      onChange={(e) => updatePromotionBar({ textColor: e.target.value })}
                      className="w-10 h-10 rounded-lg border border-gray-700 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={promotionBar.textColor}
                      onChange={(e) => updatePromotionBar({ textColor: e.target.value })}
                      className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* SOCIAL PROOF */}
      {/* ============================================================ */}
      <div className="border-t border-gray-700 pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Megaphone size={18} className="text-blue-400" />
            <div>
              <h3 className="text-sm font-medium text-gray-300">Notificaciones de Prueba Social</h3>
              <p className="text-xs text-gray-500">Toasts emergentes mostrando compras recientes</p>
            </div>
          </div>
          <button
            type="button"
            onClick={toggleSocialProof}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              socialProof.enabled ? 'bg-blue-600' : 'bg-gray-700'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                socialProof.enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {socialProof.enabled && (
          <div className="space-y-4 bg-gray-800/50 border border-gray-700 rounded-xl p-4">
            {/* Preview */}
            <div className="bg-gray-900 rounded-xl p-3 border border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <Eye size={12} className="text-gray-500" />
                <span className="text-xs text-gray-500">Vista previa del toast</span>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 flex items-center gap-3 max-w-xs">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0 overflow-hidden">
                  <User size={14} className="text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-700">
                    <span className="font-semibold">María</span> de Lima compró
                  </p>
                  <p className="text-xs text-blue-600 font-medium truncate">Este producto</p>
                  <p className="text-[10px] text-gray-400">hace 2 min</p>
                </div>
              </div>
            </div>

            {/* Interval */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Intervalo entre notificaciones (segundos)
              </label>
              <input
                type="number"
                value={socialProof.interval}
                onChange={(e) => updateSocialProof({ interval: parseInt(e.target.value) || 5 })}
                min="3"
                max="60"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
              <p className="text-[10px] text-gray-600 mt-1">Mínimo 3s, recomendado 5s</p>
            </div>

            {/* Message Templates */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-gray-500 flex items-center gap-1">
                  <MessageSquare size={12} />
                  Plantillas de mensaje
                </label>
                <button
                  type="button"
                  onClick={addMessage}
                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  <Plus size={12} /> Agregar
                </button>
              </div>
              <p className="text-[10px] text-gray-600 mb-2">
                Variables: {'{name}'} {'{city}'} {'{product}'}
              </p>
              <div className="space-y-2">
                {socialProof.messages.map((msg, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      type="text"
                      value={msg}
                      onChange={(e) => updateMessage(i, e.target.value)}
                      className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                      placeholder="{name} de {city} compró este producto"
                    />
                    {socialProof.messages.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMessage(i)}
                        className="px-2 text-gray-500 hover:text-red-400"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {socialProof.messages.length === 0 && (
                <button
                  type="button"
                  onClick={() => updateSocialProof({ messages: [...DEFAULT_MESSAGES] })}
                  className="text-xs text-gray-500 hover:text-gray-300 underline"
                >
                  Restablecer mensajes predeterminados
                </button>
              )}
            </div>

            {/* Avatar Selection */}
            <div>
              <label className="block text-xs text-gray-500 mb-2 flex items-center gap-1">
                <User size={12} />
                Avatares (archivos en /public/avatars/)
              </label>
              <p className="text-[10px] text-gray-600 mb-2">
                Selecciona qué avatares usar. Si no seleccionas ninguno, se usa un icono por defecto.
              </p>
              <div className="grid grid-cols-6 gap-2">
                {AVAILABLE_AVATARS.map((file) => {
                  const isSelected = socialProof.avatarFiles.includes(file);
                  return (
                    <button
                      key={file}
                      type="button"
                      onClick={() => toggleAvatar(file)}
                      className={`relative w-full aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                        isSelected ? 'border-blue-500 ring-1 ring-blue-500/30' : 'border-gray-700 hover:border-gray-500'
                      }`}
                    >
                      <img
                        src={`/avatars/${file}`}
                        alt={file}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                          <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              {socialProof.avatarFiles.length > 0 && (
                <p className="text-[10px] text-gray-500 mt-1">
                  {socialProof.avatarFiles.length} avatar{socialProof.avatarFiles.length !== 1 ? 'es' : ''} seleccionado{socialProof.avatarFiles.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
