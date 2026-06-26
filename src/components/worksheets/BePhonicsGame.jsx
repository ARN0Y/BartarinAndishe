'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { getShuffledQuestions } from '@/data/bePhonicsQuestions'
import { playClapSound, playQuestionSound, playWrongSound, stopQuestionSound, GAME_SOUND_KEYS } from '@/lib/gameSounds'
import PhonicsOptionImage from './PhonicsOptionImage'

/* ─── Data ─── */
const PRAISE = [
  '🎉 آفرین! درست گفتی!',
  '⭐ تو فوق‌العاده‌ای!',
  '🌟 عالیه! خیلی باهوشی!',
  '🏆 صددرصد درسته!',
  '✨ قهرمان واقعی!',
  '🎈 وای چه هوش بالایی!',
]
const RETRY = [
  '💪 اشکال نداره، دوباره امتحان کن!',
  '🌈 نزدیک بود! یه بار دیگه!',
  '😊 قوی باش، می‌تونی!',
  '🌸 سعی کن دوباره!',
]
const ANIMALS = ['🐻', '🐱', '🦉', '🐶', '🐰', '🐸', '🐯', '🦊']

function rand(arr) { return arr[Math.floor(Math.random() * arr.length)] }

/* ─── Canvas-confetti helpers ─── */
function burstConfetti() {
  const opts = { particleCount: 80, spread: 90, startVelocity: 45, ticks: 200, zIndex: 9999 }
  confetti({ ...opts, origin: { x: 0.3, y: 0.6 } })
  confetti({ ...opts, origin: { x: 0.7, y: 0.6 } })
}

function fireworksFinale() {
  const count = 5
  const defaults = { startVelocity: 30, spread: 360, ticks: 160, zIndex: 9999 }
  function fire(ratio, opts) {
    confetti({ ...defaults, ...opts, particleCount: Math.floor(200 * ratio) })
  }
  let i = 0
  const interval = setInterval(() => {
    const t = i / count
    fire(0.25, { spread: 26, startVelocity: 55, origin: { x: t, y: 0.55 } })
    fire(0.2,  { spread: 60, origin: { x: t + 0.1, y: 0.6 } })
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8, origin: { x: 0.3 + t * 0.4, y: 0.65 } })
    fire(0.1,  { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2, origin: { x: 0.2 + t * 0.6, y: 0.7 } })
    i++
    if (i >= count) clearInterval(interval)
  }, 250)
}

/* ─── Sub-components ─── */
function ProgressBar({ value, max }) {
  const pct = (value / max) * 100
  return (
    <div className="relative h-5 w-full overflow-hidden rounded-full bg-black/10 shadow-inner">
      <motion.div
        className="h-full rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{ background: 'linear-gradient(90deg,#f59e0b,#10b981,#6366f1,#ec4899)' }}
      />
      <span className="absolute inset-0 flex items-center justify-center text-xs font-extrabold text-white drop-shadow ltr">
        {value} / {max}
      </span>
    </div>
  )
}

function StarRating({ score, total }) {
  const stars = score >= total ? 3 : score >= Math.ceil(total * 0.7) ? 2 : score >= Math.ceil(total * 0.4) ? 1 : 0
  return (
    <div className="flex justify-center gap-2">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: i < stars ? 1 : 0.6, rotate: 0 }}
          transition={{ delay: i * 0.2, type: 'spring', stiffness: 300 }}
          className={`text-4xl ${i < stars ? '' : 'opacity-25'}`}
        >
          ⭐
        </motion.span>
      ))}
    </div>
  )
}

