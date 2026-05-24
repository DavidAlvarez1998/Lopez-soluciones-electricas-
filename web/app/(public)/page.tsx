'use client';

import Nav from '@/components/landing/Nav';
import Hero from '@/components/landing/Hero';
import Servicios from '@/components/landing/Servicios';
import Sectores from '@/components/landing/Sectores';
import CotizacionPublica from '@/components/landing/CotizacionPublica';
import Contacto from '@/components/landing/Contacto';
import Footer from '@/components/landing/Footer';
import { useScrollReveal } from '@/hooks/useScrollReveal';

export default function LandingPage() {
  useScrollReveal();

  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Servicios />
        <Sectores />
        <CotizacionPublica />
        <Contacto />
      </main>
      <Footer />
    </>
  );
}
