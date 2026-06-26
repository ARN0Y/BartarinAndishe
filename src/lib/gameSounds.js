import { getPhonicsQuestionSoundSrc } from '@/lib/worksheetAssets'
import {
  GAME_SOUND_KEYS,
  getGameCorrectSoundSrc,
  getGameWrongSoundSrc,
} from '@/lib/gameSoundPaths'

export { GAME_SOUND_KEYS }

let currentQuestionAudio = null

export function stopQuestionSound() {
  if (!currentQuestionAudio) return
  currentQuestionAudio.pause()
  currentQuestionAudio.currentTime = 0
  currentQuestionAudio = null
}

/** پخش ویس سوال (فایل q01.mp3 … q10.mp3 در پوشه questions) */
export async function playQuestionSound(questionId) {
  stopQuestionSound()
  if (!questionId) return
  const audio = new Audio(getPhonicsQuestionSoundSrc(questionId))
  audio.volume = 1
  currentQuestionAudio = audio
  try {
    await audio.play()
  } catch {
    /* فایل موجود نیست یا پخش خودکار مسدود است */
  }
}

/** صداهای کوتاه بازی — با Web Audio API */

let audioCtx

function getCtx() {
  if (typeof window === 'undefined') return null
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  }
  return audioCtx
}

async function ensureCtx() {
  const ctx = getCtx()
  if (!ctx) return null
  if (ctx.state === 'suspended') await ctx.resume()
  return ctx
}

function note(ctx, freq, startTime, duration, gainVal = 0.15, type = 'triangle') {
  const osc = ctx.createOscillator()
  const g = ctx.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, startTime)
  g.gain.setValueAtTime(gainVal, startTime)
  g.gain.exponentialRampToValueAtTime(0.001, startTime + duration)
  osc.connect(g)
  g.connect(ctx.destination)
  osc.start(startTime)
  osc.stop(startTime + duration + 0.01)
}

/** دست‌زدن با نویز سفید (ضربه‌های کوتاه) */
function clap(ctx, startTime) {
  const bufferSize = ctx.sampleRate * 0.05
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 3)
  }
  const src = ctx.createBufferSource()
  src.buffer = buffer
  const g = ctx.createGain()
  g.gain.setValueAtTime(0.35, startTime)
  g.gain.exponentialRampToValueAtTime(0.001, startTime + 0.08)
  const filter = ctx.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.value = 1200
  filter.Q.value = 0.8
  src.connect(filter)
  filter.connect(g)
  g.connect(ctx.destination)
  src.start(startTime)
}

/** صدای آوا/سوت بدون رمق برای جواب غلط */
function sadTone(ctx, startTime) {
  const osc = ctx.createOscillator()
  const g = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(400, startTime)
  osc.frequency.exponentialRampToValueAtTime(200, startTime + 0.35)
  g.gain.setValueAtTime(0.15, startTime)
  g.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4)
  osc.connect(g)
  g.connect(ctx.destination)
  osc.start(startTime)
  osc.stop(startTime + 0.45)
}

async function playMp3(src, volume) {
  const audio = new Audio(src)
  audio.volume = volume
  await audio.play()
}

function playGeneratedClap(ctx) {
  const t = ctx.currentTime
  note(ctx, 523, t, 0.12, 0.12)
  note(ctx, 659, t + 0.1, 0.12, 0.12)
  note(ctx, 784, t + 0.2, 0.12, 0.12)
  note(ctx, 1047, t + 0.3, 0.18, 0.14)
  clap(ctx, t + 0.05)
  clap(ctx, t + 0.22)
  clap(ctx, t + 0.38)
}

/** @param {string} gameKey — یکی از GAME_SOUND_KEYS */
export async function playClapSound(gameKey = GAME_SOUND_KEYS.BE_PHONICS) {
  try {
    await playMp3(getGameCorrectSoundSrc(gameKey), 0.75)
    return
  } catch { /* fallback to generated */ }

  const ctx = await ensureCtx()
  if (!ctx) return
  playGeneratedClap(ctx)
}

/** @param {string} gameKey — یکی از GAME_SOUND_KEYS */
export async function playWrongSound(gameKey = GAME_SOUND_KEYS.BE_PHONICS) {
  try {
    await playMp3(getGameWrongSoundSrc(gameKey), 0.5)
    return
  } catch { /* fallback */ }

  const ctx = await ensureCtx()
  if (!ctx) return
  sadTone(ctx, ctx.currentTime)
}

export function playCorrectSound(gameKey = GAME_SOUND_KEYS.BE_PHONICS) {
  return playClapSound(gameKey)
}
