'use client'

import { useState } from 'react'
import { getPhonicsImageSrc, hasPhonicsImage } from '@/lib/worksheetAssets'

export default function PhonicsOptionImage({ optionId, label, emoji, bg }) {
  const [failed, setFailed] = useState(!hasPhonicsImage(optionId))
  const showImage = !failed

  return (
    <div
      className={`relative flex h-36 w-full items-center justify-center overflow-hidden bg-gradient-to-br sm:h-40 ${bg}`}
    >
      {showImage ? (
        <img
          src={getPhonicsImageSrc(optionId)}
          alt={label}
          className="h-full w-full object-contain p-2 transition duration-300 group-hover:scale-105"
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
        />
      ) : (
        <span
          className="text-6xl drop-shadow-md transition group-hover:scale-110 sm:text-7xl"
          aria-hidden="true"
        >
          {emoji}
        </span>
      )}
    </div>
  )
}
