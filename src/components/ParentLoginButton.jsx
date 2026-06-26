'use client'

import { useState } from 'react'
import ParentLoginModal from './ParentLoginModal'

export default function ParentLoginButton({ className = '', children, onClick }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => { onClick?.(); setOpen(true) }}
        className={className}
      >
        {children}
      </button>
      {open ? <ParentLoginModal onClose={() => setOpen(false)} /> : null}
    </>
  )
}
