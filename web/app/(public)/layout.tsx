import type { Metadata } from 'next'
import { CursorWrapper } from '@/components/landing/CursorWrapper'

export const metadata: Metadata = {
  title: 'López Soluciones Eléctricas – Pereira, Risaralda',
  description:
    'Energía segura, soluciones a tu medida para el Eje Cafetero. Personal certificado RETIE.',
}

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <CursorWrapper>{children}</CursorWrapper>
}
