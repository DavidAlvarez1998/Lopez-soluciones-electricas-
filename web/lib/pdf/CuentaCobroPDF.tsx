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
  if (str.length <= 3) return `$ ${str}`;
  const thousands = str.slice(0, -3);
  const rest = str.slice(-3);
  const formatted = thousands.replace(/\B(?=(\d{3})+(?!\d))/g, "'");
  return `$ ${formatted}'${rest}`;
}

export interface ItemCuentaCobroPDF {
  id?: string;
  orden: number;
  descripcion: string;
  cantidad: number;
  valor_unidad: number;
  valor_total: number;
}

export interface ClienteCuentaCobroPDF {
  id: string;
  nombre_razon_social: string;
  numero_documento: string;
  tipo_documento: string;
  telefono: string | null;
  correo: string | null;
  direccion: string | null;
}

export interface CuentaCobroPDFData {
  id: string;
  consecutivo: string;
  concepto: string;
  observaciones: string | null;
  estado: string;
  total: number;
  subtotal: number;
  fecha_emision: string;
  clientes: ClienteCuentaCobroPDF | null;
  items_cuenta_cobro: ItemCuentaCobroPDF[];
}

interface CuentaCobroPDFProps {
  cuentaCobro: CuentaCobroPDFData;
}

export function CuentaCobroPDF({ cuentaCobro }: CuentaCobroPDFProps) {
  const cliente = cuentaCobro.clientes;
  const items = cuentaCobro.items_cuenta_cobro;
  const subtotal = cuentaCobro.subtotal;
  const total = cuentaCobro.total;
  const fecha = (() => {
    try {
      return formatDate(cuentaCobro.fecha_emision);
    } catch {
      return cuentaCobro.fecha_emision;
    }
  })();

  return (
    <Document
      title={`Cuenta de Cobro ${cuentaCobro.consecutivo}`}
      author={EMPRESA.nombre}
      subject="Cuenta de cobro de servicios eléctricos"
    >
      <Page size="LETTER" style={sharedStyles.page}>
        {/* Header */}
        <PdfHeader
          titulo="CUENTA DE COBRO"
          consecutivo={cuentaCobro.consecutivo}
          fecha={fecha}
        />

        {/* Datos del contratante */}
        <Text style={sharedStyles.sectionTitle}>Datos del contratante</Text>
        <View style={sharedStyles.clienteBlock}>
          <Text style={sharedStyles.clienteNombre}>
            {cliente?.nombre_razon_social ?? '—'}
          </Text>
          <Text style={sharedStyles.clienteRow}>
            <Text style={sharedStyles.clienteLabel}>NIT / {cliente?.tipo_documento}: </Text>
            {cliente?.numero_documento ?? '—'}
          </Text>
          {cliente?.direccion && (
            <Text style={sharedStyles.clienteRow}>
              <Text style={sharedStyles.clienteLabel}>Dirección: </Text>
              {cliente.direccion}
            </Text>
          )}
          {cliente?.telefono && (
            <Text style={sharedStyles.clienteRow}>
              <Text style={sharedStyles.clienteLabel}>Teléfono: </Text>
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

        {/* Descripción del servicio — tabla */}
        <Text style={sharedStyles.sectionTitle}>Descripción del servicio</Text>
        <View>
          {/* Table header */}
          <View style={sharedStyles.tableHeader}>
            <Text style={[sharedStyles.tableHeaderCell, sharedStyles.colItem]}>Items</Text>
            <Text style={[sharedStyles.tableHeaderCell, sharedStyles.colDesc]}>
              Descripción del Servicio
            </Text>
            <Text style={[sharedStyles.tableHeaderCell, sharedStyles.colCant]}>Cant.</Text>
            <Text style={[sharedStyles.tableHeaderCell, sharedStyles.colUnit]}>Valor Unidad</Text>
            <Text style={[sharedStyles.tableHeaderCell, sharedStyles.colTotal]}>Valor</Text>
          </View>

          {/* Rows */}
          {items.map((item, idx) => (
            <View
              key={item.id ?? idx}
              style={[sharedStyles.tableRow, idx % 2 === 1 ? sharedStyles.tableRowAlt : {}]}
            >
              <Text style={[sharedStyles.tableCell, sharedStyles.colItem]}>{item.orden}</Text>
              <Text style={[sharedStyles.tableCell, sharedStyles.colDesc]}>{item.descripcion}</Text>
              <Text style={[sharedStyles.tableCell, sharedStyles.colCant]}>{item.cantidad}</Text>
              <Text style={[sharedStyles.tableCell, sharedStyles.colUnit]}>
                {formatCOPPdf(item.valor_unidad)}
              </Text>
              <Text style={[sharedStyles.tableCell, sharedStyles.colTotal]}>
                {formatCOPPdf(item.valor_total)}
              </Text>
            </View>
          ))}
        </View>

        {/* Totales */}
        <View style={sharedStyles.totalesBlock}>
          <View style={sharedStyles.totalesRow}>
            <Text style={sharedStyles.totalesLabel}>Subtotal:</Text>
            <Text style={sharedStyles.totalesValue}>{formatCOPPdf(subtotal)}</Text>
          </View>
          <View style={sharedStyles.totalFinalRow}>
            <Text style={sharedStyles.totalFinalLabel}>TOTAL A PAGAR</Text>
            <Text style={sharedStyles.totalFinalValue}>{formatCOPPdf(total)}</Text>
          </View>
        </View>

        {/* Forma de pago */}
        <Text style={sharedStyles.sectionTitle}>Forma de pago</Text>
        <View style={sharedStyles.bancoBlock}>
          {EMPRESA.bancos.map((b) => (
            <Text key={b.banco} style={sharedStyles.bancoRow}>
              <Text style={sharedStyles.bancoLabel}>{b.banco}: </Text>
              Cuenta {b.tipo} N° {b.cuenta}
            </Text>
          ))}
          <Text style={[sharedStyles.bancoRow, { marginTop: 4 }]}>
            <Text style={sharedStyles.bancoLabel}>Titular: </Text>
            {EMPRESA.titular} · C.C. {EMPRESA.cc}
          </Text>
        </View>

        {/* Observaciones */}
        <Text style={sharedStyles.sectionTitle}>Observaciones</Text>
        <View style={sharedStyles.obsBlock}>
          <Text style={sharedStyles.obsText}>
            {cuentaCobro.observaciones
              ? cuentaCobro.observaciones
              : '____________________________________________'}
          </Text>
        </View>

        {/* Certificación */}
        <Text style={sharedStyles.certText}>
          Certifico que los servicios anteriormente descritos fueron realizados satisfactoriamente.
        </Text>

        {/* Cierre */}
        <Text style={sharedStyles.cierreText}>Atentamente,</Text>
        <View style={sharedStyles.firmaBlock}>
          <View style={sharedStyles.firmaLinea} />
          <Text style={sharedStyles.firmaNombre}>{EMPRESA.representante}</Text>
          <Text style={sharedStyles.firmaDetalle}>{EMPRESA.cargo}</Text>
          <Text style={sharedStyles.firmaDetalle}>{EMPRESA.nombre}</Text>
          <Text style={sharedStyles.firmaDetalle}>Tel: {EMPRESA.tel}</Text>
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
