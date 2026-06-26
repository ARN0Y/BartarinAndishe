'use client'

import { useEffect, useRef } from 'react'

export default function NationalIdPinInput({ value, onChange, disabled = false, autoFocus = false }) {
  const refs = useRef([])

  const digits = Array.from({ length: 10 }, (_, i) => value[i] || '')

  useEffect(() => {
    if (autoFocus) refs.current[0]?.focus()
  }, [autoFocus])

  function updateDigit(index, char) {
    if (!/^\d?$/.test(char)) return
    const next = digits.slice()
    next[index] = char
    onChange(next.join('').slice(0, 10))
    if (char && index < 9) refs.current[index + 1]?.focus()
  }

  function handleKeyDown(index, e) {
    if (e.key === 'Backspace') {
      if (digits[index]) {
        updateDigit(index, '')
      } else if (index > 0) {
        refs.current[index - 1]?.focus()
        updateDigit(index - 1, '')
      }
      e.preventDefault()
    }
    if (e.key === 'ArrowLeft' && index > 0) refs.current[index - 1]?.focus()
    if (e.key === 'ArrowRight' && index < 9) refs.current[index + 1]?.focus()
  }

  function handlePaste(e) {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 10)
    if (!pasted) return
    onChange(pasted)
    const focusIdx = Math.min(pasted.length, 9)
    refs.current[focusIdx]?.focus()
  }

  return (
    <div className="w-full" dir="ltr">
      <div
        className="mx-auto grid w-full max-w-[min(100%,22rem)] grid-cols-10 gap-1 sm:max-w-[26rem] sm:gap-1.5"
        onPaste={handlePaste}
      >
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => { refs.current[index] = el }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={digit}
            disabled={disabled}
            aria-label={`رقم ${index + 1} کد ملی`}
            className={[
              'h-11 w-full min-w-0 rounded-lg border-2 bg-white text-center text-base font-extrabold text-navy outline-none transition sm:h-12 sm:rounded-xl sm:text-lg',
              digit ? 'border-pink-deep bg-pink-soft/30 shadow-sm' : 'border-slate-300 bg-slate-50/80',
              'focus:border-pink-deep focus:bg-white focus:ring-2 focus:ring-pink-deep/25',
              disabled ? 'opacity-60' : '',
            ].join(' ')}
            onChange={(e) => updateDigit(index, e.target.value.replace(/\D/g, ''))}
            onKeyDown={(e) => handleKeyDown(index, e)}
          />
        ))}
      </div>
    </div>
  )
}
