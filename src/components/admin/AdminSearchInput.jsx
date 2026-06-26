'use client'

import { Search, X } from 'lucide-react'
import { inputCls } from './ui/AdminUI'

export default function AdminSearchInput({ value, onChange, placeholder = 'جستجو...' }) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputCls} pr-9`}
        placeholder={placeholder}
        autoComplete="off"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute left-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
          aria-label="پاک کردن"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}
