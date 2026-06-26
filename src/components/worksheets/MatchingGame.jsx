'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { playClapSound, GAME_SOUND_KEYS } from '@/lib/gameSounds'
import confetti from 'canvas-confetti'

function shuffleArray(items) {
  const arr = [...items]
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function burstConfetti() {
  confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } })
}

function ConnectionDotWithRef({ selected, connected, onClick, side, dotRef }) {
  return (
    <button
      ref={dotRef}
      type="button"
      onClick={onClick}
      disabled={connected}
      aria-label={side === 'left' ? 'نقطه اتصال' : 'نقطه اتصال'}
      className={`relative z-20 h-7 w-7 shrink-0 rounded-full border-[3px] transition-all ${
        connected
          ? 'border-emerald-500 bg-emerald-400 shadow-md shadow-emerald-200'
          : selected
            ? 'scale-125 border-violet-600 bg-violet-400 shadow-lg ring-4 ring-violet-200'
            : 'border-violet-400 bg-white hover:scale-110 hover:border-violet-500 hover:bg-violet-50'
      }`}
    >
      {connected ? <span className="text-[10px] font-bold text-white">✓</span> : null}
    </button>
  )
}

function MatchRowFixed({ image, side, selected, connected, onDotClick, dotRef }) {
  const isLeft = side === 'left'

  return (
    <div className={`flex items-center gap-3 py-1.5 ${isLeft ? 'justify-end' : 'justify-start'}`}>
      {isLeft ? (
        <>
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 border-slate-200 bg-white shadow-sm sm:h-[72px] sm:w-[72px]">
            <img src={image} alt="" className="h-full w-full object-cover" draggable={false} />
          </div>
          <ConnectionDotWithRef
            dotRef={dotRef}
            side={side}
            selected={selected}
            connected={connected}
            onClick={onDotClick}
          />
        </>
      ) : (
        <>
          <ConnectionDotWithRef
            dotRef={dotRef}
            side={side}
            selected={selected}
            connected={connected}
            onClick={onDotClick}
          />
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 border-slate-200 bg-white shadow-sm sm:h-[72px] sm:w-[72px]">
            <img src={image} alt="" className="h-full w-full object-cover" draggable={false} />
          </div>
        </>
      )}
    </div>
  )
}

function ConnectionLines({ containerRef, connections, leftRefs, rightRefs }) {
  const [lines, setLines] = useState([])

  useEffect(() => {
    function updateLines() {
      const container = containerRef.current
      if (!container) return
      const containerRect = container.getBoundingClientRect()
      const next = connections.map(({ pairId }) => {
        const leftEl = leftRefs.current.get(pairId)
        const rightEl = rightRefs.current.get(pairId)
        if (!leftEl || !rightEl) return null
        const leftRect = leftEl.getBoundingClientRect()
        const rightRect = rightEl.getBoundingClientRect()
        return {
          pairId,
          x1: leftRect.left + leftRect.width / 2 - containerRect.left,
          y1: leftRect.top + leftRect.height / 2 - containerRect.top,
          x2: rightRect.left + rightRect.width / 2 - containerRect.left,
          y2: rightRect.top + rightRect.height / 2 - containerRect.top,
        }
      }).filter(Boolean)
      setLines(next)
    }

    updateLines()
    window.addEventListener('resize', updateLines)
    return () => window.removeEventListener('resize', updateLines)
  }, [connections, containerRef, leftRefs, rightRefs])

  if (!lines.length) return null

  return (
    <svg className="pointer-events-none absolute inset-0 z-10 h-full w-full overflow-visible" aria-hidden>
      {lines.map((line) => (
        <line
          key={line.pairId}
          x1={line.x1}
          y1={line.y1}
          x2={line.x2}
          y2={line.y2}
          stroke="#10b981"
          strokeWidth="3"
          strokeLinecap="round"
        />
      ))}
    </svg>
  )
}

