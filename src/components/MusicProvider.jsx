'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { Music2, Pause, Play } from 'lucide-react'

const STORAGE_KEY = 'ba-bg-music-enabled'
const DEFAULT_VOLUME = 0.28

const MusicContext = createContext(null)

function isEnabledInStorage() {
  try {
    return localStorage.getItem(STORAGE_KEY) !== '0'
  } catch {
    return true
  }
}

export function MusicProvider({ src = '/audio/background.mp3', children }) {
  const audioRef = useRef(null)
  const [enabled, setEnabled] = useState(true)
  const [playing, setPlaying] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setEnabled(isEnabledInStorage())
  }, [])

  const play = useCallback(async () => {
    const audio = audioRef.current
    if (!audio) return false
    audio.volume = DEFAULT_VOLUME
    try {
      await audio.play()
      setPlaying(true)
      return true
    } catch {
      setPlaying(false)
      return false
    }
  }, [])

  const pause = useCallback(() => {
    audioRef.current?.pause()
    setPlaying(false)
  }, [])

  useEffect(() => {
    if (!enabled || !ready) return
    if (isEnabledInStorage()) play()
  }, [enabled, ready, play])

  async function toggle() {
    if (playing) {
      pause()
      setEnabled(false)
      try { localStorage.setItem(STORAGE_KEY, '0') } catch { /* ignore */ }
      return
    }
    setEnabled(true)
    try { localStorage.setItem(STORAGE_KEY, '1') } catch { /* ignore */ }
    await play()
  }

  return (
    <MusicContext.Provider value={{ playing, toggle, ready }}>
      <audio
        ref={audioRef}
        src={src}
        loop
        preload="auto"
        onCanPlayThrough={() => setReady(true)}
        onLoadedData={() => setReady(true)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
      {children}
    </MusicContext.Provider>
  )
}

export function useMusic() {
  return useContext(MusicContext)
}

export function MusicToggleButton({ className = '' }) {
  const ctx = useMusic()
  if (!ctx) return null
  const { playing, toggle } = ctx

  return (
    <button
      type="button"
      onClick={toggle}
      className={[
        'group inline-flex h-9 items-center gap-2 rounded-lg border px-2.5 text-xs font-semibold shadow-sm transition sm:px-3.5',
        playing
          ? 'border-pink-deep/40 bg-pink-deep text-white shadow-pink-deep/15 hover:bg-rose'
          : 'border-border bg-card/95 text-foreground hover:border-pink-deep/30 hover:bg-accent',
        className,
      ].join(' ')}
      aria-label={playing ? 'قطع موسیقی' : 'پخش موسیقی'}
      title={playing ? 'قطع موسیقی' : 'پخش موسیقی'}
    >
      <span className={[
        'flex h-6 w-6 shrink-0 items-center justify-center rounded-md transition',
        playing ? 'bg-white/15 text-white' : 'bg-muted text-pink-deep group-hover:bg-pink-deep/10',
      ].join(' ')}>
        {playing ? <Pause className="h-3.5 w-3.5 fill-current" /> : <Play className="h-3.5 w-3.5 fill-current" />}
      </span>
      <Music2 className="hidden h-3.5 w-3.5 sm:block" strokeWidth={1.8} />
      <span className="hidden sm:inline">{playing ? 'در حال پخش' : 'پخش موسیقی'}</span>
    </button>
  )
}
