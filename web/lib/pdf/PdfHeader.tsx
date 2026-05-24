import { View, Text } from '@react-pdf/renderer';
import { sharedStyles } from './styles';
import { EMPRESA } from '@/lib/constants/empresa';

interface PdfHeaderProps {
  titulo: string;
  consecutivo: string;
  fecha: string;
}

export function PdfHeader({ titulo, consecutivo, fecha }: PdfHeaderProps) {
  return (
    <View style={sharedStyles.header}>
      {/* Left: Company info */}
      <View style={sharedStyles.headerLeft}>
        <Text style={sharedStyles.headerLogoText}>{EMPRESA.nombre}</Text>
        <Text style={sharedStyles.headerSlogan}>{EMPRESA.eslogan}</Text>
        <Text style={sharedStyles.headerNit}>NIT: {EMPRESA.nit}</Text>
      </View>

      {/* Right: Document title + consecutivo + date */}
      <View style={sharedStyles.headerRight}>
        <Text style={sharedStyles.headerTitulo}>{titulo}</Text>
        <Text style={sharedStyles.headerConsecutivo}>{consecutivo}</Text>
        <Text style={sharedStyles.headerFecha}>{fecha}</Text>
      </View>
    </View>
  );
}