/* ─── Main Component ─── */
export default function BePhonicsGame() {
  // Use fixed initial values for SSR; randomize on client after mount
  const [questions, setQuestions] = useState(getShuffledQuestions)
  const TOTAL = questions.length
  const [screen, setScreen] = useState('loading')
  const [username, setUsername] = useState('')
  const [qIdx, setQIdx] = useState(0)
  const [score, setScore] = useState(0)
  const [feedback, setFeedback] = useState(null)
  const [selectedId, setSelectedId] = useState(null)
  const [msg, setMsg] = useState('')
  const [mascot, setMascot] = useState('🦉')

  useEffect(() => {
    setMascot(rand(ANIMALS))
    setQuestions(getShuffledQuestions())
    fetch('/api/parent/profile')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const firstName = data?.student?.firstName?.trim()
        setUsername(firstName || 'دوست کوچولو')
        setScreen('greeting')
      })
      .catch(() => {
        setUsername('دوست کوچولو')
        setScreen('greeting')
      })
  }, [])

  const question = questions[qIdx]

  const beginQuiz = () => {
    setQIdx(0); setScore(0); setFeedback(null); setSelectedId(null)
    setScreen('quiz')
  }

  useEffect(() => {
    if (screen !== 'quiz' || !question) return undefined
    playQuestionSound(question.id)
    return () => stopQuestionSound()
  }, [screen, qIdx, question?.id])

  const handleAnswer = (optionId) => {
    if (feedback === 'correct') return
    setSelectedId(optionId)

    if (optionId === question.correctId) {
      const nextIdx = qIdx + 1
      setFeedback('correct')
      setScore((s) => s + 1)
      setMsg(rand(PRAISE))
      burstConfetti()
      playClapSound(GAME_SOUND_KEYS.BE_PHONICS)  // fire-and-forget — never await sounds
      setTimeout(() => {
        setFeedback(null)
        setSelectedId(null)
        if (nextIdx >= TOTAL) {
          setScreen('finish')
        } else {
          setQIdx(nextIdx)
        }
      }, 1600)
    } else {
      setFeedback('wrong')
      setMsg(rand(RETRY))
      playWrongSound(GAME_SOUND_KEYS.BE_PHONICS)  // fire-and-forget
    }
  }

  const restart = () => {
    setQuestions(getShuffledQuestions())
    setQIdx(0)
    setScore(0)
    setFeedback(null)
    setSelectedId(null)
    setMsg('')
    setScreen('greeting')
  }

  useEffect(() => {
    if (screen === 'finish') {
      const t = setTimeout(fireworksFinale, 400)
      return () => clearTimeout(t)
    }
  }, [screen])

  /* screen variants */
  const pageVariants = {
    initial: { opacity: 0, y: 40, scale: 0.96 },
    animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: [0.34, 1.06, 0.64, 1] } },
    exit:    { opacity: 0, y: -30, scale: 0.96, transition: { duration: 0.25 } },
  }

  const finalMsg = ['ادامه بده، می‌تونی بهتر بشی! 💪', 'خوب بود! یه‌بار دیگه امتحان کن! 😊', 'آفرین! خیلی خوب بود! 🌟', 'تو قهرمانی! فوق‌العاده! 🏆']
  const finalIdx = score >= TOTAL ? 3 : score >= Math.ceil(TOTAL * 0.7) ? 2 : score >= Math.ceil(TOTAL * 0.4) ? 1 : 0

  return (
    <div
      className="relative min-h-[82vh] overflow-hidden rounded-3xl p-4 sm:p-6"
      style={{ background: 'linear-gradient(135deg,#fef3c7 0%,#fce7f3 25%,#ede9fe 55%,#d1fae5 80%,#dbeafe 100%)' }}
    >
      {/* decorative blobs */}
      <div className="pointer-events-none absolute -top-16 -right-16 h-52 w-52 rounded-full bg-yellow-200/50 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -bottom-16 -left-16 h-52 w-52 rounded-full bg-pink-200/50 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute top-1/2 right-1/3 h-36 w-36 rounded-full bg-violet-200/40 blur-2xl" aria-hidden />

      {/* top nav */}
      <div className="relative z-10 mb-4 flex items-center justify-between">
        <Link
          href="/payment/parent/dashboard?tab=worksheets"
          className="flex items-center gap-1.5 rounded-2xl bg-white/80 px-3 py-2 text-xs font-bold text-navy shadow ring-1 ring-white/60 backdrop-blur-sm hover:bg-white transition"
        >
          ← بازگشت
        </Link>
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
          className="flex items-center gap-2 rounded-2xl bg-white/80 px-4 py-2 text-sm font-extrabold text-violet-700 shadow ring-1 ring-white/60 backdrop-blur-sm"
        >
          <span className="text-xl">{mascot}</span>
          بازی صدای «ب»
        </motion.div>
      </div>

      <AnimatePresence mode="wait">
        {screen === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10 mx-auto max-w-sm py-20 text-center"
          >
            <p className="text-5xl">🦉</p>
            <p className="mt-4 text-sm font-bold text-violet-600">در حال آماده‌سازی بازی...</p>
          </motion.div>
        )}

        {/* ──────────── GREETING ──────────── */}
        {screen === 'greeting' && (
          <motion.div key="greeting" variants={pageVariants} initial="initial" animate="animate" exit="exit"
            className="relative z-10 mx-auto max-w-sm text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 14 }}
              className="text-7xl"
            >
              🎉
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-4 text-2xl font-extrabold text-violet-800 sm:text-3xl"
            >
              سلام {username} جان! 👋
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-3 text-base font-bold leading-9 text-slate-600"
            >
              {TOTAL} سوال درباره صدای «ب» داریم.<br />
              گزینه درست رو انتخاب کن! 🎯
            </motion.p>

            <motion.div
              className="mt-5 flex justify-center gap-3 text-3xl"
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.1, delayChildren: 0.3 } } }}
            >
              {ANIMALS.slice(0, 5).map((a, i) => (
                <motion.span
                  key={i}
                  variants={{ hidden: { scale: 0 }, visible: { scale: 1 } }}
                  transition={{ type: 'spring' }}
                  className={i === 2 ? 'text-5xl' : ''}
                >
                  {a}
                </motion.span>
              ))}
            </motion.div>

            <motion.button
              type="button"
              onClick={beginQuiz}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              className="mt-8 w-full rounded-3xl bg-gradient-to-l from-green-400 to-emerald-500 px-6 py-4 text-xl font-extrabold text-white shadow-xl"
            >
              بزن بریم! 🎮
            </motion.button>
          </motion.div>
        )}

        {/* ──────────── QUIZ ──────────── */}
        {screen === 'quiz' && question && (
          <motion.div key={`quiz-${qIdx}`} variants={pageVariants} initial="initial" animate="animate" exit="exit"
            className="relative z-10 mx-auto max-w-2xl"
          >
            {/* stats row */}
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 rounded-2xl bg-white/70 px-3 py-2 text-xs font-extrabold text-violet-700 shadow-sm backdrop-blur-sm">
                <span>{mascot}</span>
                سوال {qIdx + 1} از {TOTAL}
              </div>
              <motion.div
                key={score}
                initial={{ scale: 1.6, color: '#10b981' }}
                animate={{ scale: 1, color: '#d97706' }}
                transition={{ duration: 0.4 }}
                className="flex items-center gap-1.5 rounded-2xl bg-white/70 px-3 py-2 text-sm font-extrabold shadow-sm backdrop-blur-sm"
              >
                ⭐ {score}
              </motion.div>
            </div>

            <ProgressBar value={qIdx + 1} max={TOTAL} />

            {/* question bubble */}
            <motion.div
              layout
              className="relative mt-5 overflow-hidden rounded-3xl bg-white/85 px-6 py-5 shadow-xl ring-2 ring-violet-200 backdrop-blur-sm"
            >
              <div className="absolute right-4 top-3 text-3xl opacity-30 select-none">❓</div>
              <div className="flex items-start gap-3">
                <motion.span
                  animate={{ rotate: [0, -10, 10, 0] }}
                  transition={{ repeat: Infinity, duration: 2.5 }}
                  className="text-3xl shrink-0"
                >
                  {mascot}
                </motion.span>
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-extrabold leading-relaxed text-violet-800 sm:text-xl">
                    {question.prompt}
                  </h2>
                  <button
                    type="button"
                    onClick={() => playQuestionSound(question.id)}
                    className="mt-3 inline-flex items-center gap-2 rounded-2xl bg-violet-100 px-3 py-1.5 text-xs font-bold text-violet-700 transition hover:bg-violet-200"
                    title="شنیدن دوباره سوال"
                  >
                    🔊 پخش صدای سوال
                  </button>
                </div>
              </div>
            </motion.div>

            {/* options */}
            <motion.div
              className="mt-5 grid gap-4 sm:grid-cols-3"
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
            >
              {question.options.map((opt) => {
                const isSelected = selectedId === opt.id
                const isCorrect = opt.id === question.correctId
                const correct = isSelected && feedback === 'correct' && isCorrect
                const wrong = isSelected && feedback === 'wrong'

                return (
                  <motion.div
                    key={opt.id}
                    variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }}
                  >
                    <motion.button
                      type="button"
                      onClick={() => handleAnswer(opt.id)}
                      disabled={feedback === 'correct'}
                      animate={
                        correct ? { scale: [1, 1.12, 1], borderColor: '#22c55e' }
                        : wrong ? { x: [0, -10, 10, -8, 8, -4, 4, 0] }
                        : {}
                      }
                      transition={
                        wrong
                          ? { duration: 0.45, ease: 'easeInOut' }
                          : correct
                            ? { duration: 0.35, ease: 'easeOut' }
                            : { duration: 0.2 }
                      }
                      whileHover={{ scale: 1.05, y: -4 }}
                      whileTap={{ scale: 0.93 }}
                      className={[
                        'w-full overflow-hidden rounded-3xl bg-white shadow-lg transition-shadow',
                        correct ? 'ring-4 ring-green-400 shadow-green-200' : '',
                        wrong   ? 'ring-4 ring-red-400 shadow-red-100' : 'ring-2 ring-white/80',
                        'disabled:cursor-default',
                      ].join(' ')}
                    >
                      <PhonicsOptionImage optionId={opt.id} label={opt.label} emoji={opt.emoji} bg={opt.bg} />
                    </motion.button>

                    {/* tick / cross badge */}
                    <AnimatePresence>
                      {correct && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ type: 'spring', stiffness: 400 }}
                          className="mt-1 flex justify-center"
                        >
                          <span className="rounded-full bg-green-500 px-3 py-0.5 text-xs font-extrabold text-white shadow">
                            ✓ درسته!
                          </span>
                        </motion.div>
                      )}
                      {wrong && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          className="mt-1 flex justify-center"
                        >
                          <span className="rounded-full bg-red-400 px-3 py-0.5 text-xs font-extrabold text-white shadow">
                            ✗ اشتباه
                          </span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )
              })}
            </motion.div>

            {/* feedback message */}
            <AnimatePresence>
              {feedback && (
                <motion.div
                  key={feedback}
                  initial={{ opacity: 0, y: 18, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                  className={[
                    'mt-5 rounded-3xl px-5 py-4 text-center shadow-lg',
                    feedback === 'correct'
                      ? 'bg-gradient-to-l from-green-100 to-emerald-50 ring-2 ring-green-300'
                      : 'bg-gradient-to-l from-orange-50 to-amber-50 ring-2 ring-orange-200',
                  ].join(' ')}
                >
                  <p className={`text-base font-extrabold ${feedback === 'correct' ? 'text-green-700' : 'text-orange-600'}`}>
                    {msg}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ──────────── FINISH ──────────── */}
        {screen === 'finish' && (
          <motion.div key="finish" variants={pageVariants} initial="initial" animate="animate" exit="exit"
            className="relative z-10 mx-auto max-w-md text-center"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 14 }}
              className="text-8xl"
            >
              {score === TOTAL ? '🏆' : score >= Math.ceil(TOTAL * 0.7) ? '🌟' : '🎈'}
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-4 text-2xl font-extrabold text-violet-800 sm:text-3xl"
            >
              آفرین {username}! 🎊
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, type: 'spring' }}
              className="mt-5 rounded-3xl bg-white/85 p-6 shadow-2xl ring-2 ring-violet-200 backdrop-blur-sm"
            >
              <p className="text-sm font-bold text-slate-400">امتیاز نهایی</p>
              <motion.p
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.6, type: 'spring', stiffness: 250 }}
                className="mt-1 text-6xl font-extrabold text-violet-700"
              >
                {score}
                <span className="text-2xl text-slate-300"> / {TOTAL}</span>
              </motion.p>

              <div className="mt-4">
                <StarRating score={score} total={TOTAL} />
              </div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="mt-4 text-base font-extrabold text-slate-600"
              >
                {finalMsg[finalIdx]}
              </motion.p>
            </motion.div>

            <motion.div
              className="mt-5 grid gap-3 sm:grid-cols-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <motion.button
                type="button"
                onClick={restart}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                className="w-full rounded-3xl bg-gradient-to-l from-violet-500 to-pink-500 px-6 py-4 text-base font-extrabold text-white shadow-xl"
              >
                🔄 دوباره بازی
              </motion.button>
              <Link
                href="/payment/parent/dashboard?tab=worksheets"
                className="flex items-center justify-center rounded-3xl bg-white/85 px-6 py-4 text-base font-extrabold text-navy shadow-lg ring-2 ring-violet-100 transition hover:scale-105"
              >
                ← کاربرگ‌ها
              </Link>
            </motion.div>

            <motion.div
              className="mt-6 flex justify-center gap-3 text-3xl"
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.12, delayChildren: 0.9 } } }}
            >
              {['🌈', '⭐', '🎉', '🌸', '🏆'].map((e, i) => (
                <motion.span
                  key={i}
                  variants={{ hidden: { scale: 0 }, visible: { scale: 1 } }}
                  animate={{ y: [0, -8, 0] }}
                  transition={{ repeat: Infinity, duration: 1.8 + i * 0.2, delay: 0.9 + i * 0.12 }}
                >
                  {e}
                </motion.span>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
