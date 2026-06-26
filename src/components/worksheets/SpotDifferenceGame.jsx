'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import SpotDifferenceImageBoard, { clickToNormalized } from '@/components/worksheets/SpotDifferenceImageBoard'
import { hitTestSpot } from '@/lib/spotDifferenceClient'
import { playClapSound, GAME_SOUND_KEYS } from '@/lib/gameSounds'
import confetti from 'canvas-confetti'

function burstConfetti() {
  confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } })
}

export default function SpotDifferenceGame({ game }) {
  const stages = game.stages || []
  const [stageIndex, setStageIndex] = useState(0)
  const [foundIds, setFoundIds] = useState(() => new Set())
  const [msg, setMsg] = useState('')
  const [stageFinished, setStageFinished] = useState(false)
  const [allFinished, setAllFinished] = useState(false)

  const stage = stages[stageIndex]
  const total = stage?.spots?.length ?? 0
  const totalStages = stages.length
  const isLastStage = stageIndex >= totalStages - 1

  useEffect(() => {
    setFoundIds(new Set())
    setStageFinished(false)
    setMsg('')
  }, [stageIndex])

  useEffect(() => {
    if (foundIds.size === total && total > 0) {
      setStageFinished(true)
      if (isLastStage) {
        setAllFinished(true)
        setMsg('🎉 آفرین! همه مراحل را تمام کردی!')
        burstConfetti()
      } else {
        setMsg(`🌟 مرحله ${stageIndex + 1} تمام شد! آماده مرحله بعدی هستی؟`)
        playClapSound(GAME_SOUND_KEYS.SPOT_DIFFERENCE)
      }
    }
  }, [foundIds.size, total, isLastStage, stageIndex])

  function handleClick(event) {
    if (stageFinished || allFinished || total === 0) return
    const point = clickToNormalized(event)
    const hit = hitTestSpot(stage.spots, point.centerX, point.centerY, foundIds)
    if (hit) {
      setFoundIds((prev) => new Set([...prev, hit.id]))
      setMsg(`⭐ عالی! ${foundIds.size + 1} از ${total}`)
      playClapSound(GAME_SOUND_KEYS.SPOT_DIFFERENCE)
    } else {
      setMsg('🤔 اینجا تفاوتی نیست، دوباره نگاه کن!')
    }
  }

  function nextStage() {
    if (stageIndex < totalStages - 1) {
      setStageIndex((i) => i + 1)
    }
  }

  function restart() {
    setStageIndex(0)
    setFoundIds(new Set())
    setStageFinished(false)
    setAllFinished(false)
    setMsg('')
  }

  if (totalStages === 0) {
    return (
      <div
        className="relative min-h-[82vh] overflow-hidden rounded-3xl p-4 sm:p-6"
        style={{ background: 'linear-gradient(135deg,#fef9c3 0%,#fce7f3 40%,#dbeafe 100%)' }}
      >
        <div className="rounded-3xl bg-white/90 p-8 text-center text-sm text-slate-500">
          این بازی هنوز توسط مدیریت تکمیل نشده است.
        </div>
      </div>
    )
  }

  return (
    <div
      className="relative min-h-[82vh] overflow-hidden rounded-3xl p-4 sm:p-6"
      style={{ background: 'linear-gradient(135deg,#fef9c3 0%,#fce7f3 40%,#dbeafe 100%)' }}
    >
      <div className="relative z-10 mb-4 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/payment/parent/dashboard?tab=worksheets"
          className="rounded-2xl bg-white/90 px-3 py-2 text-xs font-bold text-navy shadow ring-1 ring-white/60"
        >
          ← بازگشت
        </Link>
        <div className="rounded-2xl bg-white/90 px-4 py-2 text-sm font-extrabold text-violet-700 shadow">
          🔍 {game.title}
        </div>
        <div className="flex gap-2">
          <div className="rounded-2xl bg-violet-100 px-4 py-2 text-sm font-extrabold text-violet-800">
            مرحله {stageIndex + 1} / {totalStages}
          </div>
          <div className="rounded-2xl bg-amber-100 px-4 py-2 text-sm font-extrabold text-amber-800">
            {foundIds.size} / {total}
          </div>
        </div>
      </div>

      {total === 0 ? (
        <div className="rounded-3xl bg-white/90 p-8 text-center text-sm text-slate-500">
          این مرحله هنوز توسط مدیریت تکمیل نشده است.
        </div>
      ) : (
        <>
          <p className="mb-4 text-center text-sm font-bold text-violet-800">
            {stage.title || `مرحله ${stageIndex + 1}`} — {total} تفاوت را پیدا کن!
          </p>
          <div className="grid gap-4 lg:grid-cols-2">
            <SpotDifferenceImageBoard
              src={stage.imageLeft}
              alt="تصویر اول"
              label="تصویر اول"
              spots={stage.spots}
              foundIds={foundIds}
              interactive={!stageFinished}
              mode="play"
              onImageClick={handleClick}
            />
            <SpotDifferenceImageBoard
              src={stage.imageRight}
              alt="تصویر دوم"
              label="تصویر دوم"
              spots={stage.spots}
              foundIds={foundIds}
              interactive={!stageFinished}
              mode="play"
              onImageClick={handleClick}
            />
          </div>
        </>
      )}

      {msg ? (
        <div className="mt-5 rounded-3xl bg-white/90 px-5 py-4 text-center text-base font-extrabold text-violet-800 shadow-lg ring-2 ring-violet-200">
          {msg}
        </div>
      ) : null}

      {stageFinished && !allFinished ? (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={nextStage}
            className="rounded-2xl bg-gradient-to-l from-emerald-500 to-teal-500 px-8 py-3 text-sm font-bold text-white shadow-lg transition hover:scale-[1.02]"
          >
            مرحله بعد ➡️
          </button>
        </div>
      ) : null}

      {allFinished ? (
        <div className="mt-4 flex justify-center gap-3">
          <button
            type="button"
            onClick={restart}
            className="rounded-2xl bg-gradient-to-l from-violet-500 to-pink-500 px-6 py-3 text-sm font-bold text-white shadow-lg"
          >
            🔄 بازی دوباره
          </button>
        </div>
      ) : null}
    </div>
  )
}
