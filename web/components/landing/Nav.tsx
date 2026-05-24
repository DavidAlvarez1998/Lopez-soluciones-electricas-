'use client';

import { useEffect, useState } from 'react';

const NAV_LINKS = [
  { href: '#servicios', label: 'Servicios' },
  { href: '#sectores', label: 'Sectores' },
  { href: '#cotizacion', label: 'Cotización' },
  { href: '#contacto', label: 'Contacto' },
];

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const closeMenu = () => {
    setMenuOpen(false);
    document.body.style.overflow = '';
  };

  const toggleMenu = () => {
    const next = !menuOpen;
    setMenuOpen(next);
    document.body.style.overflow = next ? 'hidden' : '';
  };

  const handleLinkClick = () => {
    if (window.innerWidth <= 992) closeMenu();
  };

  return (
    <nav
      className={`fixed top-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-[1200px] z-[1000] flex items-center justify-between px-10 rounded-[100px] border border-white/10 transition-all duration-300 ${
        scrolled
          ? 'py-2.5 bg-navy/80 backdrop-blur-xl top-2'
          : 'py-3 bg-navy/40 backdrop-blur-xl'
      }`}
      style={{ boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}
    >
      {/* Logo */}
      <a href="#inicio" className="font-display text-2xl font-black tracking-wide text-off-white no-underline">
        LÓPEZ <span className="text-blue-glow">⚡</span>
      </a>

      {/* Hamburger */}
      <button
        className="lg:hidden flex flex-col gap-1.5 cursor-pointer z-[101] p-1.5"
        onClick={toggleMenu}
        aria-label="Menú"
      >
        <span
          className={`block w-7 h-0.5 bg-off-white rounded-sm transition-transform duration-300 ${
            menuOpen ? 'translate-y-2 rotate-45' : ''
          }`}
        />
        <span
          className={`block w-7 h-0.5 bg-off-white rounded-sm transition-opacity duration-300 ${
            menuOpen ? 'opacity-0' : ''
          }`}
        />
        <span
          className={`block w-7 h-0.5 bg-off-white rounded-sm transition-transform duration-300 ${
            menuOpen ? '-translate-y-2 -rotate-45' : ''
          }`}
        />
      </button>

      {/* Links */}
      <ul
        className={`
          fixed top-0 h-screen w-72 bg-navy flex-col justify-center items-center gap-10 z-[100]
          border-l border-white/10 transition-all duration-[400ms] ease-[cubic-bezier(0.4,0,0.2,1)]
          lg:static lg:h-auto lg:w-auto lg:bg-transparent lg:flex-row lg:gap-8 lg:flex lg:border-none lg:p-0
          ${menuOpen ? 'right-0 flex' : '-right-full hidden lg:flex'}
        `}
        style={{ boxShadow: menuOpen ? '-10px 0 30px rgba(0,0,0,0.5)' : 'none' }}
      >
        {NAV_LINKS.map((link) => (
          <li key={link.href}>
            <a
              href={link.href}
              onClick={handleLinkClick}
              className="text-brand-gray hover:text-off-white text-sm font-medium tracking-widest uppercase transition-colors duration-200"
            >
              {link.label}
            </a>
          </li>
        ))}
        {/* Mobile CTA */}
        <li className="lg:hidden">
          <a
            href="https://wa.me/573004513435"
            target="_blank"
            rel="noopener noreferrer"
            onClick={closeMenu}
            className="bg-blue-bright text-white px-8 py-3 rounded font-semibold tracking-wide"
          >
            Contáctanos ⚡
          </a>
        </li>
      </ul>

      {/* Desktop CTA */}
      <a
        href="https://wa.me/573004513435"
        target="_blank"
        rel="noopener noreferrer"
        className="hidden lg:inline-block bg-blue-bright hover:bg-blue-glow text-white px-5 py-2 rounded text-sm font-semibold tracking-wide transition-colors duration-200"
      >
        Contáctanos ⚡
      </a>
    </nav>
  );
}
