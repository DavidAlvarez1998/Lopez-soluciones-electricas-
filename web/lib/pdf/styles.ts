import { StyleSheet } from '@react-pdf/renderer';

// Importar registro de fuentes (side-effect)
import './fonts';

export const COLOR_ACCENT = '#f04e2b';
export const COLOR_NAVY = '#030f23';
export const COLOR_BLUE = '#1354a8';
export const COLOR_GRAY = '#8fa3c0';
export const COLOR_WHITE = '#f5f8ff';
export const COLOR_BLACK = '#111111';

export const sharedStyles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 50,
    paddingHorizontal: 40,
    fontFamily: 'Barlow',
    fontSize: 10,
    color: COLOR_BLACK,
    backgroundColor: '#ffffff',
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 2,
    borderBottomColor: COLOR_BLUE,
    paddingBottom: 10,
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
  },
  headerLogoText: {
    fontSize: 16,
    fontWeight: 700,
    color: COLOR_NAVY,
    letterSpacing: 0.5,
  },
  headerSlogan: {
    fontSize: 8,
    color: COLOR_GRAY,
    marginTop: 2,
    fontStyle: 'italic',
  },
  headerNit: {
    fontSize: 9,
    color: COLOR_GRAY,
    marginTop: 3,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  headerTitulo: {
    fontSize: 18,
    fontWeight: 700,
    color: COLOR_ACCENT,
    textAlign: 'right',
  },
  headerConsecutivo: {
    fontSize: 11,
    color: COLOR_NAVY,
    textAlign: 'right',
    marginTop: 2,
  },
  headerFecha: {
    fontSize: 9,
    color: COLOR_GRAY,
    textAlign: 'right',
    marginTop: 2,
  },

  // Section titles
  sectionTitle: {
    fontSize: 9,
    fontWeight: 700,
    color: COLOR_ACCENT,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
    marginTop: 12,
  },

  // Client block
  clienteBlock: {
    backgroundColor: '#f5f8ff',
    borderRadius: 4,
    padding: 10,
    marginBottom: 12,
  },
  clienteNombre: {
    fontSize: 11,
    fontWeight: 700,
    color: COLOR_NAVY,
    marginBottom: 3,
  },
  clienteRow: {
    fontSize: 9,
    color: '#333333',
    marginBottom: 2,
  },
  clienteLabel: {
    color: COLOR_GRAY,
  },

  // Table
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: COLOR_NAVY,
    paddingVertical: 5,
    paddingHorizontal: 6,
  },
  tableHeaderCell: {
    color: '#ffffff',
    fontSize: 8,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#d0d8e4',
    paddingVertical: 5,
    paddingHorizontal: 6,
  },
  tableRowAlt: {
    backgroundColor: '#f9fbff',
  },
  tableCell: {
    fontSize: 9,
    color: COLOR_BLACK,
  },

  // Column widths
  colItem: { width: '8%' },
  colDesc: { width: '52%' },
  colCant: { width: '10%', textAlign: 'right' },
  colUnit: { width: '15%', textAlign: 'right' },
  colTotal: { width: '15%', textAlign: 'right' },

  // Cotización: ITEMS | DESCRIPCION | VALOR (no cantidad/unidad)
  colItemCot: { width: '8%' },
  colDescCot: { width: '72%' },
  colValorCot: { width: '20%', textAlign: 'right' },

  // Totals
  totalesBlock: {
    alignSelf: 'flex-end',
    marginTop: 8,
    minWidth: 200,
  },
  totalesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  totalesLabel: {
    fontSize: 9,
    color: COLOR_GRAY,
  },
  totalesValue: {
    fontSize: 9,
    color: COLOR_BLACK,
    fontWeight: 700,
  },
  totalFinalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLOR_NAVY,
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 3,
    marginTop: 2,
  },
  totalFinalLabel: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: 700,
  },
  totalFinalValue: {
    fontSize: 10,
    color: COLOR_ACCENT,
    fontWeight: 700,
  },

  // Payment info
  bancoBlock: {
    marginTop: 14,
    padding: 10,
    borderWidth: 0.5,
    borderColor: '#d0d8e4',
    borderRadius: 4,
  },
  bancoRow: {
    fontSize: 9,
    color: '#333333',
    marginBottom: 3,
  },
  bancoLabel: {
    color: COLOR_GRAY,
  },

  // Observations
  obsBlock: {
    marginTop: 12,
    padding: 10,
    backgroundColor: '#f9fbff',
    borderRadius: 4,
  },
  obsText: {
    fontSize: 9,
    color: '#333333',
    fontStyle: 'italic',
  },

  // Firma / closure
  firmaBlock: {
    marginTop: 30,
    alignItems: 'center',
  },
  firmaLinea: {
    borderTopWidth: 0.5,
    borderTopColor: '#999999',
    width: 160,
    marginBottom: 4,
  },
  firmaNombre: {
    fontSize: 9,
    fontWeight: 700,
    color: COLOR_NAVY,
  },
  firmaDetalle: {
    fontSize: 8,
    color: COLOR_GRAY,
    marginTop: 1,
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 40,
    right: 40,
    borderTopWidth: 0.5,
    borderTopColor: '#d0d8e4',
    paddingTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 7,
    color: COLOR_GRAY,
  },

  // Cert text
  certText: {
    fontSize: 9,
    color: '#333333',
    fontStyle: 'italic',
    marginTop: 12,
    textAlign: 'center',
  },

  // Cordialmente / atentamente
  cierreText: {
    fontSize: 9,
    color: '#333333',
    marginTop: 16,
    marginBottom: 6,
  },
});
