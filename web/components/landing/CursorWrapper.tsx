'use client'

import { useEffect, useRef } from 'react'

export function CursorWrapper({ children }: { children: React.ReactNode }) {
  const cursorRef = useRef<HTMLDivElement>(null)
  const followerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const cursor = cursorRef.current
    const follower = followerRef.current
    if (!cursor || !follower) return

    let followerX = 0
    let followerY = 0
    let rafId: number

    const onMove = (e: MouseEvent) => {
      cursor.style.left = e.clientX + 'px'
      cursor.style.top = e.clientY + 'px'

      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        followerX = e.clientX - 20
        followerY = e.clientY - 20
        follower.style.left = followerX + 'px'
        follower.style.top = followerY + 'px'
      })
    }

    window.addEventListener('mousemove', onMove)
    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <>
      <div
        ref={cursorRef}
        className="cursor fixed pointer-events-none z-[10000] w-2 h-2 rounded-full bg-blue-glow"
        style={{ transform: 'translate(-50%, -50%)' }}
      />
      <div
        ref={followerRef}
        className="cursor-follower fixed pointer-events-none z-[9999] w-10 h-10 rounded-full border border-blue-glow/30 transition-[left,top] duration-[50ms]"
        style={{ willChange: 'left, top' }}
      />
      {children}
    </>
  )
}
