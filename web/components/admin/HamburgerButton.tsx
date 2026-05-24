'use client'

import { useSidebar } from '@/contexts/SidebarContext'

export function HamburgerButton() {
  const { toggle } = useSidebar()

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Abrir menú"
      className="md:hidden text-brand-gray hover:text-off-white transition text-xl leading-none"
    >
      ☰
    </button>
  )
}
