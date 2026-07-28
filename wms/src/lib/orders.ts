export const VALID_TRANSITIONS: Record<string, string[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['alistado', 'cancelled'],
  alistado: ['shipped', 'cancelled'],
  shipped: ['in_transit', 'cancelled'],
  in_transit: ['delivered', 'cancelled'],
  delivered: ['returned'],
  returned: [],
  cancelled: [],
};

export const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  processing: 'Procesando',
  alistado: 'Alistado',
  shipped: 'Enviado',
  in_transit: 'En transito',
  delivered: 'Entregado',
  returned: 'Devuelto',
  cancelled: 'Cancelado',
};

export const STATUS_COLORS: Record<string, string> = {
  pending: 'yellow',
  confirmed: 'blue',
  processing: 'indigo',
  alistado: 'purple',
  shipped: 'cyan',
  in_transit: 'orange',
  delivered: 'green',
  returned: 'red',
  cancelled: 'gray',
};

export const CUSTOMER_TIER_LABELS: Record<string, string> = {
  nuevo: 'Nuevo',
  frecuente: 'Frecuente',
  vip: 'VIP',
  problematico: 'Problematico',
  normal: 'Normal',
};

export const CUSTOMER_TIER_COLORS: Record<string, string> = {
  nuevo: 'gray',
  frecuente: 'blue',
  vip: 'gold',
  problematico: 'red',
  normal: 'slate',
};