export default function MatchingGame({ game }) {
  const stages = game.stages || []
  const [stageIndex, setStageIndex] = useState(0)
  const [selected, setSelected] = useState(null)
  const [connectedIds, setConnectedIds] = useState(() => new Set())
  const [msg, setMsg] = useState('')
  const [stageFinished, setStageFinished] = useState(false)
  const [allFinished, setAllFinished] = useState(false)
  const [wrongFlash, setWrongFlash] = useState(false)

  const containerRef = useRef(null)
  const leftRefs = useRef(new Map())
  const rightRefs = useRef(new Map())

  const stage = stages[stageIndex]
  const pairs = stage?.pairs || []
  const totalStages = stages.length
  const isLastStage = stageIndex >= totalStages - 1

  const leftItems = useMemo(
    () => shuffleArray(pairs.map((p) => ({ pairId: p.id, image: p.imageA }))),
    [stage?.id, pairs.length],
  )
  const rightItems = useMemo(
    () => shuffleArray(pairs.map((p) => ({ pairId: p.id, image: p.imageB }))),
    [stage?.id, pairs.length],
  )

  const connections = useMemo(
    () => [...connectedIds].map((pairId) => ({ pairId })),
    [connectedIds],
  )

  const resetStage = useCallback(() => {
    setSelected(null)
    setConnectedIds(new Set())
    setStageFinished(false)
    setMsg('')
    setWrongFlash(false)
    leftRefs.current = new Map()
    rightRefs.current = new Map()
  }, [])

  useEffect(() => {
    resetStage()
  }, [stageIndex, resetStage])

  useEffect(() => {
    if (pairs.length > 0 && connectedIds.size === pairs.length) {
      setStageFinished(true)
      if (isLastStage) {
        setAllFinished(true)
        setMsg('🎉 آفرین! همه را درست وصل کردی!')
        burstConfetti()
      } else {
        setMsg(`🌟 مرحله ${stageIndex + 1} تمام شد! آماده مرحله بعدی هستی؟`)
        playClapSound(GAME_SOUND_KEYS.MATCHING)
      }
    }
  }, [connectedIds.size, pairs.length, isLastStage, stageIndex])

  function handleDotSelect(side, pairId) {
    if (stageFinished || allFinished || connectedIds.has(pairId)) return

    if (!selected) {
      setSelected({ side, pairId })
      setMsg('حالا دایره کنار تصویر مرتبط را در ستون مقابل انتخاب کن.')
      return
    }

    if (selected.side === side) {
      setSelected({ side, pairId })
      return
    }

    if (selected.pairId === pairId) {
      setConnectedIds((prev) => new Set([...prev, pairId]))
      setSelected(null)
      setMsg(`⭐ عالی! ${connectedIds.size + 1} از ${pairs.length}`)
      playClapSound(GAME_SOUND_KEYS.MATCHING)
      return
    }

    setWrongFlash(true)
    setMsg('🤔 این دو مورد به هم مربوط نیستند — دوباره امتحان کن!')
    setSelected(null)
    setTimeout(() => setWrongFlash(false), 600)
  }

  function nextStage() {
    if (stageIndex < totalStages - 1) {
      setStageIndex((i) => i + 1)
    }
  }

  function restart() {
    setStageIndex(0)
    setAllFinished(false)
    resetStage()
  }

  if (totalStages === 0) {
    return (
      <div className="rounded-3xl bg-white/90 p-8 text-center text-sm text-slate-500">
        این بازی هنوز مرحله‌ای ندارد.
        <Link href="/payment/parent/dashboard?tab=worksheets" className="mt-4 block font-bold text-navy">
          ← بازگشت
        </Link>
      </div>
    )
  }

  if (pairs.length === 0) {
    return (
      <div className="rounded-3xl bg-white/90 p-8 text-center text-sm text-slate-500">
        مرحله {stageIndex + 1} هنوز جفت تصویری ندارد.
        <Link href="/payment/parent/dashboard?tab=worksheets" className="mt-4 block font-bold text-navy">
          ← بازگشت
        </Link>
      </div>
    )
  }

  return (
    <div
      className="relative min-h-[82vh] overflow-hidden rounded-3xl p-4 sm:p-6"
      style={{ background: 'linear-gradient(135deg,#ede9fe 0%,#fce7f3 40%,#dbeafe 100%)' }}
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/payment/parent/dashboard?tab=worksheets"
          className="text-sm font-bold text-navy-light hover:text-violet-700"
        >
          ← کاربرگ‌ها
        </Link>
        <span className="rounded-full bg-white/80 px-4 py-1.5 text-xs font-bold text-violet-800 shadow">
          مرحله {stageIndex + 1} از {totalStages}
        </span>
      </div>

      <div className="rounded-3xl bg-white/90 p-4 shadow-xl ring-2 ring-violet-200 sm:p-6">
        <h1 className="text-center text-xl font-extrabold text-navy sm:text-2xl">{game.title}</h1>
        {stage.title ? (
          <p className="mt-1 text-center text-sm font-semibold text-violet-700">{stage.title}</p>
        ) : null}
        <p className="mt-2 text-center text-sm text-slate-600">
          روی دایره کنار هر تصویر کلیک کن و آن را به دایره تصویر مرتبط در ستون مقابل وصل کن.
        </p>

        <div
          ref={containerRef}
          className={`relative mx-auto mt-6 max-w-2xl ${wrongFlash ? 'animate-pulse' : ''}`}
        >
          <ConnectionLines
            containerRef={containerRef}
            connections={connections}
            leftRefs={leftRefs}
            rightRefs={rightRefs}
          />

          <div className="grid grid-cols-2 gap-4 sm:gap-8">
            <div className="space-y-1">
              <p className="mb-2 text-center text-xs font-bold text-slate-500">ستون اول</p>
              {leftItems.map((item) => (
                <MatchRowFixed
                  key={`left-${item.pairId}`}
                  image={item.image}
                  side="left"
                  selected={selected?.side === 'left' && selected.pairId === item.pairId}
                  connected={connectedIds.has(item.pairId)}
                  onDotClick={() => handleDotSelect('left', item.pairId)}
                  dotRef={(el) => {
                    if (el) leftRefs.current.set(item.pairId, el)
                    else leftRefs.current.delete(item.pairId)
                  }}
                />
              ))}
            </div>

            <div className="space-y-1">
              <p className="mb-2 text-center text-xs font-bold text-slate-500">ستون دوم</p>
              {rightItems.map((item) => (
                <MatchRowFixed
                  key={`right-${item.pairId}`}
                  image={item.image}
                  side="right"
                  selected={selected?.side === 'right' && selected.pairId === item.pairId}
                  connected={connectedIds.has(item.pairId)}
                  onDotClick={() => handleDotSelect('right', item.pairId)}
                  dotRef={(el) => {
                    if (el) rightRefs.current.set(item.pairId, el)
                    else rightRefs.current.delete(item.pairId)
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {msg ? (
          <p className="mt-5 text-center text-sm font-bold text-violet-800">{msg}</p>
        ) : null}

        <div className="mt-5 flex flex-wrap justify-center gap-3">
          {stageFinished && !allFinished ? (
            <button
              type="button"
              onClick={nextStage}
              className="rounded-2xl bg-gradient-to-l from-violet-600 to-purple-600 px-6 py-3 text-sm font-extrabold text-white shadow-lg"
            >
              مرحله بعد →
            </button>
          ) : null}
          {allFinished ? (
            <button
              type="button"
              onClick={restart}
              className="rounded-2xl bg-gradient-to-l from-emerald-500 to-teal-500 px-6 py-3 text-sm font-extrabold text-white shadow-lg"
            >
              بازی دوباره 🔄
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
