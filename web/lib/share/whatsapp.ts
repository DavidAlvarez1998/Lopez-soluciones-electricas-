import { EMPRESA } from '@/lib/constants/empresa';
import { formatDate } from '@/lib/formatters/date';

// Formato COP para mensajes de texto (sin símbolo especial)
function formatCOPText(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(value);
}

export interface CotizacionWaData {
  consecutivo: string;
  fecha_emision: string;
  concepto: string;
  total: number;
  clientes: {
    nombre_razon_social: string;
  } | null;
  items_cotizacion: {
    orden: number;
    descripcion: string;
    valor_unidad: number;
  }[];
}

export interface CuentaCobroWaData {
  consecutivo: string;
  fecha_emision: string;
  concepto: string;
  total: number;
  clientes: {
    nombre_razon_social: string;
  } | null;
  items_cuenta_cobro: {
    orden: number;
    descripcion: string;
    cantidad: number;
    valor_unidad: number;
  }[];
}

export function buildCotizacionWaMessage(cotizacion: CotizacionWaData): string {
  const fecha = (() => {
    try { return formatDate(cotizacion.fecha_emision); } catch { return cotizacion.fecha_emision; }
  })();

  const itemsText = cotizacion.items_cotizacion
    .map((it) => `  ${it.orden}. ${it.descripcion} — ${formatCOPText(it.valor_unidad)}`)
    .join('\n');

  return [
    `⚡ *COTIZACIÓN – ${EMPRESA.nombre.toUpperCase()}*`,
    `No.: ${cotizacion.consecutivo}`,
    `Fecha: ${fecha}`,
    `Cliente: ${cotizacion.clientes?.nombre_razon_social ?? '—'}`,
    `Concepto: ${cotizacion.concepto}`,
    '',
    '*Ítems:*',
    itemsText,
    '',
    `*Total: ${formatCOPText(cotizacion.total)}*`,
    '',
    `_Seguridad, Calidad y Compromiso_ ⚡`,
    `— ${EMPRESA.titular} | ${EMPRESA.nombre}`,
  ].join('\n');
}

export function buildCuentaCobroWaMessage(cuentaCobro: CuentaCobroWaData): string {
  const fecha = (() => {
    try { return formatDate(cuentaCobro.fecha_emision); } catch { return cuentaCobro.fecha_emision; }
  })();

  const itemsText = cuentaCobro.items_cuenta_cobro
    .map(
      (it) =>
        `  ${it.orden}. ${it.descripcion} — x${it.cantidad} × ${formatCOPText(it.valor_unidad)}`
    )
    .join('\n');

  return [
    `⚡ *CUENTA DE COBRO – ${EMPRESA.nombre.toUpperCase()}*`,
    `No.: ${cuentaCobro.consecutivo}`,
    `Fecha: ${fecha}`,
    `Cliente: ${cuentaCobro.clientes?.nombre_razon_social ?? '—'}`,
    `Concepto: ${cuentaCobro.concepto}`,
    '',
    '*Servicios:*',
    itemsText,
    '',
    `*Total a pagar: ${formatCOPText(cuentaCobro.total)}*`,
    '',
    `*Forma de pago:*`,
    ...EMPRESA.bancos.map((b) => `  ${b.banco} — Cuenta ${b.tipo} N° ${b.cuenta}`),
    `  Titular: ${EMPRESA.titular} · C.C. ${EMPRESA.cc}`,
    '',
    `_Seguridad, Calidad y Compromiso_ ⚡`,
    `— ${EMPRESA.titular} | ${EMPRESA.nombre}`,
  ].join('\n');
}

/**
 * Builds a wa.me URL with the given phone number and message.
 * phoneNumber should be in international format without '+' (e.g. '573004513435').
 */
export function buildWaUrl(phoneNumber: string, message: string): string {
  return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
}
