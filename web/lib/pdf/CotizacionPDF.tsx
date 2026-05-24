'use client';

import { Document, Page, View, Text } from '@react-pdf/renderer';
import { sharedStyles } from './styles';
import { PdfHeader } from './PdfHeader';
import { EMPRESA } from '@/lib/constants/empresa';
import { formatDate } from '@/lib/formatters/date';

// Formato COP estilo colombiano: $ 2'880.000
function formatCOPPdf(value: number): string {
  const rounded = Math.round(value);
  const str = rounded.toString();
  // Insert apostrophe as thousands separator (Colombian style)
  if (str.length <= 3) return `$ ${str}`;
  const thousands = str.slice(0, -3);
  const rest = str.slice(-3);
  // For millions, recursively add apostrophes
  const formatted = thousands.replace(/\B(?=(\d{3})+(?!\d))/g, "'");
  return `$ ${formatted}'${rest}`;
}

export interface ItemCotizacionPDF {
  id?: string;
  orden: number;
  descripcion: string;
  cantidad: number;
  valor_unidad: number;
  valor_total: number;
}

export interface ClienteCotizacionPDF {
  id: string;
  nombre_razon_social: string;
  numero_documento: string;
  tipo_documento: string;
  telefono: string | null;
  correo: string | null;
  direccion: string | null;
}

export interface CotizacionPDFData {
  id: string;
  consecutivo: string;
  concepto: string;
  observaciones: string | null;
  estado: string;
  total: number;
  fecha_emision: string;
  clientes: ClienteCotizacionPDF | null;
  items_cotizacion: ItemCotizacionPDF[];
}

interface CotizacionPDFProps {
  cotizacion: CotizacionPDFData;
}

export function CotizacionPDF({ cotizacion }: CotizacionPDFProps) {
  const cliente = cotizacion.clientes;
  const items = cotizacion.items_cotizacion;
  const total = cotizacion.total;
  const fecha = (() => {
    try {
      return formatDate(cotizacion.fecha_emision);
    } catch {
      return cotizacion.fecha_emision;
    }
  })();

  return (
    <Document
      title={`Cotización ${cotizacion.consecutivo}`}
      author={EMPRESA.nombre}
      subject="Cotización de servicios eléctricos"
    >
      <Page size="LETTER" style={sharedStyles.page}>
        {/* Header */}
        <PdfHeader
          titulo="COTIZACIÓN"
          consecutivo={cotizacion.consecutivo}
          fecha={fecha}
        />

        {/* Cliente */}
        <Text style={sharedStyles.sectionTitle}>Datos del cliente</Text>
        <View style={sharedStyles.clienteBlock}>
          <Text style={sharedStyles.clienteNombre}>
            EMPRESA: {cliente?.nombre_razon_social ?? '—'}
          </Text>
          <Text style={sharedStyles.clienteRow}>
            <Text style={sharedStyles.clienteLabel}>NIT / {cliente?.tipo_documento}: </Text>
            {cliente?.numero_documento ?? '—'}
          </Text>
          {cliente?.telefono && (
            <Text style={sharedStyles.clienteRow}>
              <Text style={sharedStyles.clienteLabel}>Contacto: </Text>
              {cliente.telefono}
            </Text>
          )}
          {cliente?.correo && (
            <Text style={sharedStyles.clienteRow}>
              <Text style={sharedStyles.clienteLabel}>Correo: </Text>
              {cliente.correo}
            </Text>
          )}
        </View>

        {/* Concepto */}
        {cotizacion.concepto && (
          <>
            <Text style={sharedStyles.sectionTitle}>Concepto</Text>
            <Text style={{ fontSize: 9, color: '#333333', marginBottom: 10 }}>
              {cotizacion.concepto}
            </Text>
          </>
        )}

        {/* Items table */}
        <Text style={sharedStyles.sectionTitle}>Detalle de servicios</Text>
        <View>
          {/* Table header */}
          <View style={sharedStyles.tableHeader}>
            <Text style={[sharedStyles.tableHeaderCell, sharedStyles.colItemCot]}>Items</Text>
            <Text style={[sharedStyles.tableHeaderCell, sharedStyles.colDescCot]}>Descripción</Text>
            <Text style={[sharedStyles.tableHeaderCell, sharedStyles.colValorCot, { textAlign: 'right' }]}>
              Valor
            </Text>
          </View>

          {/* Rows */}
          {items.map((item, idx) => (
            <View
              key={item.id ?? idx}
              style={[sharedStyles.tableRow, idx % 2 === 1 ? sharedStyles.tableRowAlt : {}]}
            >
              <Text style={[sharedStyles.tableCell, sharedStyles.colItemCot]}>
                {item.orden}
              </Text>
              <Text style={[sharedStyles.tableCell, sharedStyles.colDescCot]}>
                {item.descripcion}
              </Text>
              <Text style={[sharedStyles.tableCell, sharedStyles.colValorCot]}>
                {formatCOPPdf(item.valor_unidad || item.valor_total)}
              </Text>
            </View>
          ))}
        </View>

        {/* Total */}
        <View style={sharedStyles.totalesBlock}>
          <View style={sharedStyles.totalFinalRow}>
            <Text style={sharedStyles.totalFinalLabel}>TOTAL</Text>
            <Text style={sharedStyles.totalFinalValue}>{formatCOPPdf(total)}</Text>
          </View>
        </View>

        {/* Observations */}
        {cotizacion.observaciones && (
          <View style={sharedStyles.obsBlock}>
            <Text style={[sharedStyles.sectionTitle, { marginTop: 0 }]}>Observaciones</Text>
            <Text style={sharedStyles.obsText}>{cotizacion.observaciones}</Text>
          </View>
        )}

        {/* Closure */}
        <Text style={sharedStyles.cierreText}>Cordialmente,</Text>
        <View style={sharedStyles.firmaBlock}>
          <View style={sharedStyles.firmaLinea} />
          <Text style={sharedStyles.firmaNombre}>{EMPRESA.titular}</Text>
          <Text style={sharedStyles.firmaDetalle}>C.C. {EMPRESA.cc}</Text>
          <Text style={sharedStyles.firmaDetalle}>Contacto: {EMPRESA.tel}</Text>
        </View>

        {/* Footer */}
        <View style={sharedStyles.footer} fixed>
          <Text style={sharedStyles.footerText}>{EMPRESA.nombre} · NIT {EMPRESA.nit}</Text>
          <Text style={sharedStyles.footerText}>{EMPRESA.email} · Tel: {EMPRESA.tel}</Text>
        </View>
      </Page>
    </Document>
  );
}
