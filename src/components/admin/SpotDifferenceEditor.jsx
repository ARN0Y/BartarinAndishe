'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import SpotDifferenceImageBoard from '@/components/worksheets/SpotDifferenceImageBoard'
import { AdminButton } from '@/components/admin/ui/AdminUI'

const DEFAULT_RADIUS = 0.07
const MIN_RADIUS = 0.04
const MAX_RADIUS = 0.12
const NUDGE_STEP = 0.005
const NUDGE_STEP_FINE = 0.001

function clamp01(value) {
  return Math.min(1, Math.max(0, value))
}

function spotKey(spot, index) {
  return spot.id ?? spot.tempId ?? index
}

export default function SpotDifferenceEditor({ gameId, stageId }) {
  const [stage, setStage] = useState(null)
  const [spots, setSpots] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [newSpotRadius, setNewSpotRadius] = useState(DEFAULT_RADIUS)
  const [selectedIndex, setSelectedIndex] = useState(null)

  useEffect(() => {
    fetch(`/api/admin/spot-difference-games/${gameId}/stages/${stageId}`)
      .then((res) => res.json())
      .then((json) => {
        if (!json.stage) throw new Error(json.message || 'خطا')
        setStage(json.stage)
        setSpots(json.stage.spots || [])
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [gameId, stageId])

  function selectSpot(index) {
    setSelectedIndex(index)
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur()
    }
  }

  function updateSpotRadius(index, radius) {
    setSpots((prev) =>
      prev.map((spot, i) => (i === index ? { ...spot, radius } : spot)),
    )
    setSaved(false)
  }

  function updateSpotPosition(index, point) {
    setSpots((prev) =>
      prev.map((spot, i) =>
        i === index
          ? {
              ...spot,
              centerX: clamp01(point.centerX),
              centerY: clamp01(point.centerY),
            }
          : spot,
      ),
    )
    setSaved(false)
  }

  function nudgeSpotPosition(index, dx, dy) {
    setSpots((prev) =>
      prev.map((spot, i) =>
        i === index
          ? {
              ...spot,
              centerX: clamp01(spot.centerX + dx),
              centerY: clamp01(spot.centerY + dy),
            }
          : spot,
      ),
    )
    setSaved(false)
  }

  useEffect(() => {
    if (selectedIndex == null) return undefined

    function onKeyDown(event) {
      const tag = event.target?.tagName?.toLowerCase()
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return

      const step = event.shiftKey ? NUDGE_STEP_FINE : NUDGE_STEP
      let dx = 0
      let dy = 0

      switch (event.key) {
        case 'ArrowLeft':
          dx = -step
          break
        case 'ArrowRight':
          dx = step
          break
        case 'ArrowUp':
          dy = -step
          break
        case 'ArrowDown':
          dy = step
          break
        default:
          return
      }

      event.preventDefault()
      nudgeSpotPosition(selectedIndex, dx, dy)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [selectedIndex])

  function addSpot(point) {
    setSpots((prev) => {
      const next = [
        ...prev,
        {
          tempId: `temp-${Date.now()}-${prev.length}`,
          centerX: point.centerX,
          centerY: point.centerY,
          radius: newSpotRadius,
        },
      ]
      selectSpot(next.length - 1)
      return next
    })
    setSaved(false)
  }

  function removeSpot(index) {
    setSpots((prev) => prev.filter((_, i) => i !== index))
    setSelectedIndex((prev) => {
      if (prev == null) return null
      if (prev === index) return null
      if (prev > index) return prev - 1
      return prev
    })
    setSaved(false)
  }

  function handleRadiusSliderChange(value) {
    if (selectedIndex != null) {
      updateSpotRadius(selectedIndex, value)
    } else {
      setNewSpotRadius(value)
    }
  }

  async function saveSpots() {
    setSaving(true)
    setError('')
    try {
      const res = await fetch(
        `/api/admin/spot-difference-games/${gameId}/stages/${stageId}/spots`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            spots: spots.map(({ centerX, centerY, radius: r }) => ({
              centerX,
              centerY,
              radius: r || DEFAULT_RADIUS,
            })),
          }),
        },
      )
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || 'خطا در ذخیره')
      setStage(json.stage)
      setSpots(json.stage.spots)
      setSaved(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const sliderValue =
    selectedIndex != null
      ? spots[selectedIndex]?.radius ?? DEFAULT_RADIUS
      : newSpotRadius

  const selectedSpot = selectedIndex != null ? spots[selectedIndex] : null

  if (loading) {
    return <p className="py-16 text-center text-sm text-slate-400">در حال بارگذاری...</p>
  }

  if (!stage) {
    return (
      <div className="space-y-4">
        <p className="text-red-600">{error || 'مرحله یافت نشد.'}</p>
        <Link href={`/admin/dashboard/spot-difference/${gameId}`} className="text-sm font-bold text-navy">
          ← بازگشت
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href={`/admin/dashboard/spot-difference/${gameId}`}
            className="text-sm font-bold text-navy-light hover:text-pink-deep"
          >
            ← بازگشت به مراحل
          </Link>
          <h1 className="mt-2 text-xl font-extrabold text-navy">
            علامت‌گذاری — {stage.title}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            کلیک روی تصویر = تفاوت جدید | کلیک و بکشید روی دایره = جابه‌جایی | کلیدهای جهت‌نما = تنظیم دقیق
          </p>
        </div>
        <AdminButton type="button" disabled={saving} onClick={saveSpots}>
          {saving ? 'در حال ذخیره...' : saved ? '✓ ذخیره شد' : 'ذخیره تفاوت‌ها'}
        </AdminButton>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <label className="flex flex-wrap items-center gap-3 font-bold">
          <span>
            {selectedSpot
              ? `اندازه تفاوت ${selectedIndex + 1}:`
              : 'اندازه ناحیه برای تفاوت جدید:'}
          </span>
          <input
            type="range"
            min={MIN_RADIUS}
            max={MAX_RADIUS}
            step="0.005"
            value={sliderValue}
            onChange={(e) => handleRadiusSliderChange(Number(e.target.value))}
            className="w-40"
          />
        </label>

        {selectedSpot ? (
          <div className="mt-3 space-y-3 border-t border-amber-200 pt-3">
            <p className="text-xs font-bold text-violet-800">جابه‌جایی تفاوت {selectedIndex + 1}</p>
            <label className="flex flex-wrap items-center gap-3 text-xs font-bold">
              <span className="w-8">X:</span>
              <input
                type="range"
                min="0"
                max="100"
                step="0.1"
                value={selectedSpot.centerX * 100}
                onChange={(e) =>
                  updateSpotPosition(selectedIndex, {
                    centerX: Number(e.target.value) / 100,
                    centerY: selectedSpot.centerY,
                  })
                }
                className="min-w-[120px] flex-1"
              />
              <span className="w-12 text-left">{(selectedSpot.centerX * 100).toFixed(1)}%</span>
            </label>
            <label className="flex flex-wrap items-center gap-3 text-xs font-bold">
              <span className="w-8">Y:</span>
              <input
                type="range"
                min="0"
                max="100"
                step="0.1"
                value={selectedSpot.centerY * 100}
                onChange={(e) =>
                  updateSpotPosition(selectedIndex, {
                    centerX: selectedSpot.centerX,
                    centerY: Number(e.target.value) / 100,
                  })
                }
                className="min-w-[120px] flex-1"
              />
              <span className="w-12 text-left">{(selectedSpot.centerY * 100).toFixed(1)}%</span>
            </label>
            <p className="text-xs font-normal">
              دایره را بکشید، اسلایدر X/Y را حرکت دهید، یا از ← → ↑ ↓ استفاده کنید (Shift = حرکت ریز)
            </p>
            <button
              type="button"
              onClick={() => setSelectedIndex(null)}
              className="text-xs font-bold text-violet-700 hover:text-violet-900"
            >
              لغو انتخاب
            </button>
          </div>
        ) : (
          <p className="mt-2 text-xs font-normal">(دایره زرد = ناحیه‌ای که بچه باید کلیک کند)</p>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SpotDifferenceImageBoard
          src={stage.imageLeft}
          alt="تصویر اول — علامت‌گذاری"
          label="تصویر اول — کلیک برای افزودن | بکشید برای جابه‌جایی"
          spots={spots}
          selectedSpotKey={selectedIndex != null ? spotKey(spots[selectedIndex], selectedIndex) : null}
          editable
          onSpotSelect={selectSpot}
          onSpotMove={updateSpotPosition}
          onAddSpot={addSpot}
        />
        <SpotDifferenceImageBoard
          src={stage.imageRight}
          alt="تصویر دوم — پیش‌نمایش"
          label="تصویر دوم — پیش‌نمایش"
          spots={spots}
          selectedSpotKey={selectedIndex != null ? spotKey(spots[selectedIndex], selectedIndex) : null}
        />
      </div>

      <div className="rounded-2xl bg-white p-4 shadow ring-1 ring-slate-200">
        <h2 className="text-sm font-bold text-navy">لیست تفاوت‌ها ({spots.length})</h2>
        {spots.length === 0 ? (
          <p className="mt-2 text-sm text-slate-400">هنوز نقطه‌ای ثبت نشده — روی تصویر اول کلیک کنید.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {spots.map((spot, index) => {
              const selected = selectedIndex === index
              return (
                <li
                  key={spotKey(spot, index)}
                  className={`rounded-xl px-3 py-3 text-sm transition ${
                    selected ? 'bg-violet-50 ring-2 ring-violet-300' : 'bg-slate-50'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => selectSpot(index)}
                      className="text-right font-bold text-navy hover:text-violet-700"
                    >
                      تفاوت {index + 1}: X={(spot.centerX * 100).toFixed(selected ? 1 : 0)}% — Y={(spot.centerY * 100).toFixed(selected ? 1 : 0)}%
                    </button>
                    <button
                      type="button"
                      onClick={() => removeSpot(index)}
                      className="text-xs font-bold text-red-600 hover:text-red-800"
                    >
                      حذف
                    </button>
                  </div>
                  <label className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                    <span className="font-bold">اندازه:</span>
                    <input
                      type="range"
                      min={MIN_RADIUS}
                      max={MAX_RADIUS}
                      step="0.005"
                      value={spot.radius ?? DEFAULT_RADIUS}
                      onChange={(e) => {
                        selectSpot(index)
                        updateSpotRadius(index, Number(e.target.value))
                      }}
                      className="w-32"
                    />
                    <span>{Math.round((spot.radius ?? DEFAULT_RADIUS) * 100)}%</span>
                  </label>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
