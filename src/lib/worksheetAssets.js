/** مسیر فایل‌های کاربرگ تعاملی حرف «ب» */

export const BE_PHONICS_IMAGE_BASE = '/worksheets/be-phonics/images'
export const BE_PHONICS_SOUND_BASE = '/worksheets/be-phonics/sounds'
export const BE_PHONICS_QUESTION_SOUND_BASE = `${BE_PHONICS_SOUND_BASE}/questions`

/** ویس سوال‌ها — q01.mp3 تا q10.mp3 (بر اساس id سوال در bePhonicsQuestions.js) */
export function getPhonicsQuestionSoundSrc(questionId) {
  const num = String(questionId).padStart(2, '0')
  return `${BE_PHONICS_QUESTION_SOUND_BASE}/q${num}.mp3`
}

/** شناسهٔ تصویر روی دیسک (ketab2 همان ketab است) */
export function resolvePhonicsImageId(optionId) {
  if (optionId === 'ketab2') return 'ketab'
  return optionId
}

export function getPhonicsImageSrc(optionId) {
  return `${BE_PHONICS_IMAGE_BASE}/${resolvePhonicsImageId(optionId)}.png`
}

/** تصاویری که الان در public قرار دارند */
export const UPLOADED_PHONICS_IMAGES = new Set([
  'aab',
  'baba',
  'babr',
  'badkonak',
  'barf',
  'bastani',
  'ketab',
  'leb',
  'lebass',
  'seeb',
])

export function hasPhonicsImage(optionId) {
  return UPLOADED_PHONICS_IMAGES.has(resolvePhonicsImageId(optionId))
}
